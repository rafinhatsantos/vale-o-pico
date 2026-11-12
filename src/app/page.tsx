import { HomeSpots } from "@/components/home-spots";
import { getForecastSummary } from "@/lib/forecast";
import { SPOTS } from "@/lib/spots";

export default async function HomePage() {
  const summaries = await Promise.all(
    SPOTS.map((spot) => getForecastSummary(spot.slug)),
  );
  const serverNow = Math.max(
    0,
    ...summaries.map((summary) => summary?.generatedAt ?? 0),
  );

  return (
    <HomeSpots
      spots={SPOTS.map(({ slug, name, city, region }) => ({
        slug,
        name,
        city,
        region,
      }))}
      summaries={summaries}
      serverNow={serverNow}
    />
  );
}
