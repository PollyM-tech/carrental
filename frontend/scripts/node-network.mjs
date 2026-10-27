// Shared Node networking options; TLS certificate checks remain enabled.
import dns from 'node:dns';
import net from 'node:net';
dns.setDefaultResultOrder('ipv4first');
net.setDefaultAutoSelectFamilyAttemptTimeout(2000);
// Optional diagnostic workaround, rather than disabling IPv6 for every deployment.
if (process.env.MOVARA_IPV4_ONLY === 'true') net.setDefaultAutoSelectFamily(false);
