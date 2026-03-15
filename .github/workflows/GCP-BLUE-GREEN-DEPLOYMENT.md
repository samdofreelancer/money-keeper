# GCP Blue-Green Deployment Workflow Documentation

## Overview

This GitHub Actions workflow implements a sophisticated multi-phase blue-green deployment strategy for the Money Keeper application on Google Cloud Platform (GCP). It enables safe, controlled releases with QA testing gates and zero-downtime deployments.

## Deployment Architecture

```
                    moneykeeper.com (Prod-VIP)
                            ↓
                    ┌───────────────┐
                    │  GCLB Load    │
                    │  Balancer     │
                    └───────────────┘
                       ↙          ↖
                   50%           50%
                  ↙                ↖
        ┌──────────────┐     ┌──────────────┐
        │ CL1 (Green)  │     │ CL2 (Blue)   │
        │   V2 (New)   │     │   V2 (New)   │
        └──────────────┘     └──────────────┘
               ↓ VPN              ↓ VPN
         On-prem Backend (Centralized)
```

## Workflow Phases

### Phase 1: Isolation & Deploy CL1
- **Duration:** ~10-15 minutes
- **Steps:**
  1. Set GCLB weight for CL1 to 0% (isolate from production)
  2. Deploy Frontend V2 to CL1
  3. Configure Test-VIP proxy to point to CL1 (.51)
- **Outcome:** CL1 ready for testing, no production traffic

### Phase 2: Internal QA Testing
- **Duration:** Variable (manual approval required)
- **Steps:**
  1. QA team accesses `https://<TEST-VIP-PROXY>`
  2. Tests Frontend V2 functionality
  3. Validates hybrid calls to on-prem backend
  4. Verifies data integrity
- **Approval:** Manual approval required to proceed to Phase 3
- **Outcome:** V2 validated in isolated test environment

### Phase 3: Production Switch to CL1
- **Duration:** ~2-5 minutes
- **Steps:**
  1. Set GCLB weight: CL1 = 100%, CL2 = 0%
  2. Production traffic switches to V2 on CL1
  3. Monitor metrics and error rates
- **Outcome:** 100% production traffic on CL1 (V2)

### Phase 4: Update Cluster 2
- **Duration:** ~10-15 minutes
- **Steps:**
  1. Deploy Frontend V2 to CL2
  2. Set GCLB weight: CL1 = 50%, CL2 = 50%
  3. Activate active-active configuration
- **Outcome:** Both clusters running V2 with balanced traffic

### Phase 5: Production Test (Full V2)
- **Duration:** ~5 minutes (validation only)
- **Monitoring:**
  - Error rates from both clusters
  - Hybrid backend calls
  - User response times
  - Traffic distribution
- **Outcome:** Deployment complete, full V2 in production

## Prerequisites

### GCP Resources Required

1. **GKE Clusters:**
   - Cluster 1 (Green): `cluster-1-green` (or custom name)
   - Cluster 2 (Blue): `cluster-2-blue` (or custom name)
   - Both in same zone for optimal network performance

2. **Google Cloud Load Balancer (GCLB):**
   - Name: `prod-vip-lb` (or custom name)
   - Configured with backend services for both clusters
   - Health checks configured on both backends

3. **Cloud VPN:**
   - Connected to on-prem backend
   - Routes from clusters to on-prem network

4. **Service Account:**
   - With permissions:
     - `container.clusters.get`
     - `container.operations.*`
     - `compute.backendServices.get`
     - `compute.backendServices.update`
     - `compute.forwardingRules.get`
     - `compute.backendServices.getHealth`

5. **Workload Identity:**
   - Federated identity pool for GitHub Actions
   - Service account bound to GitHub repository

### On-Premises Setup

1. **Test-VIP Proxy (`.51`):**
   - Configured to route to CL1 during testing phase
   - Connected to GCP via Cloud VPN

2. **Backend Services:**
   - Exposed via VPN to both clusters
   - Ready for hybrid calls

### Container Registry

- Docker images must be built and available in GHCR:
  - `ghcr.io/<owner>/samdofreelancer-money-keeper-frontend:<version>`
  - `ghcr.io/<owner>/samdofreelancer-money-keeper-backend:<version>`

## GitHub Secrets Configuration

Configure these secrets in your GitHub repository settings:

| Secret Name | Description | Example |
|---|---|---|
| `WIF_PROVIDER` | Workload Identity Federation provider URL | `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `WIF_SERVICE_ACCOUNT` | Workload Identity service account email | `github-actions@project-id.iam.gserviseaccount.com` |

## Workflow Inputs

When triggering the workflow manually via GitHub UI, provide:

| Input | Required | Default | Description |
|---|---|---|---|
| `version` | Yes | - | Release version (e.g., `v1.0.0`, `v2.3.1`) |
| `gcp_project_id` | Yes | - | GCP Project ID |
| `gke_cluster_1` | Yes | `cluster-1-green` | GKE Cluster 1 name |
| `gke_cluster_2` | Yes | `cluster-2-blue` | GKE Cluster 2 name |
| `gke_zone` | Yes | `us-central1-a` | GKE cluster zone |
| `test_vip_proxy` | Yes | - | On-prem Test-VIP Proxy IP address |
| `prod_vip_load_balancer` | Yes | `prod-vip-lb` | GCLB load balancer name |

## Triggering the Workflow

### Via GitHub UI

1. Go to **Actions** → **GCP Blue-Green Deployment (Multi-Cluster Release)**
2. Click **Run workflow**
3. Fill in all required inputs
4. Click **Run workflow**

### Via GitHub CLI

```bash
gh workflow run gcp-blue-green-deployment.yml \
  --ref main \
  -f version=v1.0.0 \
  -f gcp_project_id=my-project-id \
  -f gke_cluster_1=cluster-1-green \
  -f gke_cluster_2=cluster-2-blue \
  -f gke_zone=us-central1-a \
  -f test_vip_proxy=10.0.1.51 \
  -f prod_vip_load_balancer=prod-vip-lb
```

### Via curl

```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/gcp-blue-green-deployment.yml/dispatches \
  -d '{
    "ref":"main",
    "inputs":{
      "version":"v1.0.0",
      "gcp_project_id":"my-project-id",
      "gke_cluster_1":"cluster-1-green",
      "gke_cluster_2":"cluster-2-blue",
      "gke_zone":"us-central1-a",
      "test_vip_proxy":"10.0.1.51",
      "prod_vip_load_balancer":"prod-vip-lb"
    }
  }'
```

## Monitoring & Validation

### During Deployment

1. **Watch GitHub Actions:**
   - Navigate to the running workflow
   - Follow each phase's progression
   - Check logs for any errors

2. **Monitor GCP Metrics:**
   ```bash
   # Watch cluster status
   gcloud container clusters list --project=PROJECT_ID

   # Monitor load balancer
   gcloud compute backend-services get-health prod-vip-lb --global

   # Check Pod status
   kubectl get pods -n default
   ```

3. **QA Testing Phase (Phase 2):**
   - Access test environment via Test-VIP: `https://<TEST-VIP-PROXY>`
   - Run functional tests
   - Verify hybrid backend calls
   - Check data consistency

### Critical Metrics to Monitor

- **Error Rate:** Should remain < 0.1%
- **P95 Response Time:** Should be < 500ms
- **Pod CPU/Memory:** Should stay within configured limits
- **Backend Connectivity:** All hybrid calls should succeed

### Health Check Commands

```bash
# Check load balancer health
gcloud compute backend-services get-health prod-vip-lb \
  --global \
  --project=PROJECT_ID

# Check cluster nodes
gcloud container clusters describe cluster-1-green \
  --zone us-central1-a \
  --project=PROJECT_ID

# Monitor hybrid connectivity
kubectl exec -it <pod-name> -- curl http://backend-service.internal/api/health
```

## Approval Gates

The workflow has two critical approval gates:

### Gate 1: After Phase 1 (QA Testing)
- **Required For:** Phase 2 → Phase 3 transition
- **Who:** QA Team / Tech Lead
- **Location:** GitHub Environments → "QA Testing"
- **Action:** Approve to proceed with production switch

### Gate 2: After Phase 3 (Production Switch Approval)
- **Required For:** Phase 3 → Phase 4 transition
- **Who:** Release Manager / DevOps
- **Location:** GitHub Environments → "Production Switch"
- **Action:** Approve to proceed with CL2 update

To approve:
1. Go to the workflow run
2. Click on approval gate (marked with ⏳)
3. Review phase summary
4. Click **Approve and deploy**

## Rollback Procedure

### Immediate Rollback (Phase 3-5)

If critical issues occur after production switch:

```bash
# Revert traffic to previous version
gcloud compute backend-services update-backend prod-vip-lb \
  --instance-group=cluster-2-blue-ig \
  --instance-group-zone=us-central1-a \
  --balancing-mode=RATE \
  --max-rate-per-instance=1000 \
  --project=PROJECT_ID \
  --global

gcloud compute backend-services update-backend prod-vip-lb \
  --instance-group=cluster-1-green-ig \
  --instance-group-zone=us-central1-a \
  --balancing-mode=RATE \
  --max-rate-per-instance=0 \
  --project=PROJECT_ID \
  --global
```

### Full Rollback

If needed, revert to previous image tag:

```bash
# On CL1
kubectl set image deployment/money-keeper-frontend-v2 \
  frontend=ghcr.io/OWNER/samdofreelancer-money-keeper-frontend:v0.9.0

# On CL2
gcloud container clusters get-credentials cluster-2-blue \
  --zone us-central1-a \
  --project=PROJECT_ID

kubectl set image deployment/money-keeper-frontend-v2 \
  frontend=ghcr.io/OWNER/samdofreelancer-money-keeper-frontend:v0.9.0
```

## Troubleshooting

### Phase 1 Failures

| Error | Cause | Solution |
|---|---|---|
| "Cluster not found" | Invalid cluster name or project ID | Verify inputs, check GCP console |
| "Permission denied" | Service account lacks permissions | Check Workload Identity setup |
| "Deployment timeout" | Image not available or too large | Check GHCR, verify image pulls |

### Phase 2 (QA Testing)

| Issue | Cause | Solution |
|---|---|---|
| Cannot access Test-VIP | Proxy not configured | Verify proxy IP and VPN connectivity |
| Backend calls failing | VPN disconnected | Check Cloud VPN logs |
| Data inconsistency | Version mismatch | Verify V2 deployment succeeded |

### Phase 3-5 (Production)

| Issue | Cause | Solution |
|---|---|---|
| Traffic not switching | GCLB misconfigured | Check backend service weights |
| High error rate | V2 has bugs | Trigger rollback immediately |
| Hybrid calls failing | Backend issue | Check on-prem systems |

## Performance Optimization

### Reduce Phase Duration

- Pre-warm images on both clusters
- Use cluster node pools with auto-scaling
- Pre-configure network policies
- Use container lifecycle hooks

### Optimize Traffic Switching

- Use traffic splitting instead of binary switch
- Gradually increase weight: 0% → 25% → 50% → 100%
- Monitor metrics between each step
- Adjust based on error rates

## Post-Deployment

### Day 1 Checklist

- [ ] Monitor error rates for 2-4 hours
- [ ] Verify all hybrid calls working
- [ ] Check data consistency across clusters
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Notify stakeholders

### Day 2-3 Checklist

- [ ] Analyze production logs
- [ ] Check for edge cases/bugs
- [ ] Perform load testing (if needed)
- [ ] Document lessons learned
- [ ] Archive old version images

## Environment-Specific Configuration

### Development Environment

```yaml
gcp_project_id: dev-project-123
gke_zone: us-central1-a
prod_vip_load_balancer: dev-vip-lb
```

### Staging Environment

```yaml
gcp_project_id: staging-project-456
gke_zone: us-central1-b
prod_vip_load_balancer: staging-vip-lb
```

### Production Environment

```yaml
gcp_project_id: prod-project-789
gke_zone: us-central1-a
prod_vip_load_balancer: prod-vip-lb
```

## Integration with CI/CD Pipeline

To automatically run this workflow on tagged releases:

```yaml
# .github/workflows/auto-deploy-on-tag.yml
name: Auto Deploy on Tag

on:
  push:
    tags:
      - 'v[0-9]+.[0-9]+.[0-9]+'

jobs:
  trigger-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Extract version from tag
        id: tag
        run: echo "version=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Trigger GCP Blue-Green Deployment
        run: |
          gh workflow run gcp-blue-green-deployment.yml \
            --ref ${{ github.ref }} \
            -f version=${{ steps.tag.outputs.version }} \
            -f gcp_project_id=prod-project-789 \
            -f gke_cluster_1=cluster-1-green \
            -f gke_cluster_2=cluster-2-blue \
            -f gke_zone=us-central1-a \
            -f test_vip_proxy=10.0.1.51 \
            -f prod_vip_load_balancer=prod-vip-lb
```

## Security Considerations

1. **Service Account Least Privilege:**
   - Only grant necessary permissions
   - Rotate credentials regularly
   - Use Workload Identity Federation (no long-lived keys)

2. **Network Security:**
   - Restrict traffic via network policies
   - Use private GKE clusters if possible
   - Encrypt VPN traffic

3. **Audit & Logging:**
   - Enable Cloud Audit Logs
   - Monitor for unauthorized access
   - Archive deployment logs

4. **Approval Process:**
   - Require multiple approvals for production
   - Document all manual interventions
   - Maintain deployment audit trail

## Additional Resources

- [GCP Blue-Green Deployment Best Practices](https://cloud.google.com/architecture/blue-green-deployments)
- [GKE Deployment Patterns](https://cloud.google.com/kubernetes-engine/docs/concepts)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workload Identity Federation Setup](https://cloud.google.com/iam/docs/workload-identities)

## Support & Feedback

For issues or improvements:
1. Check the troubleshooting section
2. Review workflow logs in GitHub Actions
3. Contact the DevOps team
4. File an issue in the repository
