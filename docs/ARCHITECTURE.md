# Architecture: BrowserStack execution and quality integrations

```text
OpenAI-generated, validated login case plans
   -> safe Playwright action compiler
   -> generated_tests/login.spec.ts
   -> BrowserStack Node SDK (cloud Chrome)
   -> Playwright JSON report
      |-> TestRail result synchronization
      |-> repeat-failure triage -> Jira Bug candidate
      |-> GitHub Actions summary + retention
```

BrowserStack hosts the browser, while SauceDemo remains the example application under test.

## Page Object Model

Browser UI interactions are implemented in TypeScript page classes under `pages/`:

- `LoginPage`: login inputs, submit, error locator and reusable `loginAs()` workflow
- `InventoryPage`: add/remove product actions, cart badge and cart navigation
- `CartPage`: cart item counting and product-name selection

The Python generator in `test_generation/` **does not embed CSS selectors** in the generated Playwright specs. It maps validated requirement-step IDs to simple page-object method calls and assertion statements. The TypeScript specs own the assertions and traceability markers (`[LOGIN-...]`, `[CART-...]`, `[TR:C...]`). The optional `known_defect.spec.ts` uses the same page classes with `problem_user`, preserving the synthetic-demo labeling safeguards.

This keeps selector maintenance in one place without introducing an unnecessary base page or inheritance tree. BrowserStack, TestRail, Jira, generation validation and CI wiring are unchanged by this UI-layer refactor.

## Responsibilities

- `pages/`: TypeScript Page Object Model (selectors and browser actions).
- `test_generation/login.py`, `test_generation/cart.py`: bounded requirements and approved page-object calls.
- `test_generation/runner.py`: generation, TestRail/Jira APIs, run management, reporting and quality gate.
- `test_generation/failure_triage.py`: excludes flaky, infrastructure and non-reproducible failures from automatic Jira filing.
- `browserstack.yml`: browser platform and BrowserStack build settings.
- `playwright.config.ts`: Playwright JSON reporter, evidence attachments, CI retry.
- `tests/`: offline regression tests; no BrowserStack or Jira credentials required.
- `.github/workflows/test-generation.yml`: manual live integration.
- `.github/workflows/code-quality.yml`: lightweight local browser and unit-test CI.

## Configuration, fixtures and test specifications

- `config/environment.ts` reads `SAUCEDEMO_BASE_URL`, `PLAYWRIGHT_TIMEOUT_MS`, `PLAYWRIGHT_RETRIES` and `PLAYWRIGHT_WORKERS`. It validates URL schemes, disallows embedded credentials and rejects invalid numeric settings. Existing CI retries default to one; local retries default to zero.
- `fixtures/testFixtures.ts` exposes fresh `loginPage`, `inventoryPage` and `cartPage` fixtures per test, with optional browser console/page-error evidence attached on failures.
- `utils/testData.ts` centralizes **public SauceDemo demo** credentials and product IDs. `utils/traceability.ts` annotates each generated spec with requirement and TestRail case metadata; the existing `[TR:C#]` name marker remains the official TestRail sync contract.
- `specs/generated/` contains the runnable test specifications: login, cart and the separately gated known-defect demonstration. Python creates them at runtime; they are intentionally not committed or duplicated as static specs.

## Reporting and diagnostics

Playwright writes HTML and JUnit reports in addition to the unchanged `reports/playwright-results.json` used by the Python TestRail/Jira synchronizer. Screenshots, video and trace ZIPs are captured for failed executions. The GitHub Actions artifacts include reports, traces and BrowserStack evidence. Read [reporting guide](REPORTING.md) for file locations and commands.

The cloud execution, result synchronization, failure classification and three-run retention behavior remain unchanged by this framework-only refactor.

## Operational design

BrowserStack credentials come from GitHub Actions Secrets, not source files. An OpenAI-backed or deterministic provider generates the test plans. The model cannot execute arbitrary code. TestRail case reconciliation uses stable requirement identifiers.

The `full-demo` workflow verifies BrowserStack credentials before creating a TestRail run. It executes remotely, syncs the results, optionally creates Jira Bug *candidates* for repeated assertion failures and then fails CI if anything remains failed, flaky or missing. The reporter and TestRail run IDs are captured in GitHub Actions artifacts.

Jira classification is intentionally conservative. Two identical failing outcomes plus assertion evidence is not proof of a product defect; created Jira tickets are labeled `needs-triage` and require human review. Infrastructure/network failures are excluded from automatic tickets.

The existing live TestRail cleanup keeps the newest three execution runs in project 1, permanently removing older runs in that project, including unrelated runs. It does not remove test cases or Jira issues.

## Add-to-cart and known training-defect test

The default regression suite contains five login scenarios and five post-login cart scenarios. Cart tests cover single/multiple item addition, removal, empty state, and duplicate prevention. The action compiler lives in `test_generation/cart.py`.

The separate `known-defect-demo` manual workflow option (provider `mock` only) includes `DEMO-001`, which logs in as SauceDemo's publicly documented intentionally defective `problem_user`, attempts to add the Sauce Labs Fleece Jacket and verifies the cart badge. If this known fault reproduces twice with assertion evidence, it is published as a Failed TestRail result and a Jira Bug **labeled `known-training-defect` and `synthetic-demo`**. It is a real execution of a known demo defect, not proof of a newly discovered production bug.

The training workflow's quality gate expects ten baseline passes plus one failing demo. For ordinary `full-demo` runs, unexpected repeated assertion failures are filed only as `needs-triage` Jira candidates. The absence of a defect cannot be simulated as a genuine bug by intentionally changing assertions.
