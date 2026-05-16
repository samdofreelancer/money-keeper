# CI/CD Architecture Rules — v2.0

> A working agreement for writing maintainable, auditable GitHub Actions pipelines following Domain-Driven Design and Clean Architecture principles.

---

## Core Philosophy

Every layer of a CI/CD pipeline maps directly to a well-known architectural concept. Understanding this mapping is understanding the entire ruleset.

| DDD / Clean Architecture | CI/CD Equivalent |
|---|---|
| Use Case | Workflow |
| Application Service | Job |
| Capability / Port | Action |
| Domain / Infrastructure Logic | Script |
| Infrastructure | Runner |
| Pipeline Event | Artifact |

---

## Rules

### Structure & Boundaries

#### R-01 — Workflow = Use Case

A Workflow describes **WHAT** happens, never **HOW**.

Workflows are allowed to contain: stage names, execution order, and trigger conditions. All business logic, parsing, retry, and transformation must be delegated to scripts.

**Smells to watch for:**

```yaml
# ❌ Bad — logic embedded in YAML
run: |
  if [[ "$BRANCH" == "main" ]]; then
    for file in $(find . -name "*.xml"); do
      VERSION=$(cat $file | grep -oP '(?<=<version>)[^<]+')
      echo "APP_VERSION=$VERSION" >> $GITHUB_ENV
    done
  fi
```

```yaml
# ✅ Good — delegate to script
- name: Resolve build context
  run: python scripts/resolve_context.py

- name: Build artifacts
  uses: ./.github/actions/build-artifacts
  with:
    profile: ${{ env.BUILD_PROFILE }}
```

Other smells: `jq`/`grep`/`sed` pipelines inline, multi-condition `if:` expressions, `curl` + parse inline, `echo "VAR=..." >> $GITHUB_ENV`.

---

#### R-02 — Jobs = Application Services

Job names must express **business intent**. Reading job names alone should explain what the pipeline does.

```yaml
# ❌ Bad
jobs:
  job1:
  sonar-job:
  docker-build-push:

# ✅ Good
jobs:
  prepare:
  validate:
  quality-gate:
  publish:
  deploy:
```

---

#### R-03 — Actions = Capabilities (Port/Adapter)

Actions expose capability, not implementation. Choose the right action type for the right purpose:

| Type | When to Use | Example |
|---|---|---|
| Composite Action | Group repeated steps, no separate runtime needed | `run-tests`, `build-artifacts` |
| JavaScript Action | Complex logic, needs NPM, needs performance | `resolve-context`, `notify-teams` |
| Reusable Workflow | Complete sub use-case with its own jobs or matrix | `deploy-to-env`, `run-integration-suite` |

```yaml
# ❌ Bad — exposes implementation
uses: execute-sonar-maven-jdk17-proxy

# ✅ Good — exposes capability
uses: ./.github/actions/quality-gate
```

---

#### R-04 — Inputs Represent Intent, Not Infrastructure

The contract of an Action uses business language. Infrastructure must not leak into inputs.

```yaml
# ❌ Bad — infrastructure leak
inputs:
  proxy-host:
  proxy-port:
  jfrog-user:
  sonar-token:

# ✅ Good — business intent
inputs:
  project-key:
    description: 'Project identifier'
  build-profile:
    description: 'dev | staging | prod'
  enable-lib-scan:
    description: 'Include dependency scan'
    default: 'false'
```

---

#### R-05 — Infrastructure Travels Downward

Secrets, credentials, and endpoints live at the lowest layer. Workflows must not know they exist.

```yaml
# action.yml — resolve infra config internally, never expose to caller
runs:
  using: composite
  steps:
    - name: Resolve infrastructure
      shell: bash
      run: python ${{ github.action_path }}/resolvers/infra_resolver.py
      env:
        PROXY_HOST:   ${{ env.CORPORATE_PROXY_HOST }}
        REGISTRY_URL: ${{ env.ARTIFACT_REGISTRY_URL }}
        SONAR_TOKEN:  ${{ secrets.SONAR_TOKEN }}
```

---

### Scripts & Logic

#### R-06 — Scripts Own All Decision Logic

Scripts are the only place decisions are made. YAML only calls scripts and reads results.

Scripts own: algorithms, decisions, parsing, retry logic, data transformation, condition evaluation.

Examples: `shard_balancer.py`, `merge_coverage_reports.py`, `poll_quality_gate.py`, `resolve_build_context.py`, `evaluate_rollback_signal.py`

---

#### R-07 — One Script, One Responsibility

A script must be split when it does more than one thing. The script name must follow the `verb + noun` pattern.

```
# ❌ Bad — god script
scan-sonar.sh
  ├── merge coverage reports
  ├── build maven command
  ├── execute sonar scan
  ├── poll quality gate
  └── notify Slack on failure

# ✅ Good — single responsibility
merge_coverage_reports.py
build_maven_command.py
scan_quality_gate.sh
poll_quality_gate.py
notify_pipeline_event.py
```

**Signal to split:** the script has more than one exit point serving more than one caller, or the script name contains the word "and".

---

#### R-08 — Measure Complexity by Decisions, Not Lines

Line count does not measure complexity. Decision count measures risk.

| Decision Count | Action |
|---|---|
| 1–2 branches | Normal, no action needed |
| 3–5 branches | Write unit tests for the script |
| >5 branches | Split into modules, consider Strategy pattern |
| Script >80 lines | Review: is it doing more than one thing? |

---

#### R-09 — If Logic Needs Tests → Move to Script

The simple question: "Does this section need unit tests?" If yes — it does not belong in YAML.

YAML has no test framework. Logic in YAML is untested logic. Untested logic is production risk.

---

### Action Design

#### R-10 — Action Input Count by Action Type

Input thresholds differ by action type. One number cannot apply to all.

| Action Type | Ideal | Warning | Redesign |
|---|---|---|---|
| Orchestration (composite calling multiple actions) | 3–5 | 6–8 | >8 |
| Execution (deploy, scan, build) | 5–8 | 9–12 | >12 |
| Utility (notify, resolve, publish) | 2–4 | 5–7 | >7 |

When thresholds are exceeded: group inputs into a profile (JSON string) or introduce a config resolver.

---

#### R-11 — Hide Technology Names from Contracts

Technology is an implementation detail. Workflows must not know which tool the pipeline uses.

```yaml
# ❌ Bad
uses: sonar-scan-maven
uses: docker-build-push

# ✅ Good
uses: ./.github/actions/quality-gate
uses: ./.github/actions/publish-artifacts
```

> **Exception — Regulated / Audit Environments:** In banking/fintech systems with compliance requirements (SOX, PCI-DSS), auditors need tool traceability. Solution: keep action names capability-based, but document the tool in `action.yml`'s description and emit metadata into the audit log from scripts. Technology names belong at the Documentation + Audit Artifact layer, not the Workflow layer.

---

### Pipeline Context & Data Flow

#### R-12 — Prepare Job Builds PipelineContext

There is exactly one place that resolves context. No job independently resolves branch, sha, or version — all jobs read from `prepare`.

```yaml
jobs:
  prepare:
    outputs:
      branch:        ${{ steps.ctx.outputs.branch }}
      sha-short:     ${{ steps.ctx.outputs.sha_short }}
      artifact-id:   ${{ steps.ctx.outputs.artifact_id }}
      lib-changed:   ${{ steps.ctx.outputs.lib_changed }}
      build-profile: ${{ steps.ctx.outputs.build_profile }}
    steps:
      - name: Build context
        id: ctx
        run: python scripts/resolve_pipeline_context.py

  quality-gate:
    needs: [prepare]
    steps:
      - uses: ./.github/actions/quality-gate
        with:
          project-key:   ${{ needs.prepare.outputs.artifact-id }}
          build-profile: ${{ needs.prepare.outputs.build-profile }}
```

---

#### R-13 — Artifacts = Pipeline Events

An Artifact is evidence that a stage completed — a **Pipeline Event**, not a DTO.

An Artifact carries meaning: "This stage ran and here is its output." In regulated environments, artifacts are audit evidence.

Naming convention: `{stage}-{artifact-type}-{sha-short}`

Examples: `coverage-report` (Quality Gate evidence), `test-results` (Validation evidence), `sbom.json` (Security evidence), `scan-summary.json` (Audit trail)

---

#### R-14 — Runners = Infrastructure Abstraction

Workflows only know the runner label. Runner capability must not be hardcoded into steps.

```yaml
# ❌ Bad — infra leak into steps
runs-on: self-hosted-linux-x64-proxy
steps:
  - run: |
      export HTTPS_PROXY=http://proxy.corp:3128
      curl --proxy $HTTPS_PROXY ...

# ✅ Good — label abstraction
runs-on: [self-hosted, build-standard]
# proxy and certs are configured at runner level
# workflows need not know
```

Runner groups should be named by capability: `build-standard`, `deploy-prod`, `scan-isolated` — not `vm-linux-04`.

---

### Error Handling & Observability

#### R-15 — Retry Logic Belongs in Scripts

Retry is decision logic. Decision logic does not live in YAML.

```yaml
# ❌ Bad — retry in YAML
- name: Poll quality gate
  run: curl $SONAR_URL/...
  continue-on-error: true
- name: Retry if failed
  if: steps.prev.outcome == 'failure'
  run: sleep 30 && curl $SONAR_URL/...

# ✅ Good — retry in script
- name: Poll quality gate
  run: python scripts/poll_quality_gate.py
  # script internally handles:
  # - backoff strategy
  # - max attempts
  # - exit code semantics
```

---

#### R-16 — Failure Handling Has Explicit Owners

Each type of failure has a clear owner. Never let failure handlers be duplicated or left empty.

| Failure Type | Owner | Mechanism |
|---|---|---|
| Transient (network, timeout) | Script | Retry with exponential backoff |
| Business failure (test fail, gate fail) | Script → exit code | Non-zero exit causes Job failure naturally |
| Notification on failure | Dedicated Action | `if: failure()` calls `notify-pipeline-event` |
| Rollback trigger | Dedicated Job | `rollback` job with `needs + if: failure()` |

> **Anti-pattern:** Do not use `continue-on-error: true` and then check `outcome` in a later step — this is retry/error logic embedded in YAML. The only valid exception: a final notification step that must run even when the job fails.

---

#### R-17 — Emit Observability Signals from Scripts

Scripts are the only entities with enough context to emit meaningful signals. Workflows do not have sufficient information to do this.

Every critical script should emit: duration (ms), exit reason (human-readable), artifact checksum, retry count (if applicable).

```python
# poll_quality_gate.py
result = {
    "status": "PASSED",
    "project": project_key,
    "duration_ms": elapsed,
    "attempts": attempt_count,
    "gate_url": gate_url
}
print(f"::notice title=Quality Gate::{json.dumps(result)}")
```

---

### Evolution & Maintainability

#### R-18 — Prefer Evolution Over Future Fantasy

Build for today's constraints. Evolve when signals appear — not when you imagine they might.

Do not design a 20-shard matrix when today you have 1 runner. Complexity has a maintenance cost even before it is used.

**Signals to evolve:**
- The same pattern repeats ≥3 times in a workflow
- A job consistently runs >15 minutes
- A script is copy-pasted between repositories
- The team needs to read scripts to understand the workflow

---

#### R-19 — Thin Workflows Survive Longer

A Workflow must be understandable within 2–3 minutes. If not, an abstraction boundary has been violated.

| Metric | OK | Review | Refactor Now |
|---|---|---|---|
| Workflow lines | <100 | 100–200 | >200 |
| Steps per Job | <7 | 7–12 | >12 |
| Jobs per Workflow | <6 | 6–10 | >10 |
| Inline `run:` lines per step | <3 | 3–8 | >8 → move to script |

---

#### R-20 — Version Pinning is a Safety Contract

External actions must be pinned to a SHA. Unpinned = non-deterministic = not auditable.

```yaml
# ❌ Bad — mutable reference
uses: actions/checkout@v4

# ✅ Good — SHA pin
uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
# v4.2.2
```

> **Banking / Regulated Context:** SHA pinning is mandatory in regulated environments. Supply chain attacks via mutable action tags are a real attack vector. Use tools like `pin-github-action` or Dependabot to maintain pins.

---

#### R-21 — Permissions Follow Least Privilege

Every workflow and job must have exactly the permissions it needs. No default broad permissions.

```yaml
# Workflow-level: deny all by default
permissions: read-all

jobs:
  publish:
    # Job-level: grant only what is needed
    permissions:
      contents: read
      packages: write
      id-token: write   # OIDC for cloud auth
```

---

#### R-22 — Document Exceptions, Not Conventions

Conventions need no comments. Exceptions must have a comment explaining **WHY**.

```yaml
# ❌ Bad — comment states the obvious
# Run tests
- uses: ./.github/actions/run-tests

# ✅ Good — document the exception only
- uses: ./.github/actions/run-tests

# EXCEPTION: continue-on-error=true because the notification
# step below must run even when integration tests fail.
# This is not retry logic.
- uses: ./.github/actions/run-integration
  continue-on-error: true

- uses: ./.github/actions/notify
  if: always()
```

---

## Quick Reference

### Rule Index

| # | Rule | Category |
|---|---|---|
| R-01 | Workflow = Use Case | Structure |
| R-02 | Jobs = Application Services | Structure |
| R-03 | Actions = Capabilities | Structure |
| R-04 | Inputs Represent Intent | Structure |
| R-05 | Infrastructure Travels Downward | Structure |
| R-06 | Scripts Own All Decision Logic | Scripts |
| R-07 | One Script, One Responsibility | Scripts |
| R-08 | Measure Complexity by Decisions | Scripts |
| R-09 | If Logic Needs Tests → Move to Script | Scripts |
| R-10 | Action Input Count by Action Type | Action Design |
| R-11 | Hide Technology Names from Contracts | Action Design |
| R-12 | Prepare Job Builds PipelineContext | Data Flow |
| R-13 | Artifacts = Pipeline Events | Data Flow |
| R-14 | Runners = Infrastructure Abstraction | Data Flow |
| R-15 | Retry Logic Belongs in Scripts | Error Handling |
| R-16 | Failure Handling Has Explicit Owners | Error Handling |
| R-17 | Emit Observability Signals from Scripts | Observability |
| R-18 | Prefer Evolution Over Future Fantasy | Maintainability |
| R-19 | Thin Workflows Survive Longer | Maintainability |
| R-20 | Version Pinning is a Safety Contract | Maintainability |
| R-21 | Permissions Follow Least Privilege | Maintainability |
| R-22 | Document Exceptions, Not Conventions | Maintainability |

### The Single Most Important Question

Before writing any YAML, ask:

> **"Is this a decision or an orchestration?"**
>
> — Decision → Script
> — Orchestration → YAML

---

## Changelog

| Version | Changes |
|---|---|
| v2.0 | Added R-15–R-17 (Error Handling & Observability), R-20–R-22 (Safety & Maintainability). Revised R-03 (action type taxonomy), R-10 (input thresholds by type), R-11 (compliance exception), R-13 (Pipeline Event vs DTO), R-14 (runner groups). Added enforcement thresholds throughout. |
| v1.0 | Initial 18 rules covering structure, scripts, action design, and data flow. |
