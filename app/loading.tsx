export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative size-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <p className="font-serif text-lg italic text-muted-foreground animate-pulse">
          Memuat narasi statistik...
        </p>
      </div>
    </div>
  )
}
