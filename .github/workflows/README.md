# GitHub Actions Workflows for Money Keeper

This directory contains GitHub Actions workflows for CI/CD of the Money Keeper project.

## Workflows

### e2e-gke.yml
Main workflow for end-to-end testing with frontend on GKE and backend on GitHub runner.

- **Trigger**: Manual (`workflow_dispatch`) with branch input.
- **Jobs**:
  - `lint-workflows`: Lint all workflow files with actionlint.
  - `build-images`: Build and push Docker images (reusable).
  - `deploy-backend`: Deploy backend to runner (reusable).
  - `deploy-frontend`: Deploy frontend to GKE (reusable).
  - `run-e2e`: Run Playwright tests (reusable).
  - `cleanup`: Clean up resources (reusable).

### Reusable Workflows
- `build-images.yml`: Builds backend and frontend images.
- `deploy-backend.yml`: Starts backend with DB and ngrok.
- `deploy-frontend.yml`: Deploys frontend to GKE using Helm.
- `run-e2e.yml`: Runs E2E tests with caching.
- `cleanup.yml`: Deletes deployments and stops services.

## Actions
- `setup-gcp`: Composite action to authenticate and setup GCP for GKE.

## Setup
1. Set repository variables: `GKE_CLUSTER`, `GKE_ZONE`.
2. Set secrets: `GCP_SA_KEY`, `ORACLE_PASSWORD_SECRET`, `NGROK_AUTH_TOKEN`.
3. Ensure Helm chart in `k8s/` is configured.

## Best Practices
- Uses concurrency to cancel old runs.
- Timeouts on jobs to prevent hangs.
- Caching for faster builds.
- Linting for quality.
- Modular design for reusability.