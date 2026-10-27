/** Match Convex CLI networking on connections with slower IPv4/IPv6 setup. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const [dns, net] = await Promise.all([import("node:dns"), import("node:net")]);
    dns.setDefaultResultOrder("ipv4first");
    // Allow slower address-family connection establishment.
    net.setDefaultAutoSelectFamilyAttemptTimeout(2000);
    if (process.env.MOVARA_IPV4_ONLY === "true") net.setDefaultAutoSelectFamily(false);
  }
}
