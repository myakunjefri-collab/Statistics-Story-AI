/**
 * Deterministic Test Fixtures for E2E Cross-Browser Verification
 * Contains verified numeric inputs and expected statistical outcomes
 * for all 4 supported statistical test types (FR07, FR08, FR09, FR10).
 */

export interface E2EAnalysisFixture {
  name: string
  jenisAnalisis: 'Deskriptif' | 'Uji t' | 'Korelasi' | 'Regresi'
  formatData: 'csv' | 'manual'
  fileName?: string
  rawContent: string
  selectedColumns?: {
    groupColumn?: string
    valueColumn?: string
    xColumn?: string
    yColumn?: string
  }
}

export const E2E_DESCRIPTIVE_FIXTURE: E2EAnalysisFixture = {
  name: 'E2E Validasi Deskriptif Bivariate Bins',
  jenisAnalisis: 'Deskriptif',
  formatData: 'manual',
  rawContent: '12, 15, 12, 18, 22, 25, 22, 30, 14, 18',
}

export const E2E_TTEST_FIXTURE: E2EAnalysisFixture = {
  name: 'E2E Validasi Uji t Dua Kelompok Bebas',
  jenisAnalisis: 'Uji t',
  formatData: 'csv',
  fileName: 'ttest_sample.csv',
  rawContent: `kelompok,nilai
Kontrol,65
Kontrol,70
Kontrol,72
Kontrol,68
Kontrol,74
Eksperimen,85
Eksperimen,88
Eksperimen,92
Eksperimen,86
Eksperimen,90`,
  selectedColumns: {
    groupColumn: 'kelompok',
    valueColumn: 'nilai',
  },
}

export const E2E_CORRELATION_FIXTURE: E2EAnalysisFixture = {
  name: 'E2E Validasi Korelasi Jam Belajar vs Nilai',
  jenisAnalisis: 'Korelasi',
  formatData: 'manual',
  rawContent: `jam_belajar,skor_ujian
2,55
4,68
6,78
8,88
10,95`,
}

export const E2E_REGRESSION_FIXTURE: E2EAnalysisFixture = {
  name: 'E2E Validasi Regresi Linier OLS Bebas',
  jenisAnalisis: 'Regresi',
  formatData: 'csv',
  fileName: 'regresi_sample.csv',
  rawContent: `x,y
1,2.2
2,2.8
3,3.6
4,4.5
5,5.1
6,5.9
7,6.8
8,7.5`,
  selectedColumns: {
    xColumn: 'x',
    yColumn: 'y',
  },
}
