import fs from 'node:fs'
import path from 'node:path'

interface ComponentAuditItem {
  filePath: string
  fileName: string
  category: 'page' | 'layout' | 'scene' | 'ui' | 'feature' | 'provider'
  isClient: boolean
  boundaryReason: string
  lines: number
}

function scanDirectory(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDirectory(fullPath, fileList)
      }
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx'))) {
      fileList.push(fullPath)
    }
  }
  return fileList
}

function auditComponents(): void {
  const rootDir = process.cwd()
  const targetDirs = [
    path.join(rootDir, 'app'),
    path.join(rootDir, 'src', 'components'),
  ]

  const files: string[] = []
  for (const d of targetDirs) {
    scanDirectory(d, files)
  }

  const items: ComponentAuditItem[] = []

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8')
    const relative = path.relative(rootDir, file).replace(/\\/g, '/')
    const firstNonComment = content
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('//') && !l.startsWith('/*'))[0] || ''

    const hasUseClient =
      firstNonComment.includes("'use client'") ||
      firstNonComment.includes('"use client"') ||
      content.includes("'use client'") ||
      content.includes('"use client"')

    let category: ComponentAuditItem['category'] = 'feature'
    if (relative.startsWith('app/')) {
      if (relative.endsWith('layout.tsx')) category = 'layout'
      else if (relative.endsWith('page.tsx')) category = 'page'
      else category = 'page'
    } else if (relative.includes('/scenes/')) {
      category = 'scene'
    } else if (relative.includes('/ui/')) {
      category = 'ui'
    } else if (relative.includes('/providers/')) {
      category = 'provider'
    }

    let reason = 'React Server Component (No Client Directives/Hooks)'
    if (hasUseClient) {
      if (content.includes('useState') || content.includes('useReducer')) {
        reason = 'Client Boundary: Local Interactive State (useState/useReducer)'
      } else if (content.includes('useEffect') || content.includes('useLayoutEffect')) {
        reason = 'Client Boundary: Browser Lifecycle (useEffect)'
      } else if (content.includes('useUIStore')) {
        reason = 'Client Boundary: Zustand UI Store integration'
      } else if (content.includes('useQuery') || content.includes('useMutation')) {
        reason = 'Client Boundary: TanStack Query remote mutation'
      } else if (content.includes('motion.')) {
        reason = 'Client Boundary: Motion animation DOM hooks'
      } else {
        reason = 'Client Boundary: Explicit "use client" directive'
      }
    }

    const lines = content.split('\n').length

    items.push({
      filePath: relative,
      fileName: path.basename(file),
      category,
      isClient: hasUseClient,
      boundaryReason: reason,
      lines,
    })
  }

  const total = items.length
  const clientCount = items.filter((i) => i.isClient).length
  const serverCount = total - clientCount
  const rscPercentage = Number(((serverCount / total) * 100).toFixed(2))

  console.log('\n============================================================')
  console.log('   REACT SERVER COMPONENTS (RSC) ARCHITECTURAL AUDIT')
  console.log('============================================================\n')
  console.log(`Total Component Files Audited : ${total}`)
  console.log(`Server Component Modules (RSC) : ${serverCount}`)
  console.log(`Client Boundary Modules        : ${clientCount}`)
  console.log(`Documented RSC Usage Ratio     : ${rscPercentage}% (Target: >= 70%)\n`)
  console.log('Evaluation: ' + (rscPercentage >= 70 ? 'PASS (Meets Target >= 70%)' : 'FAIL (Below 70%)'))
  console.log('\nNote: This is a documented engineering measurement of component boundary usage.')
  console.log('Framework internal: server-component-modules / (server-component-modules + client-component-modules)\n')

  console.log('--- Sample Breakdown by Category ---')
  const categories = ['page', 'layout', 'scene', 'ui', 'feature', 'provider'] as const
  for (const cat of categories) {
    const catItems = items.filter((i) => i.category === cat)
    const catRSC = catItems.filter((i) => !i.isClient).length
    console.log(
      `  - ${cat.toUpperCase().padEnd(10)}: Total ${catItems.length.toString().padStart(2)}, Server: ${catRSC
        .toString()
        .padStart(2)}, Client: ${(catItems.length - catRSC).toString().padStart(2)}`,
    )
  }

  // Save json audit output
  const auditReport = {
    timestamp: new Date().toISOString(),
    metrics: {
      totalComponents: total,
      serverComponents: serverCount,
      clientComponents: clientCount,
      rscRatioPercentage: rscPercentage,
      targetPercentage: 70,
      status: rscPercentage >= 70 ? 'VERIFIED' : 'FAILED',
    },
    items,
  }

  const docsDir = path.join(rootDir, 'docs')
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(path.join(docsDir, 'rsc-audit.json'), JSON.stringify(auditReport, null, 2), 'utf-8')
  console.log('\nAudit artifact written to docs/rsc-audit.json\n')
}

auditComponents()
