# Reporting and tracing

The Playwright framework produces:
- `reports/playwright-results.json`: **do not rename**. Python consumes this
  for TestRail results and Jira classification.
- `reports/junit.xml`: JUnit results for CI systems.
- `reports/html/`: human-readable HTML; open with `npm run test:report`.
- `test-results/`: failure screenshots, videos and trace ZIP files.

An automatic fixture collects bounded browser console errors and uncaught
page errors for failing tests only. Avoid writing sensitive data to logs.

GitHub Actions retains reporting artifacts. BrowserStack execution also
provides its own cloud build diagnostics.
