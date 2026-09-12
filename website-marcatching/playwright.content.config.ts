import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/content-creation', testMatch: '**/*.spec.ts', workers: 1, fullyParallel: false,
  timeout: 60000, use: { browserName: 'chromium', headless: true, viewport: { width: 1512, height: 982 }, launchOptions: { args: ['--host-resolver-rules=MAP inside.localhost 127.0.0.1'] } },
  reporter: 'list', outputDir: 'tmp/content-creation-test-results',
})
