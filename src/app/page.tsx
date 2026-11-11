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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Vale a pena ir surfar?</h1>
        <p className="mt-1 text-slate-600">
          Uma nota de 0 a 10 por pico, ajustada ao seu nível.
        </p>
      </div>

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
    </div>
  );
}
