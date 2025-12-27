"use client";

import { authClient } from "@/lib/auth-client";

export default function App({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
    </div>
  );
}
