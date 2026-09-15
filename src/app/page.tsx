import { Soundtrack } from "@/components/journey/Soundtrack";
import { Journey } from "@/components/journey/Journey";

export default function Home() {
  return (
    <main>
      <Soundtrack />
      {/* One scroll-driven journey at every size; phone framing is CSS (globals.css) */}
      <Journey />
    </main>
  );
}
