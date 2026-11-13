import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME}: vale a pena ir surfar?`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          color: "#eaf6f7",
          background:
            "linear-gradient(135deg, #030d16 0%, #07263a 55%, #0b5560 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: "linear-gradient(135deg, #5ee6d8, #38bdf8)",
            }}
          />
          <div style={{ fontSize: 84, fontWeight: 800 }}>{SITE_NAME}</div>
        </div>
        <div style={{ marginTop: 48, fontSize: 52, fontWeight: 700 }}>
          Vale a pena ir surfar?
        </div>
        <div
          style={{ marginTop: 20, fontSize: 32, color: "#9db8c4", maxWidth: 900 }}
        >
          Uma nota de 0 a 10 por pico e por horário, ajustada ao seu nível. Do
          Sul ao Nordeste.
        </div>
      </div>
    ),
    { ...size },
  );
}
