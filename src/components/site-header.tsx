import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getUserId } from "@/lib/supabase/server";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          Placement<span className="text-accent">Coach</span>
        </Link>
        <Suspense>
          <Nav />
        </Suspense>
      </div>
    </header>
  );
}

async function Nav() {
  if (!(await getUserId())) return null;
  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link href="/dashboard" className="hidden rounded-md px-3 py-1.5 text-muted hover:text-foreground sm:block">
        Dashboard
      </Link>
      <SignOutButton />
      <Link href="/gd/setup" className="rounded-md bg-accent px-3 py-1.5 font-medium text-white hover:opacity-90">
        Start GD
      </Link>
    </nav>
  );
}
