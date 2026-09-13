import { Journey } from "@/components/journey/Journey";
import { JourneyStacked } from "@/components/journey/JourneyStacked";

export default function Home() {
  return (
    <main>
      {/* Wide screens: scroll-driven side-scrolling journey */}
      <div className="hidden md:block">
        <Journey />
      </div>
      {/* Small screens: the same story, stacked */}
      <div className="md:hidden">
        <JourneyStacked />
      </div>
    </main>
  );
}
