import type {
  CorrelationResult,
  DescriptiveResult,
  RegressionResult,
  TTestResult,
} from '../statistics/types'
import type { AIProvider, AIProviderGenerateOptions } from './ai-provider'
import type { AIInterpretationOutput } from './schemas'

export class FallbackProvider implements AIProvider {
  readonly name = 'Rule-Based Statistical Interpretation (Fallback)'

  async generateInterpretation(
    options: AIProviderGenerateOptions,
  ): Promise<AIInterpretationOutput> {
    const { analysisType, statisticalResult, language = 'id' } = options

    switch (analysisType) {
      case 'Deskriptif': {
        const res = statisticalResult as DescriptiveResult
        const narrative = [
          `Berdasarkan analisis statistik deskriptif terhadap ${res.n} sampel data:`,
          `- Rata-rata (mean) data tercatat sebesar ${res.mean.toFixed(2)}, yang mencerminkan titik pusat distribusi data.`,
          `- Nilai tengah (median) berada pada angka ${res.median.toFixed(2)}, menunjukkan separuh data berada di bawah nilai ini.`,
          `- Modus data: ${res.modeDescription}.`,
          `- Sebaran data memiliki standar deviasi sampel sebesar ${res.sampleStandardDeviation.toFixed(2)} dengan rentang data antara nilai minimum ${res.minimum.toFixed(2)} hingga maksimum ${res.maximum.toFixed(2)}.`,
          res.sampleStandardDeviation < res.mean * 0.3
            ? 'Standar deviasi relatif rendah mengindikasikan variasi data yang cukup homogen di sekitar nilai rata-rata.'
            : 'Standar deviasi yang cukup tinggi mengindikasikan sebaran data yang heterogen dan bervariasi luas.',
        ].join('\n')

        const exampleCase =
          'Ibaratkan nilai ujian sebuah kelas: jika rata-rata adalah 75 dan standar deviasi rendah, hampir semua mahasiswa mendapat nilai sekitar 70-80. Sebaliknya jika standar deviasi tinggi, ada mahasiswa yang mendapat nilai sangat tinggi (95) sekaligus ada yang mendapat nilai sangat rendah (40).'

        return {
          narrative,
          exampleCase,
          language,
          sumber: 'fallback',
        }
      }

      case 'Uji t': {
        const res = statisticalResult as TTestResult
        const sigText = res.isSignificant
          ? `Terdapat perbedaan yang signifikan secara statistik (p = ${res.pValue.toFixed(4)} < 0.05).`
          : `Tidak terdapat perbedaan yang signifikan secara statistik (p = ${res.pValue.toFixed(4)} >= 0.05). Perbedaan rata-rata kemungkinan terjadi karena variasi kebetulan.`

        const narrative = [
          `Hasil perbandingan dua kelompok menggunakan ${res.testMethod}:`,
          `- Rata-rata ${res.group1.name} adalah ${res.group1.mean.toFixed(2)} (SD = ${res.group1.standardDeviation.toFixed(2)}, n = ${res.group1.n}).`,
          `- Rata-rata ${res.group2.name} adalah ${res.group2.mean.toFixed(2)} (SD = ${res.group2.standardDeviation.toFixed(2)}, n = ${res.group2.n}).`,
          `- Nilai t-statistic yang diperoleh adalah ${res.tStatistic.toFixed(4)} dengan derajat kebebasan df = ${res.degreesOfFreedom.toFixed(2)}.`,
          `- Kesimpulan: ${sigText}`,
        ].join('\n')

        const exampleCase =
          'Bayangkan membandingkan efektivitas metode belajar A dan B. Jika p-value sangat kecil (< 0.05), kita yakin bahwa metode belajar baru benar-benar memberikan dampak nyata, bukan sekadar kebetulan siswa di kelas tersebut memang lebih pintar.'

        return {
          narrative,
          exampleCase,
          language,
          sumber: 'fallback',
        }
      }

      case 'Korelasi': {
        const res = statisticalResult as CorrelationResult
        const sigText = res.isSignificant
          ? 'Hubungan ini signifikan secara statistik (p < 0.05).'
          : 'Hubungan ini tidak signifikan secara statistik (p >= 0.05).'

        const narrative = [
          `Analisis korelasi Pearson terhadap ${res.n} pasangan data menunjukkan nilai koefisien r = ${res.r.toFixed(4)}.`,
          `- Arah hubungan: ${res.direction} (${res.r >= 0 ? 'kenaikan variabel pertama diiringi kenaikan variabel kedua' : 'kenaikan variabel pertama diiringi penurunan variabel kedua'}).`,
          `- Kekuatan hubungan: ${res.strength}.`,
          `- Signifikansi: Nilai t = ${res.tStatistic.toFixed(4)} dengan p-value = ${res.pValue.toFixed(4)}. ${sigText}`,
        ].join('\n')

        const exampleCase =
          'Seperti hubungan antara waktu belajar dengan nilai ujian. Korelasi positif kuat berarti semakin banyak jam yang dihabiskan untuk belajar, semakin tinggi pula perkiraan nilai yang didapatkan.'

        return {
          narrative,
          exampleCase,
          language,
          sumber: 'fallback',
        }
      }

      case 'Regresi': {
        const res = statisticalResult as RegressionResult
        const r2Percent = (res.rSquared * 100).toFixed(2)
        const narrative = [
          `Analisis regresi linier sederhana menghasilkan model persamaan: ${res.equation}.`,
          `- Koefisien arah (slope) = ${res.slope.toFixed(4)}: setiap kenaikan satu satuan pada variabel independen (X) diperkirakan meningkatkan/menurunkan variabel dependen (Y) sebesar ${Math.abs(res.slope).toFixed(4)} satuan.`,
          `- Nilai konstanta (intercept) = ${res.intercept.toFixed(4)}: perkiraan nilai Y ketika X bernilai 0.`,
          `- Koefisien Determinasi (R²) = ${res.rSquared.toFixed(4)}: sebesar ${r2Percent}% variabilitas pada variabel Y dapat dijelaskan oleh variabel X dalam model ini.`,
          `- Standar error estimasi: ${res.standardError.toFixed(4)}.`,
        ].join('\n')

        const exampleCase =
          'Jika Anda memprediksi pengeluaran berdasarkan pendapatan: model regresi memberitahu Anda berapa perkiraan tambahan pengeluaran untuk setiap kenaikan gaji satu juta rupiah.'

        return {
          narrative,
          exampleCase,
          language,
          sumber: 'fallback',
        }
      }
    }
  }
}

export { FallbackProvider as FallbackAIProvider }
