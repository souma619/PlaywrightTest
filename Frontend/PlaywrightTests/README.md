# jumpstarter-web-ui

This is a monorepo that includes all source assets related to frontends related to the Jumpstarter Kitchen Remodel project for MasterBrand. It includes packages that are both proofs-of-concept and final products. The monorepo itself was scaffolded by, and is scripted via, [TurboRepo](). Most packages in this repository leverage React and it's associated dependencies. Please see below for a quick summary of the packages included in this repository.

## Packages

### ./apps

These packages represent web applications that are deployed to either static web sites or NodeJS server applications.

| package                | description                                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| jumpstarter            | This is the MVP application for Jumpstarter Kitchen Remodel. It is a React app, scaffolded with Vite.                                                                                        |
| jumpstarter-admin      | This is the admin UI for Jumpstarter. It provides management functions for configuring the MVP app.                                                                                          |

### ./packages

These packages provide common components and services used across the `apps`.

| package | description                                                                                                                                                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| budget | Contains the budget feature for Jumpstarter. |
| common | Contains common assets for Jumpstarter features. |
| config  | This package provides standard configurations for TypeScript, ESLint, Jest, and other developer experience tools and resources. These configurations are intended to be used consistently across all packages included in this monorepo.       |
| design | Contains the design feature for Jumpstarter. |
| icebreaker | Contains the icebreaker feaure for Jumpstarter. | 
| remodel-profile | Contains the finalized remodel profile feature for Jumpstarter. |
| style-profile   | This package contains the assets required to implement the 


## Devlopment Guide

### Prerequisites

- [Git](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-18-04)
- [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install) or other Linux shell (e.g., GitBash, etc.)
- NodeJS 18+ (recommend using [nvm](https://github.com/nvm-sh/nvm) to manage available NodeJS versions)

NOTE: all commands documented here assume you are using a Bash shell on a Linux OS

### Getting Started

#### Get Package Dependencies

From repo root (one time only):
```bash
$ npm install
```


#### Running Jumpstarter
From the root of the repository, execute the following command:

```bash
$ npm run dev
```

## Contributing

- `main` branch is protected, all work must be done on feature branches
- `git commit` comments must have a prefix (e.g., fix: chore: feat: , etc.) indicating the nature of the changes. See [https://commitlint.js.org/](https://commitlint.js.org/)
- `git push` will run a full build prior to pushing a feature branch
- PRs on feature branches will start a pipeline build which must succeed to complete a PR
