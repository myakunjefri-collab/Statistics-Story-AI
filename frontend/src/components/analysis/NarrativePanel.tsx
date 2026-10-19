"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Globe,
  Check,
  ShieldAlert,
  Copy,
  CheckCheck,
  Clock,
  BookOpen,
} from "lucide-react";
import type { AnalysisStatus } from "@/lib/types/analysis";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NarrativePanelProps {
  status: AnalysisStatus;
  narasi?: {
    id: string | null;
    en: string | null;
  };
  onRegenerate: (lang: "id" | "en") => void;
  isRegenerating: boolean;
}

export const NarrativePanel: React.FC<NarrativePanelProps> = ({
  status,
  narasi,
  onRegenerate,
  isRegenerating,
}) => {
  const [selectedLang, setSelectedLang] = useState<"id" | "en">("id");
  const [copied, setCopied] = useState(false);

  const currentNarrative = narasi ? narasi[selectedLang] : null;

  const handleCopy = () => {
    if (!currentNarrative) return;
    navigator.clipboard.writeText(currentNarrative);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = currentNarrative
    ? currentNarrative.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div className="border border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      {/* Top Header & Controls */}
      <div className="bg-[#EFEFEF] border-b border-black px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#003BFF] text-white flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-mono-tech text-xs font-bold text-black uppercase tracking-wider block">
              NARASI INTERPRETASI STATISTIK (FR-12)
            </span>
            {currentNarrative && (
              <span className="font-mono-tech text-[10px] text-black/60 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3 h-3 text-[#003BFF]" />
                <span>~{readTimeMinutes} menit baca</span>
                <span>•</span>
                <span>{wordCount} kata</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Button */}
          {currentNarrative && (
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 border border-black bg-white hover:bg-[#EBEB00] transition-colors font-mono-tech text-xs font-bold flex items-center gap-1.5"
              title="Salin narasi lengkap ke clipboard"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-green-700" />
                  <span className="text-green-700">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-black" />
                  <span>Salin Narasi</span>
                </>
              )}
            </button>
          )}

          {/* Bahasa Tabs */}
          <div className="flex border border-black bg-white divide-x divide-black font-mono-tech text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedLang("id")}
              className={`px-3 py-1 transition-colors ${
                selectedLang === "id" ? "bg-black text-white" : "hover:bg-[#EBEB00]"
              }`}
            >
              ID (Indonesia)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLang("en")}
              className={`px-3 py-1 transition-colors ${
                selectedLang === "en" ? "bg-black text-white" : "hover:bg-[#EBEB00]"
              }`}
            >
              EN (English)
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            type="button"
            onClick={() => onRegenerate(selectedLang)}
            disabled={isRegenerating || status === "diproses"}
            className="px-3 py-1 border border-black font-mono-tech text-xs font-bold bg-[#EBEB00] hover:bg-black hover:text-[#EBEB00] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Memproses..." : "Buat Ulang"}</span>
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-6 md:p-8">
        {/* State: Sedang diproses AI (FR-11) */}
        {(status === "diproses" || isRegenerating) && (
          <div className="p-8 border border-black/20 bg-[#FBFBFB] text-center space-y-3">
            <div className="w-8 h-8 border-2 border-black border-t-[#003BFF] animate-spin mx-auto" />
            <div className="font-mono-tech text-xs font-bold text-black uppercase tracking-wider">
              AI SEDANG MENGULAS & MENYUSUN STORYTELLING DATA ({selectedLang.toUpperCase()})...
            </div>
            <div className="font-mono-tech text-[11px] text-black/60 max-w-md mx-auto leading-relaxed">
              Menghubungkan variabel data, mengevaluasi dinamika distribusi, dan merangkum wawasan akademis tanpa tabel kaku.
            </div>
          </div>
        )}

        {/* State: Narasi Gagal (FR-11) */}
        {status === "narasi_gagal" && !isRegenerating && (
          <div className="border border-[#FF2E2E] bg-[#FF2E2E]/10 p-5 font-mono-tech text-xs text-[#C40000] space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Generasi Narasi AI Gagal (Status: narasi_gagal)</span>
            </div>
            <p className="text-black/80 font-sans text-sm leading-relaxed">
              AI Orchestrator mengalami kendala saat memproses hasil analisis. Angka hasil statistik deterministik dan visualisasi tetap aman dan akurat.
            </p>
            <button
              type="button"
              onClick={() => onRegenerate(selectedLang)}
              className="px-4 py-2 bg-[#FF2E2E] text-white font-mono-tech text-xs font-bold hover:bg-black transition-colors"
            >
              Coba Ulang Generasi Narasi
            </button>
          </div>
        )}

        {/* State: Gagal Perhitungan */}
        {status === "gagal" && !isRegenerating && (
          <div className="border border-[#FF2E2E] bg-[#FF2E2E]/10 p-4 font-mono-tech text-xs text-[#C40000] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Terjadi kesalahan pada pemrosesan backend. Silakan periksa kembali konfigurasi dataset Anda.</span>
          </div>
        )}

        {/* State: Berhasil / Ada Teks Narasi */}
        {currentNarrative && !isRegenerating && (
          <div className="space-y-6">
            <div className="max-w-none text-black">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl md:text-2xl font-bold font-sans text-black mt-6 mb-4 pb-2 border-b-2 border-black flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 bg-[#003BFF] inline-block shrink-0" />
                      <span>{children}</span>
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg md:text-xl font-bold font-sans text-black mt-6 mb-3 pb-1 border-b border-black/15 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#003BFF] inline-block shrink-0" />
                      <span>{children}</span>
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <div className="mt-8 mb-3 pt-4 border-t border-black/10 first:mt-0 first:pt-0 first:border-t-0 flex items-center gap-2.5">
                      <span className="w-2 h-4 bg-[#003BFF] inline-block shrink-0" />
                      <h3 className="text-base md:text-lg font-bold font-sans text-black tracking-tight">
                        {children}
                      </h3>
                    </div>
                  ),
                  p: ({ children }) => (
                    <p className="font-sans text-sm md:text-base leading-relaxed text-black/85 mb-4 font-normal">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-black">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="space-y-2.5 my-4 pl-0 list-none">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="space-y-2.5 my-4 pl-6 list-decimal font-sans text-sm md:text-base leading-relaxed text-black/90">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="font-sans text-sm md:text-base leading-relaxed text-black/90 flex items-start gap-3 p-3.5 bg-[#FBFBFB] border-l-4 border-[#003BFF] border-y border-r border-black/10 hover:bg-[#F4F7FF] transition-colors">
                      <span className="w-1.5 h-1.5 bg-[#003BFF] mt-2 shrink-0 inline-block" />
                      <div className="flex-1">{children}</div>
                    </li>
                  ),
                  hr: () => <hr className="my-6 border-t border-black/10" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#EBEB00] bg-[#FFFDE6] p-4 my-5 font-sans text-sm md:text-base text-black/90 italic shadow-sm">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <table className="w-full text-left font-sans text-xs md:text-sm border-collapse bg-white">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-[#EFEFEF] border-b border-black font-mono-tech text-xs uppercase font-bold text-black">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-black/10">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-[#F9F9F9] transition-colors">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 border-r border-black/10 last:border-r-0 font-bold bg-[#EFEFEF]">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2.5 border-r border-black/10 last:border-r-0 text-black/90">
                      {children}
                    </td>
                  ),
                }}
              >
                {currentNarrative}
              </ReactMarkdown>
            </div>

            <div className="border-t border-black/10 pt-4 flex flex-wrap items-center justify-between gap-2 font-mono-tech text-[10px] text-black/50">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>BAHASA: {selectedLang === "id" ? "INDONESIA (ID)" : "ENGLISH (EN)"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#003BFF] font-bold">
                <Check className="w-3.5 h-3.5" />
                <span>GUARDRAIL NUMERIK LOLOS</span>
              </div>
            </div>
          </div>
        )}

        {/* State Kosong */}
        {!currentNarrative && status !== "diproses" && status !== "narasi_gagal" && !isRegenerating && (
          <div className="p-8 text-center font-mono-tech text-xs text-black/50 space-y-2">
            <div>Narasi untuk bahasa {selectedLang.toUpperCase()} belum dibuat.</div>
            <div>Klik tombol &quot;Buat Ulang&quot; di atas untuk meminta AI menyusun storytelling data.</div>
          </div>
        )}
      </div>

      {/* Penafian Wajib Bantuan AI */}
      <div className="border-t border-black bg-[#FFFDE6] px-4 py-2.5 font-mono-tech text-[10px] text-black/80 flex items-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-[#003BFF] shrink-0" />
        <span>
          <strong>Pemberitahuan Akademis:</strong> Narasi interpretatif disusun dengan bantuan kecerdasan buatan (AI) berbasis analisis angka deterministik SciPy/pandas dan berfungsi sebagai pemantik telaah akademik.
        </span>
      </div>
    </div>
  );
};
