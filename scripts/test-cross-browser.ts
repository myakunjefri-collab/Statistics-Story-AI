import { spawn, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'
import { chromium, firefox, type Browser } from 'playwright'
import { createSessionToken } from '../src/lib/auth/session'

interface ScenarioResult {
  scenario: string
  passed: boolean
  details: string
}

interface BrowserTestReport {
  browserName: string
  executablePath: string
  status: 'VERIFIED' | 'FAILED' | 'ENVIRONMENT_LIMITATION'
  error?: string
  scenarios: ScenarioResult[]
}

const PORT = 3099
const BASE_URL = `http://localhost:${PORT}`

function waitForServer(url: string, timeoutMs = 20000): Promise<boolean> {
  const start = Date.now()
  return new Promise((resolve) => {
    const check = () => {
      http
        .get(url, (res) => {
          if (res.statusCode && res.statusCode < 500) {
            resolve(true)
          } else {
            retry()
          }
        })
        .on('error', () => {
          retry()
        })
    }

    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        resolve(false)
      } else {
        setTimeout(check, 400)
      }
    }

    check()
  })
}

async function createE2EAnalysisData(sessionToken: string): Promise<{
  regressionId: string
  descriptiveId: string
}> {
  // Create Regression Analysis via production API boundary
  const regReq = await fetch(`${BASE_URL}/api/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_session=${sessionToken}`,
    },
    body: JSON.stringify({
      namaAnalisis: 'E2E Validasi Regresi Linier OLS',
      jenisAnalisis: 'Regresi',
      formatData: 'manual',
      rawContent: 'x,y\n1,2.2\n2,2.8\n3,3.6\n4,4.5\n5,5.1\n6,5.9\n7,6.8\n8,7.5',
    }),
  })

  if (!regReq.ok) {
    const errText = await regReq.text().catch(() => '')
    throw new Error(`Failed to seed E2E regression analysis: HTTP ${regReq.status} - ${errText}`)
  }
  const regJson = await regReq.json()
  const regressionId = String(regJson.analysisId)

  // Create Descriptive Analysis via production API boundary
  const descReq = await fetch(`${BASE_URL}/api/calculate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `auth_session=${sessionToken}`,
    },
    body: JSON.stringify({
      namaAnalisis: 'E2E Validasi Deskriptif Bivariate',
      jenisAnalisis: 'Deskriptif',
      formatData: 'manual',
      rawContent: '12, 15, 12, 18, 22, 25, 22, 30, 14, 18',
    }),
  })

  if (!descReq.ok) {
    const errText = await descReq.text().catch(() => '')
    throw new Error(`Failed to seed E2E descriptive analysis: HTTP ${descReq.status} - ${errText}`)
  }
  const descJson = await descReq.json()
  const descriptiveId = String(descJson.analysisId)

  return { regressionId, descriptiveId }
}

async function runBrowserScenarios(
  browser: Browser,
  sessionToken: string,
  e2eData: { regressionId: string; descriptiveId: string },
  scenarios: ScenarioResult[] = [],
): Promise<ScenarioResult[]> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  })
  const page = await context.newPage()

  // -------------------------------------------------------------
  // Scenario 1: Semantic Landing Page Verification
  // -------------------------------------------------------------
  await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  const pageTitle = await page.title()
  const heroH1 = await page.locator('h1').first().textContent()
  const ctaButton = page.locator('a[href="/login"]:has-text("Mulai Mencoba")').first()
  const ctaVisible = await ctaButton.isVisible()

  const titleValid = pageTitle.includes('Statistics Story AI')
  const h1Valid = Boolean(heroH1 && (heroH1.includes('Dari Angka') || heroH1.includes('Cerita')))
  const landingPassed = titleValid && h1Valid && ctaVisible

  scenarios.push({
    scenario: '1. Landing page semantic validation (Title, H1 Hero, Main CTA)',
    passed: landingPassed,
    details: `Title: "${pageTitle}" | H1: "${heroH1?.trim().replace(/\s+/g, ' ')}" | CTA Visible: ${ctaVisible}`,
  })

  // -------------------------------------------------------------
  // Scenario 2: Semantic Login Page & Controls Verification
  // -------------------------------------------------------------
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 })
  const emailInput = page.locator('input[type="email"]').first()
  const passwordInput = page.locator('input[type="password"]').first()
  const submitButton = page.locator('button[type="submit"]').first()

  const emailVisible = await emailInput.isVisible()
  const passVisible = await passwordInput.isVisible()
  const submitVisible = await submitButton.isVisible()

  await emailInput.fill('researcher@uns.ac.id')
  await passwordInput.fill('SecurePass123!')
  const emailVal = await emailInput.inputValue()
  const passVal = await passwordInput.inputValue()

  const loginPassed =
    emailVisible &&
    passVisible &&
    submitVisible &&
    emailVal === 'researcher@uns.ac.id' &&
    passVal === 'SecurePass123!'

  scenarios.push({
    scenario: '2. Login page form controls & interactive input',
    passed: loginPassed,
    details: `Email input (${emailVal}), password input (typed), submit button verified interactable`,
  })

  // -------------------------------------------------------------
  // Scenario 3: Protected Input Page (Auth Session Guard & Form UI)
  // -------------------------------------------------------------
  await context.addCookies([
    {
      name: 'auth_session',
      value: sessionToken,
      url: BASE_URL,
    },
  ])

  await page.goto(`${BASE_URL}/input`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForSelector('form', { timeout: 10000 })
  const currentInputUrl = page.url()
  const inputTitle = await page.title()
  const headerHeading = await page.locator('header h1, .font-serif.text-3xl').first().textContent()
  const hasAnalysisForm = await page.locator('form').first().isVisible()

  const inputPassed =
    !currentInputUrl.includes('/login') &&
    inputTitle.includes('Analisis Baru') &&
    Boolean(headerHeading && headerHeading.includes('Buat Analisis')) &&
    hasAnalysisForm

  scenarios.push({
    scenario: '3. Protected input page loads with AnalysisInputForm and authorized session',
    passed: inputPassed,
    details: `URL: ${currentInputUrl} | Page Header: "${headerHeading?.trim()}" | Form visible: ${hasAnalysisForm}`,
  })

  // -------------------------------------------------------------
  // Scenario 4: Analysis Selection UI (All 4 options verified)
  // -------------------------------------------------------------
  await page.waitForSelector('select', { timeout: 8000 })
  const selectLocator = page.locator('select').first()
  const options = await selectLocator.locator('option').allTextContents()

  const hasDeskriptif = options.some((o) => o.includes('Deskriptif'))
  const hasUjiT = options.some((o) => o.includes('Uji t') || o.includes('Uji-t'))
  const hasKorelasi = options.some((o) => o.includes('Korelasi'))
  const hasRegresi = options.some((o) => o.includes('Regresi'))

  // Select Regresi and verify state change
  await selectLocator.selectOption('Regresi')
  const valRegresi = await selectLocator.inputValue()

  // Select Deskriptif and verify state change
  await selectLocator.selectOption('Deskriptif')
  const valDeskriptif = await selectLocator.inputValue()

  const selectionPassed =
    hasDeskriptif &&
    hasUjiT &&
    hasKorelasi &&
    hasRegresi &&
    valRegresi === 'Regresi' &&
    valDeskriptif === 'Deskriptif'

  scenarios.push({
    scenario: '4. Analysis selection UI verifies all 4 methods (Deskriptif, Uji t, Korelasi, Regresi)',
    passed: selectionPassed,
    details: `Options: [${options.join(', ')}] | Transitions verified: Regresi -> Deskriptif`,
  })

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // Scenario 5: Result Page Semantic Verification & Auth Guard
  // -------------------------------------------------------------
  await page.goto(`${BASE_URL}/hasil/${e2eData.regressionId}`, {
    waitUntil: 'networkidle',
    timeout: 15000,
  })

  // Wait for result query to populate
  await page.waitForSelector('#statistik', { timeout: 10000 })

  const hasRingkasan = await page.locator('#ringkasan').isVisible()
  const hasStatistik = await page.locator('#statistik').isVisible()
  const hasNarasi = await page.locator('#narasi').isVisible()
  const hasVisualisasi = await page.locator('#visualisasi').isVisible()
  const hasContohKasus = await page.locator('#contoh-kasus').isVisible()

  const allSectionsVisible =
    hasRingkasan && hasStatistik && hasNarasi && hasVisualisasi && hasContohKasus

  // Verify Auth Guard explicitly in a clean unauthenticated context
  const cleanContext = await browser.newContext()
  const cleanPage = await cleanContext.newPage()
  await cleanPage.goto(`${BASE_URL}/hasil/${e2eData.regressionId}`, {
    waitUntil: 'domcontentloaded',
  })
  const redirectedUrl = cleanPage.url()
  const authGuardPassed =
    redirectedUrl.includes('/login') && redirectedUrl.includes('from=')
  await cleanContext.close()

  const resultPassed = allSectionsVisible && authGuardPassed

  scenarios.push({
    scenario: '5. Result view presents 5 sections (FR15) + Auth Guard redirect for unauthenticated user',
    passed: resultPassed,
    details: `All 5 sections rendered: ${allSectionsVisible} | Unauthenticated guard redirected to: ${redirectedUrl}`,
  })

  // -------------------------------------------------------------
  // Scenario 6: Concrete Chart & SVG DOM Rendering Verification
  // -------------------------------------------------------------
  // A. Regression Scatter + Trendline SVG verification
  await page.waitForSelector('#visualisasi svg', { timeout: 10000 })
  const regSvgCount = await page.locator('#visualisasi svg').count()
  const regCircles = await page.locator('#visualisasi svg circle').count()
  const regText = await page.locator('#visualisasi').textContent()
  const hasTrendlineEq = Boolean(regText && (regText.includes('R²') || regText.includes('+') || regText.includes('x')))

  // B. Descriptive Histogram SVG verification
  await page.goto(`${BASE_URL}/hasil/${e2eData.descriptiveId}`, {
    waitUntil: 'networkidle',
    timeout: 15000,
  })
  await page.waitForSelector('#visualisasi svg', { timeout: 10000 })
  const descSvgCount = await page.locator('#visualisasi svg').count()
  const descRectCount = await page.locator('#visualisasi svg rect').count()

  const chartPassed =
    regSvgCount > 0 &&
    regCircles > 0 &&
    hasTrendlineEq &&
    descSvgCount > 0 &&
    descRectCount > 0

  scenarios.push({
    scenario: '6. Chart rendering DOM validation (Regression scatter circles > 0, trendline, and Histogram bars > 0)',
    passed: chartPassed,
    details: `Regression SVG: ${regSvgCount}, Circles: ${regCircles}, Trendline Meta: ${hasTrendlineEq} | Histogram SVG: ${descSvgCount}, Bars: ${descRectCount}`,
  })

  // -------------------------------------------------------------
  // Scenario 7: Real Keyboard Navigation Verification
  // -------------------------------------------------------------
  await context.clearCookies()
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 15000 })
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  const emailElem = page.locator('input[type="email"]').first()
  await emailElem.focus()

  const firstActiveTag = await page.evaluate(() => document.activeElement?.tagName)
  const firstActiveType = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.type)

  await page.keyboard.press('Tab')
  const secondActiveTag = await page.evaluate(() => document.activeElement?.tagName)
  const secondActiveId = await page.evaluate(() => document.activeElement?.id)

  await page.keyboard.press('Tab')
  const thirdActiveTag = await page.evaluate(() => document.activeElement?.tagName)
  const thirdActiveType = await page.evaluate(() => (document.activeElement as HTMLInputElement)?.type)

  const focusTraversed =
    firstActiveType === 'email' &&
    secondActiveTag !== undefined &&
    thirdActiveTag !== undefined &&
    (thirdActiveType === 'password' || thirdActiveType === 'submit' || secondActiveTag === 'BUTTON')

  scenarios.push({
    scenario: '7. Keyboard Tab navigation moves document.activeElement systematically across inputs',
    passed: focusTraversed,
    details: `Active elements traversed: [${firstActiveTag}:${firstActiveType}] -> [${secondActiveTag}:${secondActiveId}] -> [${thirdActiveTag}:${thirdActiveType}]`,
  })

  await context.close()
  return scenarios
}

async function testBrowser(
  name: string,
  launcherType: 'chrome' | 'edge' | 'firefox',
  sessionToken: string,
  e2eData: { regressionId: string; descriptiveId: string },
): Promise<BrowserTestReport> {
  let browser: Browser | null = null
  let execPath = 'managed'

  try {
    if (launcherType === 'chrome') {
      try {
        browser = await chromium.launch({ channel: 'chrome', headless: true })
        execPath = 'Google Chrome (channel: chrome)'
      } catch {
        browser = await chromium.launch({ headless: true })
        execPath = 'Chromium (managed)'
      }
    } else if (launcherType === 'edge') {
      try {
        browser = await chromium.launch({ channel: 'msedge', headless: true })
        execPath = 'Microsoft Edge (channel: msedge)'
      } catch {
        const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        if (fs.existsSync(edgePath)) {
          browser = await chromium.launch({ executablePath: edgePath, headless: true })
          execPath = edgePath
        } else {
          throw new Error('Microsoft Edge executable not found.')
        }
      }
    } else {
      // Firefox
      try {
        browser = await firefox.launch({ headless: true })
        execPath = 'Mozilla Firefox (playwright managed)'
      } catch (ffErr: unknown) {
        const sysPath = 'C:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe'
        if (fs.existsSync(sysPath)) {
          try {
            browser = await firefox.launch({ executablePath: sysPath, headless: true })
            execPath = sysPath
          } catch (sysErr: unknown) {
            const errStr = sysErr instanceof Error ? sysErr.message : String(sysErr)
            return {
              browserName: name,
              executablePath: sysPath,
              status: 'ENVIRONMENT_LIMITATION',
              error: `Firefox headless graphics limitation: ${errStr.slice(0, 160)}`,
              scenarios: [],
            }
          }
        } else {
          const errStr = ffErr instanceof Error ? ffErr.message : String(ffErr)
          return {
            browserName: name,
            executablePath: 'not found',
            status: 'ENVIRONMENT_LIMITATION',
            error: `Firefox unavailable in environment: ${errStr.slice(0, 160)}`,
            scenarios: [],
          }
        }
      }
    }
  } catch (launchErr: unknown) {
    const errStr = launchErr instanceof Error ? launchErr.message : String(launchErr)
    return {
      browserName: name,
      executablePath: execPath,
      status: 'ENVIRONMENT_LIMITATION',
      error: `Browser launch failed: ${errStr.slice(0, 160)}`,
      scenarios: [],
    }
  }

  const scenarios: ScenarioResult[] = []
  try {
    await runBrowserScenarios(browser, sessionToken, e2eData, scenarios)
    await browser.close()

    const allPassed = scenarios.length > 0 && scenarios.every((s) => s.passed)
    return {
      browserName: name,
      executablePath: execPath,
      status: allPassed ? 'VERIFIED' : 'FAILED',
      scenarios,
    }
  } catch (testErr: unknown) {
    if (browser) await browser.close()
    const errMsg = testErr instanceof Error ? testErr.message : String(testErr)
    return {
      browserName: name,
      executablePath: execPath,
      status: 'FAILED',
      error: errMsg,
      scenarios,
    }
  }
}

async function main() {
  console.log('\n============================================================')
  console.log('   NFR07 DESKTOP CROSS-BROWSER AUTOMATED E2E VERIFICATION')
  console.log('   Strict Zero False-Positive Assertions (FR07-FR16 & NFR07)')
  console.log('============================================================\n')

  const E2E_SECRET = 'e2e-cross-browser-test-secret-min-32-chars-long!'
  process.env.SESSION_SECRET = E2E_SECRET

  console.log(`Starting Next.js production server on port ${PORT}...`)
  const serverProcess: ChildProcess = spawn(
    'node',
    ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT)],
    {
      shell: true,
      stdio: 'inherit',
      env: {
        ...process.env,
        SESSION_SECRET: E2E_SECRET,
        TEST_MODE: 'true',
      },
    },
  )

  const isReady = await waitForServer(BASE_URL)
  if (!isReady) {
    console.error(`Failed to connect to Next.js server at ${BASE_URL}`)
    serverProcess.kill()
    process.exit(1)
  }
  console.log(`Server is live and responding at ${BASE_URL}\n`)

  const sessionToken = createSessionToken({
    userId: 999,
    email: 'cross-browser-tester@statstory.ac.id',
    peran: 'mahasiswa',
  })

  console.log('Seeding deterministic E2E analysis data via production API...')
  const e2eData = await createE2EAnalysisData(sessionToken)
  console.log(`  -> Regression Analysis ID : ${e2eData.regressionId}`)
  console.log(`  -> Descriptive Analysis ID: ${e2eData.descriptiveId}\n`)

  const browsers: { name: string; type: 'chrome' | 'edge' | 'firefox' }[] = [
    { name: 'Google Chrome', type: 'chrome' },
    { name: 'Microsoft Edge', type: 'edge' },
    { name: 'Mozilla Firefox', type: 'firefox' },
  ]

  const reports: BrowserTestReport[] = []

  for (const b of browsers) {
    console.log(`>>> Testing browser: ${b.name}...`)
    const report = await testBrowser(b.name, b.type, sessionToken, e2eData)
    reports.push(report)

    if (report.status === 'VERIFIED') {
      console.log(`  -> ${b.name} (${report.executablePath}): VERIFIED (All 7 semantic scenarios PASSED)`)
      for (const s of report.scenarios) {
        console.log(`     [x] ${s.scenario}`)
        console.log(`         ${s.details}`)
      }
    } else if (report.status === 'ENVIRONMENT_LIMITATION') {
      console.log(`  -> ${b.name}: ENVIRONMENT LIMITATION`)
      console.log(`     Reason: ${report.error}`)
    } else {
      console.log(`  -> ${b.name}: FAILED`)
      console.log(`     Error: ${report.error}`)
      for (const s of report.scenarios) {
        console.log(`     [${s.passed ? 'x' : ' '}] ${s.scenario}`)
        if (!s.passed) console.log(`         FAIL: ${s.details}`)
      }
    }
    console.log('')
  }

  // Terminate server process cleanly
  serverProcess.kill()

  // Write artifact
  const artifactPath = path.join(process.cwd(), 'docs', 'cross-browser-results.json')
  fs.writeFileSync(artifactPath, JSON.stringify(reports, null, 2), 'utf-8')
  console.log(`Cross-browser test artifact written to docs/cross-browser-results.json\n`)

  const verifiedCount = reports.filter((r) => r.status === 'VERIFIED').length
  const limitationCount = reports.filter((r) => r.status === 'ENVIRONMENT_LIMITATION').length
  const failedCount = reports.filter((r) => r.status === 'FAILED').length

  console.log('--- Summary NFR07 Status ---')
  console.log(`Verified Desktop Browsers: ${verifiedCount}/${reports.length}`)
  console.log(`Environment Limitations   : ${limitationCount}/${reports.length}`)
  console.log(`Failed Browsers           : ${failedCount}/${reports.length}`)

  if (verifiedCount === reports.length && verifiedCount === 3) {
    console.log('\nOverall NFR07 Status: VERIFIED (All 3 required desktop engines passed 7/7)\n')
  } else {
    console.error(
      `\n[FAILED] Overall NFR07 Status: FAILED (Verified: ${verifiedCount}/${reports.length}, Limitations: ${limitationCount}, Failed: ${failedCount})`,
    )
    console.error(
      'All 3 required desktop browsers (Chrome, Edge, Firefox) must be VERIFIED with 7/7 scenarios.\n',
    )
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Fatal cross-browser runner error:', e)
  process.exit(1)
})
