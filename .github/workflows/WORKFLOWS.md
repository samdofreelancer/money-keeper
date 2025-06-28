# GitHub Reusable Workflows for Money-Keeper Project

This document describes the reusable GitHub workflows for building and pushing Docker images for the Money-Keeper project.

## Workflows

### Build Frontend Image

- **File:** `.github/workflows/build-frontend-image.yml`
- **Purpose:** Builds and pushes the Docker image for the frontend application.
- **Trigger:** This is a reusable workflow triggered via `workflow_call`.
- **Inputs:**
  - `REGISTRY` (string, required): The container registry to push the image to (e.g., `ghcr.io/username`).
  - `IMAGE_TAG` (string, required): The tag to apply to the image (e.g., `latest`, `v1.0.0`).

- **Image Tag Format:**  
  The image is tagged as `${{ REGISTRY }}/money-keeper-frontend-image:${{ IMAGE_TAG }}`.

### Build Backend Image

- **File:** `.github/workflows/build-backend-image.yml`
- **Purpose:** Builds and pushes the Docker image for the backend application.
- **Trigger:** This is a reusable workflow triggered via `workflow_call`.
- **Inputs:**
  - `REGISTRY` (string, required): The container registry to push the image to.
  - `IMAGE_TAG` (string, required): The tag to apply to the image.

- **Image Tag Format:**  
  The image is tagged as `${{ REGISTRY }}/money-keeper-backend-image:${{ IMAGE_TAG }}`.

## Usage

To use these reusable workflows in your own workflow, you can call them like this:

```yaml
jobs:
  build-frontend:
    uses: ./.github/workflows/build-frontend-image.yml
    with:
      REGISTRY: ghcr.io/your-username
      IMAGE_TAG: latest

  build-backend:
    uses: ./.github/workflows/build-backend-image.yml
    with:
      REGISTRY: ghcr.io/your-username
      IMAGE_TAG: latest
```

Replace `ghcr.io/your-username` and `latest` with your desired registry and tag.

## Notes

- These workflows use Docker Buildx for building multi-platform images.
- Docker layer caching is enabled to speed up builds.
- Login to GitHub Container Registry is handled automatically using the GitHub token.

If you have any questions or need assistance, please refer to the project maintainers.

## Backward Compatibility Notice

Previously, some test workflows may have been triggered directly on pull requests or pushes. With the current setup, these test workflows are now triggered exclusively through the **Pull Request Quality Gate** workflow (`.github/workflows/pull-request-quality-gate.yml`).

### What this means for users and automation:

- To run tests on pull requests or pushes, the **Pull Request Quality Gate** workflow must be triggered.
- Direct triggers on individual test workflows (unit, e2e, integration) may no longer run automatically.
- Update any automation or CI/CD pipelines to trigger the quality gate workflow instead of individual test workflows.

If you rely on running tests directly, please adjust your workflows accordingly or contact the project maintainers for assistance.
