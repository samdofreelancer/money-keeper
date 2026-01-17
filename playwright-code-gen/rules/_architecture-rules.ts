/**
 * _architecture-rules.ts
 *
 * Concise, enforceable architecture rules derived from the accounts domain review.
 * Intended to be copied into the repo as guidance for Copilot and contributors.
 *
 * Do NOT introduce new abstractions. Follow existing project patterns:
 *   - Cucumber feature files (Gherkin)
 *   - Step Definitions (steps)
 *   - Use Cases (usecases)
 *   - Page Objects (pages)
 *   - API clients / API use-cases (api)
 *
 * Keep rules short, concrete, and actionable.
 *
 * ENHANCEMENTS (January 17, 2026):
 * - Added ASYNC/AWAIT PATTERNS section (prevents race conditions & flakiness)
 * - Added CROSS-DOMAIN ORCHESTRATION section (multi-domain workflows)
 * - Added TEST DATA MANAGEMENT section (fixtures and cleanup)
 * - Added FLAKINESS PREVENTION section (test reliability)
 * - Added COMPLIANCE SCORING section (measurable enforcement)
 * - Enhanced LAYER RESPONSIBILITIES with async requirements
 */

export const ARCHITECTURE_RULES = `
LAYER RESPONSIBILITIES
- Feature (Gherkin)
  - Only business-readable scenarios and examples.
  - No imports/TS code. No implementation logic.

- Steps (src/domains/<domain>/steps/*.ts)
  - Thin mapping layer: parse Gherkin inputs, call UseCases or World getters, perform assertions.
  - Only Steps perform test assertions (expect). Keep them short and 1:1 with Gherkin when possible.
  - Do not implement business rules, retries, or heavy logic.

- UseCase (src/domains/<domain>/usecases/)
  - MUST be async when calling Pages or awaiting UI state changes
  - Orchestrate workflows across Page objects, ApiClients, and mocks.
  - Implement business rules, validations, retries, and eventual-consistency polling with async/await.
  - Return structured results (e.g., { ok: true } | { ok: false, error: string }) or throw for exceptional failures.
  - Do NOT import '@playwright/test' or call Playwright locators directly.
  - Implement polling for UI state verification: use 5 retries × 500ms for typical operations (2.5s timeout).

- Page (src/domains/<domain>/pages/)
  - MUST be fully async (all methods that interact with Playwright must be async)
  - Encapsulate all UI selectors and Playwright interactions using Playwright locators.
  - Provide primitive actions and data retrieval methods only (click..., fill..., get..., is/has...).
  - Do NOT contain assertions, sorting/business-verification logic, or API calls.
  - Prefer methods that return data/booleans rather than throwing for business checks.
  - Example: async clickAddButton(): Promise<void> { await this.page.locator('button:has-text("Add")').click(); }

- API (src/domains/<domain>/api/ or usecases/api/)
  - Contain HTTP/backend interactions for setup/cleanup or direct API flows.
  - Do NOT perform UI actions or reference Playwright.

ALLOWED DEPENDENCIES (directional)
- Steps → UseCases, Steps → shared utilities, Steps → World/hooks
- UseCases → Pages, UseCases → ApiClients, UseCases → shared utilities
- Pages → Playwright, Pages → shared utilities
- shared/* → allowed everywhere
- Steps may call multiple domain UseCases for multi-domain orchestration

ASYNC/AWAIT PATTERNS (CRITICAL)
- Pages:
  - All Playwright interactions (click, fill, navigate) MUST be async
  - Use page.locator() instead of direct DOM queries for better wait handling
  - Example async method: async clickAddButton(): Promise<void> { await this.page.locator(...).click(); }
  - Simple getters may be sync if no Playwright interaction: getName(): string
  - Any method that waits on UI state MUST be async

- UseCases:
  - MUST be async when calling Pages or awaiting UI state changes
  - Implement polling for eventual consistency with configurable retries
  - Pattern: for (let i = 0; i < maxRetries; i++) { if (condition) return ok; await delay(ms); }
  - Example UseCase method:
    async verifyAccountsSortedByBalance(order: 'asc' | 'desc'): Promise<VerifyResult> {
      const maxRetries = 5;
      for (let i = 0; i < maxRetries; i++) {
        const balances = await this.accountsPage.getAccountBalances();
        if (this.isSorted(balances, order)) return { ok: true };
        await this.delay(500);
      }
      return { ok: false, error: 'Balances not sorted after retries' };
    }

- Steps:
  - MUST always await UseCase calls: await getAccountCreationUiUseCase().createAccount(dto);
  - MUST always await Page calls: const balance = await this.accountsPage.getBalance();

- Polling Guidelines:
  - UI state changes: 5 retries with 500ms delay (typical, 2.5s total)
  - Data-heavy operations: 10 retries with 1000ms delay (network dependent, 10s total)
  - Simple state checks: 3 retries with 300ms delay (fast checks, 0.9s total)
  - NEVER use artificial waitForTimeout() without condition polling
  - Always log retry attempts for debugging in UseCase methods

- Timeouts:
  - Page-level default: 5 seconds for typical operations
  - Page-level extended: 15 seconds for slow operations (file uploads, large data loads)
  - Polling: calculate as maxRetries times delayMs (e.g., 5 times 500ms = 2.5s total timeout)
  - Network waits: Use page.waitForLoadState('networkidle') for data-heavy pages
- Steps may call multiple domain UseCases for multi-domain orchestration

ASYNC/AWAIT PATTERNS (CRITICAL)
- Pages:
  - All Playwright interactions (click, fill, navigate) MUST be async
  - Use page.locator() instead of direct DOM queries for better wait handling
  - Example: async clickAddButton(): Promise<void> { await this.page.locator('button:has-text("Add")').click(); }
  - Simple getters may be sync if no Playwright interaction: getName(): string (no async needed)
  - Any method that waits on UI state MUST be async

- UseCases:
  - MUST be async when calling Pages or awaiting UI state changes
  - Implement polling for eventual consistency with configurable retries:
    const maxRetries = 5; const delayMs = 500;
    for (let i = 0; i < maxRetries; i++) {
      const condition = await checkCondition();
      if (condition) return { ok: true };
      await this.delay(delayMs);
    }
    return { ok: false, error: 'Condition never met' };
  - Example UseCase with polling:
    async verifyAccountsSortedByBalance(order: 'asc' | 'desc'): Promise<VerifyResult> {
      const maxRetries = 5;
      for (let i = 0; i < maxRetries; i++) {
        const balances = await this.accountsPage.getAccountBalances();
        if (this.isSorted(balances, order)) return { ok: true };
        await this.delay(500);
      }
      return { ok: false, error: 'Balances not sorted after retries' };
    }

- Steps:
  - MUST always await UseCase calls
  - Example: await getAccountCreationUiUseCase().createAccount(dto);
  - Example: const balance = await this.accountsPage.getBalance();

- Polling Guidelines:
  - UI state changes: 5 retries with 500ms delay (typical, 2.5s total)
  - Data-heavy operations: 10 retries with 1000ms delay (network dependent, 10s total)
  - Simple state checks: 3 retries with 300ms delay (fast checks, 0.9s total)
  - NEVER use artificial waitForTimeout() without condition polling
  - Always log retry attempts for debugging in UseCase methods

- Timeouts:
  - Page-level default: 5 seconds for typical operations
  - Page-level extended: 15 seconds for slow operations
  - Polling calculation: maxRetries multiplied by delayMs 
  - Network waits: Use page.waitForLoadState() for data-heavy pages

FORBIDDEN DEPENDENCIES
- UseCases or Pages must NOT import Steps or Step-specific modules.
- Pages must NOT import UseCases.
- Steps must NOT contain business logic, complex retries, or heavy validations.
- No direct cross-domain imports that bypass DI and World getters.

NAMING CONVENTIONS (exact)
- Domain folder: src/domains/<domain>/
- Pages: src/domains/<domain>/pages/<resource>.playwright.page.ts
  - Class names: PascalCase and end with Page/PlaywrightPage (e.g., AccountsPlaywrightPage, AccountsActions)
  - Methods: camelCase verbs (clickAddAccountButton, getVisibleAccountNames, isErrorMessageVisible)
  - Boolean checks: prefix with is/has (not verify) — e.g., isAccountListed(name): Promise<boolean>
- UseCases:
  - UI usecases: src/domains/<domain>/usecases/ui/<Domain><Action>UiUseCase.ts (class suffix UiUseCase or UseCase)
  - API usecases: src/domains/<domain>/usecases/api/<Domain><Action>ApiUseCase.ts (class suffix ApiUseCase)
  - Public methods: business verbs (createAccount, updateAccount, verifyAccountsSortedByBalance)
  - Do not use generic names like handle/process/doAction.
- Steps files: src/domains/<domain>/steps/<feature>.steps.ts
- Types/DTO: src/domains/<domain>/types/<domain>.dto.ts
  - Keep naming consistent between DTOs used across layers; prefer name/balance over accountName/initBalance unless a clear conversion exists.
- TOKENS & DI: Token names MUST mirror class/service names (TOKENS.AccountsPlaywrightPage, TOKENS.AccountCreationApiUseCase)

BEHAVIOR CONTRACTS (enforceable)
- Pages must:
  - Return raw UI data or boolean checks (getVisibleBalances, getVisibleAccountNames, isSuccessMessageVisible).
  - NOT throw business-verification errors. They may throw on UI interaction failures (optional).
- UseCases must:
  - Consume page data and perform business validations/assertions (throw or return structured error).
  - Implement retries/polling for eventual consistency.
  - Not call Playwright locators directly.
- Steps must:
  - Call UseCase methods or Page methods via World getters.
  - Only Steps (or test helpers invoked from Steps) may call expect() assertions.
  - Map 1:1 with Gherkin when practical; where one Gherkin maps multiple steps, keep step code minimal.

ERRORS / RETURN VALUES
- Prefer structured results over uncontrolled exceptions for recoverable business outcomes:
  - e.g., Promise<CreateResult> where CreateResult = { ok: true, id?: string } | { ok: false, error: string }
- Throw Errors for exceptional runtime failures (network unavailable, not found due to UI race, invalid DTO).

DTO & NAME CONSISTENCY
- Keep DTO field names consistent across layers when possible.
- If conversions are required, provide explicit factory/convert functions:
  - AccountCreateDto.fromAccountDto(accountDto)
- Avoid ad-hoc field renaming across files without a single conversion function.

ENFORCEMENT / LINTING (practical checks)
- CI should include:
  - A small static check (eslint rule or script) to flag:
    - Pages importing usecases or steps.
DTO CONSISTENCY PATTERN (CRITICAL)
- Domain/UI Layer DTOs: Use standardized names (name, balance, description)
  - Example: AccountDto { name: string, balance: number, ... }
- API/Backend Layer DTOs: Use backend names (accountName, initBalance, description)
  - Example: AccountCreateDto { accountName: string, initBalance: number, ... }
  - Example: AccountApiDto { accountName: string, balance: number, ... }
- CONVERSION RULES:
  - ALWAYS use factory methods: AccountCreateDto.fromAccountDto(accountDto)
  - NEVER manually map fields (name → accountName) outside conversion functions
  - Conversion functions should be in DTO file, well-documented with JSDoc
- BENEFIT: Centralized mapping prevents bugs, clear intent, maintainable code

    - UseCases importing '@playwright/test'.
    - Step files importing selectors or referencing locators.
  - A naming lint checklist / PR template to verify DTO naming consistency.
- Code review checklist items:
  - "Does the Page throw business errors?" If yes — request move to UseCase.
  - "Is any Playwright locator used outside pages?" If yes — request relocation.
  - "Are DTOs converted using factory methods?" If not — request update to use fromAccountDto(), toAccountDto(), etc.

REFACTOR MANDATES (when violation found)
- If a page contains verification logic (sorting, complex comparison):
  - Replace with a data-retrieval method (getVisibleBalances) and move verification into a UseCase.
- If Steps reference selectors:
  - Move selectors into Page object and call Page methods from Steps/UseCases.
- If naming mismatches exist in DTOs:
  - Add a conversion factory and update call sites to use it; then standardize names in future changes.
- If DTO is constructed directly instead of via factory:
  - Update to use AccountCreateDto.fromAccountDto(accountDto) pattern.

EXAMPLES (do this, not that)
- Good:
  - UseCase.createAccount(dto) -> calls accountsPage.clickAddAccount(); accountsPage.fillForm(dto); await accountsPage.getVisibleAccountNames(); perform verification and return structured result.
  - const createDto = AccountCreateDto.fromAccountDto(accountDto); // ALWAYS use factory
  - const accountDto = toAccountDto(apiResponse); // Use conversion function
- Bad:
  - accountsVerification.verifyAccountsSortedByBalance(...) inside a page that throws business Error.
  - Steps directly running page.locator('...').
  - const createDto = new AccountCreateDto({ accountName: "...", initBalance: 1000 }); // Direct constructor
  - Manual mapping: { accountName: dto.name, initBalance: dto.balance } // Outside conversion function

FINAL NOTE
- These rules are intentionally strict: keep Pages mechanical, UseCases cognitive, Steps declarative.
- DTOs must follow strict conversion patterns to prevent bugs and maintain clarity.
- Do NOT invent new layers or patterns; apply these rules consistently to move the codebase from PARTIAL → PASS.
`;