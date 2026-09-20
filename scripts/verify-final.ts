import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

interface VerificationStep {
  name: string
  command: string
  args: string[]
}

const steps: VerificationStep[] = [
  { name: '1. Biome Linter & Formatting Check', command: 'pnpm', args: ['run', 'lint'] },
  { name: '2. TypeScript Typecheck', command: 'pnpm', args: ['run', 'typecheck'] },
  { name: '3. Vitest Automated Unit & Integration Tests', command: 'pnpm', args: ['run', 'test'] },
  { name: '4. Vitest Coverage Verification (v8)', command: 'pnpm', args: ['run', 'test:coverage'] },
  { name: '5. RSC Boundary Architectural Audit', command: 'pnpm', args: ['run', 'audit:rsc'] },
  { name: '6. NFR02 Statistical Engine Performance Benchmark', command: 'pnpm', args: ['run', 'benchmark:statistics'] },
  { name: '7. Next.js Production Build', command: 'pnpm', args: ['run', 'build'] },
  { name: '8. Desktop Cross-Browser E2E Automated Verification', command: 'pnpm', args: ['run', 'test:e2e'] },
]

console.log('\n============================================================')
console.log('   STATISTICS STORY AI — FINAL LOCAL VERIFICATION SUITE')
console.log('   8-Stage Comprehensive Quality Gate (Code -> Test -> Build -> E2E)')
console.log('============================================================\n')

let allPassed = true

for (const step of steps) {
  console.log(`>>> Running Stage: ${step.name}...`)
  const startTime = Date.now()

  const result = spawnSync(step.command, step.args, {
    stdio: 'inherit',
    shell: true,
  })

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2)

  if (result.status !== 0) {
    console.error(`\n[FAILED] Step "${step.name}" exited with code ${result.status} (${elapsedSec}s)\n`)
    allPassed = false
    process.exit(result.status || 1)
  } else {
    console.log(`[PASSED] Step "${step.name}" (${elapsedSec}s)\n`)
  }
}

// -------------------------------------------------------------
// Post-E2E Audit Validation: Validate docs/cross-browser-results.json
// -------------------------------------------------------------
console.log('>>> Auditing Cross-Browser E2E Artifact (docs/cross-browser-results.json)...')
const e2eArtifactPath = path.resolve(process.cwd(), 'docs/cross-browser-results.json')

if (!fs.existsSync(e2eArtifactPath)) {
  console.error('[FAILED] E2E artifact docs/cross-browser-results.json not found!')
  process.exit(1)
}

try {
  const e2eData = JSON.parse(fs.readFileSync(e2eArtifactPath, 'utf-8'))
  if (!Array.isArray(e2eData) || e2eData.length === 0) {
    console.error('[FAILED] docs/cross-browser-results.json is empty or not an array!')
    process.exit(1)
  }

  const requiredBrowsers = ['Google Chrome', 'Microsoft Edge', 'Mozilla Firefox']
  let e2eAuditPassed = true

  for (const bName of requiredBrowsers) {
    const report = e2eData.find((r: { browserName: string }) => r.browserName === bName)
    if (!report) {
      console.error(`[FAILED] Required browser "${bName}" is missing from E2E results!`)
      e2eAuditPassed = false
      continue
    }

    const scenarios = Array.isArray(report.scenarios) ? report.scenarios : []
    const passedScenarios = scenarios.filter((s: { passed: boolean }) => s && s.passed === true).length
    const totalScenarios = scenarios.length

    if (report.status === 'VERIFIED' && totalScenarios === 7 && passedScenarios === 7) {
      console.log(`  [x] ${bName}: VERIFIED (7/7 semantic scenarios passed)`)
    } else if (report.status === 'ENVIRONMENT_LIMITATION') {
      console.error(
        `  [FAILED] ${bName}: ENVIRONMENT_LIMITATION — browser verification incomplete (${report.error || 'environment limitation'})`,
      )
      e2eAuditPassed = false
    } else {
      console.error(
        `  [FAILED] ${bName}: Status is ${report.status} (${passedScenarios}/${totalScenarios} passed) — browser verification incomplete (${report.error || 'unmet verification criteria'})`,
      )
      e2eAuditPassed = false
    }
  }

  if (!e2eAuditPassed) {
    console.error(
      '\n[FAILED] Cross-browser artifact audit validation failed! All 3 required browsers (Chrome, Edge, Firefox) must be VERIFIED with 7/7 scenarios.\n',
    )
    process.exit(1)
  }

  console.log('[PASSED] Cross-browser artifact audit validated successfully.\n')
} catch (err) {
  console.error('[FAILED] Failed to parse docs/cross-browser-results.json:', err)
  process.exit(1)
}

console.log('============================================================')
console.log('   ALL 8 CORE VERIFICATION STEPS PASSED SUCCESSFULLY!')
console.log('   Status: PRE-DEPLOYMENT VERIFIED (8/8 Stages Complete)')
console.log('============================================================\n')
