import { ImageResponse } from "next/og";
export const alt = "Movara Car Hire — self-drive rentals in Kenya";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#0B1C4D", color: "white", padding: 76, flexDirection: "column", justifyContent: "center", borderBottom: "20px solid #FF7A00" }}><div style={{ display: "flex", color: "#FF9A40", fontSize: 32, letterSpacing: 5 }}>MOVARA CAR HIRE</div><div style={{ display: "flex", marginTop: 32, fontSize: 76, fontWeight: 700 }}>Your journey. Your drive.</div><div style={{ display: "flex", marginTop: 30, fontSize: 32 }}>Self-drive rentals · Nairobi · Kenya</div><div style={{ display: "flex", marginTop: 42, fontSize: 28 }}>+254 716 741 039  |  www.movaracarhire.com</div></div>, size);
}
