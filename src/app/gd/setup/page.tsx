import type { Metadata } from "next";
import { SetupForm } from "@/components/gd/setup-form";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Set up a GD" };

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Set up your group discussion</h1>
        <p className="mt-1 text-muted">
          You will discuss the topic with four AI participants. Speak by microphone, one turn at a time.
        </p>
      </div>
      <Card>
        <SetupForm />
      </Card>
    </div>
  );
}
