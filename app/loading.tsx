import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/40 via-white to-primary/10 p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(104,178,173,0.25),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(104,178,173,0.2),transparent_45%)]"
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/90 shadow-2xl ring-1 ring-primary/20">
          <div className="absolute h-28 w-28 animate-ping rounded-full bg-primary/20" />
          <div className="absolute h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Spinner className="size-8 text-primary" />
        </div>
        <p className="text-sm font-medium text-gray-700">Loading...</p>
      </div>
    </main>
  );
}
