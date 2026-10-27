"use client";
import ConnectionProblem from "@/components/auth/ConnectionProblem";
export default function DashboardError({ reset }: { reset: () => void }) { return <ConnectionProblem reset={reset} />; }
