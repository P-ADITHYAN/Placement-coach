"use client";

import { useEffect, useState } from "react";

/**
 * Shows how long the student has to start speaking before an AI participant
 * takes the floor. Mounted only while the floor is open, and re-mounted (via
 * its key) each time it reopens, so it always counts down from the start.
 */
export function FloorCountdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);

  // Derived from elapsed time (not by counting ticks) so the number stays in
  // step with the room's own 5-second timer.
  useEffect(() => {
    const startedAt = performance.now();
    const id = window.setInterval(() => {
      setLeft(Math.max(0, Math.ceil(seconds - (performance.now() - startedAt) / 1000)));
    }, 200);
    return () => window.clearInterval(id);
  }, [seconds]);

  return (
    <p className="text-sm font-medium text-accent" role="timer" aria-label={`${left} seconds left to start speaking`}>
      {left > 0 ? `Your chance to speak: ${left}s` : "Passing the floor…"}
    </p>
  );
}
