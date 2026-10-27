"use client";
import ConnectionProblem from "@/components/auth/ConnectionProblem";
export default function AccountError({ reset }: { reset: () => void }) { return <ConnectionProblem reset={reset} />; }
