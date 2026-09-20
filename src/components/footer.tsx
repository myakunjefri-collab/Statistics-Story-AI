export function Footer() {
  return (
    <footer className="border-t border-ivory/10 bg-navy px-6 py-14 text-ivory md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-serif text-2xl italic tracking-tight">Statistics Story AI</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/50">
            Dari angka menjadi cerita — membantu mahasiswa memahami hasil statistik melalui narasi,
            visualisasi, dan contoh kasus.
          </p>
        </div>

        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <a href="#cara-kerja" className="text-ivory/60 transition-colors hover:text-ivory">
            Cara Kerja
          </a>
          <a href="#fitur" className="text-ivory/60 transition-colors hover:text-ivory">
            Fitur
          </a>
          <a href="#tentang" className="text-ivory/60 transition-colors hover:text-ivory">
            Tentang
          </a>
          <a href="#mulai" className="text-ivory/60 transition-colors hover:text-ivory">
            Mulai Mencoba
          </a>
        </nav>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1400px] items-center justify-between border-t border-ivory/10 pt-6 text-xs text-ivory/40">
        <span>&copy; {new Date().getFullYear()} Statistics Story AI</span>
        <span className="tnum tracking-[0.2em]">DATA &rarr; CERITA</span>
      </div>
    </footer>
  )
}
