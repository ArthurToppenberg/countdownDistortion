import BeerCounter from "./beerCounter";
import CarouselCounter from "./carouselCounter";
import ScrollIndicator from "./components/ScrollIndicator";
import CountdownTimer from "./countdownTimer";
import DrinkCounter from "./drinkCounter";
import { assetPath } from "./lib/assetPath";
import ListenCounter from "./listenCounter";
import OysterCounter from "./oysterCounter";

export default function Home() {
  return (
    <div className="relative">
      <div className="fixed inset-0 z-0">
        <img
          src={assetPath("/optimized/IMG_1864.avif")}
          alt=""
          className="size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <ScrollIndicator />
      <div className="relative z-10">
        <section className="min-h-screen">
          <CountdownTimer />
        </section>
        <section className="min-h-screen">
          <DrinkCounter />
        </section>
        <section className="min-h-screen">
          <BeerCounter />
        </section>
        <section className="min-h-screen">
          <OysterCounter />
        </section>
        <section className="min-h-screen">
          <CarouselCounter />
        </section>
        <section className="min-h-screen">
          <ListenCounter />
        </section>
      </div>
    </div>
  );
}
