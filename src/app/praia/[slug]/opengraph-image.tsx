import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { PHOTOS } from "@/lib/photos";
import { SITE_NAME } from "@/lib/site";
import { getSpot, SPOTS } from "@/lib/spots";
import { REGION_LABELS } from "@/lib/types";

export const alt = "Previsão de surfe do pico";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return SPOTS.map(({ slug }) => ({ slug }));
}

async function photoDataUrl(slug: string): Promise<string | null> {
  const photo = PHOTOS[slug];
  if (!photo) return null;
  try {
    const file = await readFile(join(process.cwd(), "public", photo.src));
    return `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spot = getSpot(slug);
  const photo = spot ? await photoDataUrl(slug) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #030d16 0%, #07263a 60%, #0b5560 100%)",
          color: "#eaf6f7",
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            background:
              "linear-gradient(0deg, rgba(3,13,22,0.95) 0%, rgba(3,13,22,0.35) 60%, rgba(3,13,22,0.55) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: 72,
            width: "100%",
          }}
        >
          <div style={{ fontSize: 30, color: "#5ee6d8", textTransform: "uppercase" }}>
            {spot ? REGION_LABELS[spot.region] : SITE_NAME}
          </div>
          <div style={{ fontSize: 110, fontWeight: 800, lineHeight: 1.05 }}>
            {spot?.name ?? SITE_NAME}
          </div>
          <div style={{ fontSize: 38, color: "#cfe3ea", marginTop: 8 }}>
            {spot ? `${spot.city} · previsão de surfe no ${SITE_NAME}` : "Previsão de surfe"}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
