import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Placement<span className="text-accent">Coach</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-muted hover:text-foreground">
            Dashboard
          </Link>
          <Link
            href="/gd/setup"
            className="rounded-md bg-accent px-3 py-1.5 font-medium text-white hover:opacity-90"
          >
            Start GD
          </Link>
        </nav>
      </div>
    </header>
  );
}
