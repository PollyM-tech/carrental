/** Match Convex CLI networking on connections with slower IPv4/IPv6 setup. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const [dns, net] = await Promise.all([import("node:dns"), import("node:net")]);
    dns.setDefaultResultOrder("ipv4first");
    // Keep both address families available, but allow a realistic connection window.
    net.setDefaultAutoSelectFamilyAttemptTimeout(1000);
  }
}
