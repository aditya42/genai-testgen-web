# Executable test specifications

`specs/generated/` contains runtime-generated Playwright tests and is gitignored.
The Python generators create `login.spec.ts`, `cart.spec.ts` and, only during
the training-defect demonstration, `known_defect.spec.ts`.

Generated specs import reusable Playwright fixtures, use page objects for
interactions, and hold assertions plus TestRail traceability metadata.
Do not independently maintain duplicate test specs.

```bash
python -m test_generation.runner generate --provider mock
npm run typecheck
npx playwright test
```
