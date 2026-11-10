# API Test Automation for Quality Gates
 
## Introduction 📋
 
This project automates API tests (Health Check, HeartBeat, and Smoke) to enforce quality gates across environments:
- **INT** (Integration)
- **DEV** (Development)
- **UAT** (User Acceptance Testing)
 
Designed to validate critical API functionality before promoting builds between environments.
 
---
 
## Getting Started 🚀
 
### Prerequisites
- [Bruno App](https://www.usebruno.com/) installed
- Access to Azure Repositories for the collection/environment files
 
### Setup Process
 
1. **Install Bruno**  
Download and install Bruno from [official website](https://www.usebruno.com/).
 
2. **Import Resources**  
   - **Collections/Folders**: `File > Import > Choose collection/folder`
     - **Health Check Tests**: Confirms the basic verification of CMS, Design, Feature Flag , Interview, Project Profile , Style Api's are working as expected
     - **HeartBeat Tests**: Confirms the basic verification of rebode heartbeat Api.
     - **Smoke Tests**: Confirms the basic verification of Dealer List, Image Generation, Image Analyser, JumpStarter flow(IceBreaker, Style, Design, Budget), Measurement, User Details, Zip Code Api's are working as expoected
   - **Environments**: Import `INT`, `DEV`, and `UAT` environment files via `Environments` sidebar
 
3. **Execute Tests**  
   Run existing scripts from the Bruno interface to verify setup.
 
4. **Modify & Commit Changes**  
   - Add/update API requests in Bruno
   - Save changes locally
   - Commit updates to Azure Repo
 
5. **Build and Test**
   - Navigate to folder azure-pipelines and update script if required.
   - Store Secret keys in variable group 'qe-test-automation-variables'
   - Validate and run the pipeline across different environments
   
