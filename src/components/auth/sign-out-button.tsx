"use client";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await createClient().auth.signOut();
        // Full page load so no signed-in pages stay cached in the router
        // (router.refresh() only clears the current route's cache).
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
      }}
      className="rounded-md px-3 py-1.5 text-muted hover:text-foreground"
    >
      Sign out
    </button>
  );
}
