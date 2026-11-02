import type { TestInfo } from '@playwright/test';

/** Add requirement and TestRail IDs without changing the title-based sync contract. */
export function annotateTest(testInfo: TestInfo, requirementId: string, caseId?: number): void {
  testInfo.annotations.push({ type: 'requirement', description: requirementId });
  if (caseId !== undefined) {
    testInfo.annotations.push({ type: 'testrail_case', description: String(caseId) });
  }
}
