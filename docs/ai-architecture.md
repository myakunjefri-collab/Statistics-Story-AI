# AI Provider Architecture & Fallback Resilience

Dokumen ini mendokumentasikan antarmuka provider AI, isolasi data rahasia, penanganan error/timeout (NFR05 / TC12), dan validasi skema keluaran Zod (FR11, FR12, FR14).

---

## 1. AI Architecture Overview

```mermaid
graph TD
    Client["Client Browser"] --> Route["Route Handler: /api/calculate"]
    Route --> Engine["Statistical Engine (Pure Math)"]
    Engine --> Formatted["Structured Statistical Metrics (JSON)"]
    
    Formatted --> AI_Orchestrator["generateInterpretationWithFallback()"]
    
    AI_Orchestrator -->|Attempt Primary Provider| Ext_AI["ExternalLLMProvider (Gemini / OpenAI)"]
    
    Ext_AI -->|Success| Zod_Check["Zod Validation (AIInterpretationOutputSchema)"]
    Ext_AI -->|Timeout (8s) / Network Error / Invalid JSON| Fallback["FallbackProvider (Deterministic Rule-Based)"]
    
    Fallback --> Result["Validated Narrative & Example Case"]
    Zod_Check --> Result
    
    Result --> DB["Atomic PostgreSQL Transaction (Post-AI)"]
```

---

## 2. Pluggable `AIProvider` Interface

Setiap provider mengimplementasikan interface standar (`src/lib/ai/ai-provider.ts`):

```typescript
export interface AIProvider {
  readonly name: string
  generateInterpretation(options: AIProviderGenerateOptions): Promise<AIInterpretationOutput>
}
```

### 2.1 ExternalLLMProvider (`src/lib/ai/external-provider.ts`)
- Mendukung model **Google Gemini** (`gemini-1.5-flash`) dan **OpenAI** (`gpt-4o-mini`).
- Menerapkan **Timeout 8 detik** menggunakan `AbortController`.
- Mengirimkan hasil statistik terstruktur murni, **BUKAN kredensial, password, atau identitas pribadi mahasiswa**.
- Output JSON dari model diparsing dan divalidasi ketat menggunakan Zod schema `aiInterpretationOutputSchema`.

### 2.2 FallbackProvider (`src/lib/ai/fallback-provider.ts`)
- Provider berbasis aturan deterministik statistik (Rule-Based Expert System).
- Menghasilkan narasi edukatif terperinci dan contoh kasus/analogi dunia nyata yang relevan untuk 4 metode statistik:
  1. Deskriptif (mean, median, modus, SD sebaran data, rentang)
  2. Uji t (perbandingan dua rata-rata, t-statistic, derajat kebebasan, p-value, signifikansi)
  3. Korelasi (arah hubungan positif/negatif, kekuatan hubungan, nilai r, p-value)
  4. Regresi (persamaan linier OLS, slope kenaikan, intercept titik potong, koefisien determinasi $R^2$)
- Menjamin sistem **tidak pernah crash** ketika koneksi internet terputus, API key kuota habis, atau server AI eksternal down (NFR05 / TC12).

---

## 3. Transparansi UI: AI-Generated vs Fallback Interpretation

Sesuai aturan kontrak, sistem tidak pernah memalsukan narasi fallback sebagai hasil AI:
- Record di database menyimpan field `sumber_narasi: 'ai' | 'fallback'`.
- Di antarmuka pengguna (`src/components/analysis-result/narrative-card.tsx`), lencana (badge) transparan ditampilkan:
  - **AI-Generated:** jika dihasilkan oleh penyedia model bahasa eksternal.
  - **Fallback Statistical Interpretation:** jika dihasilkan oleh mesin fallback cadangan karena gangguan jaringan/timeout.

---

## 4. Bukti Verifikasi Ketahanan (TC10 & TC12)

- **TC10 (Generasi Narasi AI):** Terverifikasi melalui `tests/ai/provider.test.ts` dan `tests/integration/calculate-result-roundtrip.test.ts`. Hasil komputasi statistik diteruskan dan menghasilkan narasi interpretatif serta contoh kasus kontekstual valid.
- **TC12 (Penanganan Timeout / Error AI Tanpa Crash):** Terverifikasi melalui simulasi kegagalan provider di mana pemanggilan API external yang timeout (> 8s) atau melempar network error langsung dialihkan ke `FallbackProvider`. Sistem tidak crash, angka statistik tetap utuh, dan antarmuka secara transparan menampilkan status fallback (NFR05).
