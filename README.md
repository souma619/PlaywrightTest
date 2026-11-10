# Quality Gates Test Automation

Automated quality gates for a multi-environment web platform. The repository combines **API tests (Bruno)**, **UI end-to-end tests (Playwright + TypeScript)** and **load-test assets (JMeter)**, all wired into **Azure Pipelines** so a build can only be promoted between **DEV → INT → UAT** after it passes.

---

## Table of contents

1. [Why this exists](#why-this-exists)
2. [Architecture at a glance](#architecture-at-a-glance)
3. [Repository layout](#repository-layout)
4. [Prerequisites](#prerequisites)
5. [Quick start](#quick-start)
6. [Test layers](#test-layers)
7. [CI/CD pipelines](#cicd-pipelines)
8. [Configuration and secrets](#configuration-and-secrets)
9. [Reports and coverage](#reports-and-coverage)
10. [Contributing](#contributing)
11. [Known limitations](#known-limitations)

---

## Why this exists

Releasing across several environments is risky when "is the environment healthy?" is answered by hand. This project turns that question into automated, repeatable gates:

| Gate | Question it answers | Tooling | Typical runtime |
| --- | --- | --- | --- |
| Health check / heartbeat | Are the services up and reachable? | Bruno CLI | seconds |
| API smoke | Do the critical API flows respond correctly? | Bruno CLI | minutes |
| API end-to-end | Does a full user journey work across services? | Bruno CLI | minutes |
| UI regression | Does the real UI work for a real user? | Playwright | up to hours |
| Load (optional) | Does it hold up under traffic? | JMeter | on demand |

## Architecture at a glance

```
            ┌────────────────────────┐
 commit ──▶ │  Build pipeline        │──▶ static website artifact
            └────────────────────────┘
                         │
          ┌──────────────┴───────────────┐
          ▼                              ▼
 ┌─────────────────┐           ┌──────────────────────┐
 │ API gates       │           │ UI gates             │
 │ Bruno CLI       │           │ Playwright (Chromium)│
 │ health → smoke  │           │ served from artifact │
 │ → E2E           │           │ via local http-server│
 └─────────────────┘           └──────────────────────┘
          │                              │
          └──────────────┬───────────────┘
                         ▼
          JUnit / HTML reports  →  pipeline results
```

## Repository layout

```
.
├── Backend/
│   └── BrunoTestScripts/        # Bruno collections (one folder per collection)
│       ├── Health Check Smoke Tests/
│       ├── HeartBeat Tests/
│       ├── Smoke Tests/
│       ├── E2E Test/
│       ├── WarmUp/
│       ├── iAM/                 # identity/auth API collection
│       └── ...                  # each collection has environments/{DEV,INT,UAT}.bru
├── Frontend/
│   └── PlaywrightTests/
│       ├── ui_tests/            # *.spec.ts test suites, grouped by page/feature
│       ├── ui_pages/            # Page Object Model classes
│       ├── helpers/             # OTP/email login, waits, logging, Excel reporter
│       ├── analysers/           # DOM analyser + generated test-case drafts
│       ├── constants/           # shared selectors
│       └── playwright.config.js
├── Jmeter/                      # load-test plans (.jmx)
└── azure-pipelines/             # YAML pipelines (PR, nightly, on-demand)
```

## Prerequisites

- Node.js 20.x
- npm (or pnpm)
- [Bruno](https://www.usebruno.com/) desktop app (authoring) and `@usebruno/cli` (CI and local CLI runs)
- Access to the Azure DevOps project and the `qe-test-automation-variables` variable group
- A Gmail API OAuth client if you need the email-OTP login helpers (see [Configuration and secrets](#configuration-and-secrets))

## Quick start

### API tests (Bruno)

```bash
npm install -g @usebruno/cli

cd "Backend/BrunoTestScripts/Health Check Smoke Tests"
bru run --env UAT --reporter-html results.html
```

To author or edit requests, open the collection folder in the Bruno app (`File > Open Collection`), pick an environment, run, then commit the changed `.bru` files.

### UI tests (Playwright)

```bash
cd Frontend/PlaywrightTests
npm install
npx playwright install chromium

# create a local .env (never commit it); see "Configuration and secrets"
npx playwright test ui_tests/SmokePageTests
npx playwright show-report playwright-report/html-report
```

Run a single suite or test:

```bash
npx playwright test ui_tests/BudgetPageTests --headed
npx playwright test -g "footer links"
```

## Test layers

### 1. Bruno API collections

| Collection | Purpose |
| --- | --- |
| Health Check Smoke Tests | Basic availability of each backend service |
| HeartBeat Tests | Gateway heartbeat endpoint |
| Smoke Tests | Critical API flows across the user journey |
| E2E Test | Ordered, numbered requests simulating a full journey (create, update, read, clean up) |
| WarmUp | Primes services/caches before the UI run |
| iAM / User Management | Identity, token and user lifecycle APIs |

Requests are numbered where order matters. Each collection ships `DEV`, `INT` and `UAT` environment files.

### 2. Playwright UI suites

- **Page Object Model**: one class per page in `ui_pages/`, selectors centralised in `constants/selector.ts`.
- **Authentication**: helpers register or sign in through an email one-time-passcode flow by reading the message via the Gmail API.
- **Coverage**: a custom fixture collects Istanbul browser coverage and writes it to `.nyc_output`.
- **Reporting**: HTML and JUnit reports, plus an Excel reporter for non-technical stakeholders.
- **Page analyser** (`analysers/`): extracts headings, buttons, links and images from a live page and drafts baseline test cases from them. Treat the output as a starting point for review, not as finished tests.

### 3. JMeter

Load-test plans live in `Jmeter/`. They are not part of the default gates.

## CI/CD pipelines

| Pipeline file | Trigger | What it does |
| --- | --- | --- |
| `azure-pipelines-apitestping-pr-build.yml` | Pull request | Fast API ping checks |
| `azure-pipelines-apitestping-build.yml` | Build | API ping checks on the target environment |
| `jumpstarter-bruno-smoketests.yml` | Manual | Runs the selected Bruno collection(s) against the chosen environment |
| `jumpstarter-playwright-ui-tests.yml` | Manual | Downloads a specific build artifact, serves it locally and runs the UI suite |
| `jumpstarter-playwright-ui-tests-daily-builds.yml` | Nightly schedule | Full regression run |

Parameters shared by the manual pipelines: `environment` (`dev`, `uat`, `int`) and, for the UI pipeline, `sourceBuildId` of the website build to test.

## Configuration and secrets

| Item | Where it lives |
| --- | --- |
| Pipeline secrets | Azure DevOps variable group `qe-test-automation-variables` |
| Local UI settings (`ui_base_url`, `environment`, …) | `Frontend/PlaywrightTests/.env` (git-ignored) |
| Bruno secrets | Bruno secret variables or pipeline variables, never plain text in `.bru` files |
| Gmail OAuth client and token | Local files or a secret store, never committed |

> **Never commit** OAuth client files, tokens, Playwright `storageState*.json`, HTML reports that embed request data, or environment files that contain keys. Add them to `.gitignore` and rotate anything that was ever committed.

## Reports and coverage

| Output | Location |
| --- | --- |
| Playwright HTML report | `Frontend/PlaywrightTests/playwright-report/html-report` |
| JUnit XML | `Frontend/PlaywrightTests/test-results/junit-results.xml` |
| Browser coverage (Istanbul) | `.nyc_output/` |
| Bruno HTML/JUnit | `results/` folder created by the pipeline |

## Contributing

1. Branch from `main`; do not push directly.
2. Add API requests in Bruno, UI tests under `ui_tests/` with a matching page object under `ui_pages/`.
3. Prefer web-first assertions (`expect(locator)...`) over fixed sleeps.
4. Use conventional commit prefixes (`feat:`, `fix:`, `chore:`, `test:`).
5. Run the relevant suite locally against `DEV` before opening a PR.

## Known limitations

- UI suites run serially (`workers: 1`) for data isolation, which lengthens nightly runs.
- OTP extraction relies on a numeric pattern in the email body and can pick up the wrong number if the template changes.
- Generated test cases from the page analyser mirror current behaviour and therefore need human review.
- Generated artefacts (logs, reports, screenshots) should be built in CI, not stored in the repo.

## License

Add your license here (internal use / MIT / Apache-2.0).
