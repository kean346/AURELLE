import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clamp, money, products } from "../lib/products";
import { useMedia, useReducedMotion } from "../lib/media";
const ProductWorld = lazy(() => import("./ProductWorld"));
export function Signature({ add }: { add: (i: number) => void }) {
  return (
    <section className="signature" id="signature">
      <div className="signature-view">
        <Suspense
          fallback={<img src="/media/product-0.png" alt="Renewal Serum" />}
        >
          <ProductWorld interactive />
        </Suspense>
        <span className="signature-index eyebrow">A / 01</span>
      </div>
      <div className="signature-copy">
        <span className="eyebrow">The signature essential</span>
        <h2>
          A little ritual.
          <br />
          <em>A lasting feeling.</em>
        </h2>
        <p>
          A warm amber vessel. A beautifully considered texture. Meet Renewal
          Serum, the starting point of the AURELLE collection.
        </p>
        <div className="signature-details">
          <span>Renewal Serum</span>
          <span>30 ml / 1.0 fl oz</span>
        </div>
        <button className="dark-button" onClick={() => add(0)}>
          Add to your ritual <span>{money(products[0].price)} &nbsp; +</span>
        </button>
        <span className="product-note">
          A concept collection. Demo bag; no payment is taken.
        </span>
      </div>
    </section>
  );
}
export function Ingredients() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null),
    progress = useRef(0);
  const media = useMedia();
  useEffect(() => {
    const t = ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        progress.current = self.progress;
      },
    });
    return () => t.kill();
  }, []);
  return (
    <section className="ingredients" id="ingredients" ref={root}>
      <div className="ingredients-art">
        {media.liquid.src && !reduced ? (
          <video
            src={media.liquid.src}
            muted
            playsInline
            loop
            autoPlay
            aria-label="Macro liquid film"
          />
        ) : (
          <Suspense fallback={<div />}>
            <ProductWorld progressSource={progress} variant="liquid" />
          </Suspense>
        )}
        <span className="ingredient-watermark">In essence.</span>
      </div>
      <div className="ingredients-copy">
        <span className="eyebrow">03 — A study in texture</span>
        <h2>
          Feel first.
          <br />
          <em>Everything follows.</em>
        </h2>
        <p>
          The quiet pleasure of a texture.
          <br />
          The warmth of a touch. The time you take.
        </p>
        <div className="texture-notes">
          <span>
            01 <b>Fluid</b>
            <small>Lightness in every layer</small>
          </span>
          <span>
            02 <b>Comfort</b>
            <small>A softer daily rhythm</small>
          </span>
          <span>
            03 <b>Balance</b>
            <small>Just enough, beautifully</small>
          </span>
        </div>
        <span className="product-note">
          A sensory concept. Ingredient specifications forthcoming.
        </span>
      </div>
    </section>
  );
}
const chapters = [
  {
    title: "A fresh beginning.",
    text: "Warm water. A clean canvas. Begin with Essential Cleanser and give yourself a moment.",
    product: 1,
    time: "01 / MORNING",
  },
  {
    title: "A moment to replenish.",
    text: "A few considered drops. Press Renewal Serum into your palms, then take your time.",
    product: 0,
    time: "02 / IN BETWEEN",
  },
  {
    title: "A quieter ending.",
    text: "Close the day with Restorative Cream. A comforting last layer. A little space to unwind.",
    product: 2,
    time: "03 / EVENING",
  },
];
export function Ritual() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setActive(Math.min(2, Math.floor(self.progress * 3)));
        root.current!.style.setProperty(
          "--ritual-progress",
          String(self.progress),
        );
      },
    });
    return () => trigger.kill();
  }, []);
  return (
    <section className="ritual" id="ritual" ref={root}>
      <div className="ritual-sticky">
        <div className="ritual-heading">
          <span className="eyebrow">04 — Find your rhythm</span>
          <h2>
            Not a routine.
            <br />
            <em>A return.</em>
          </h2>
        </div>
        <div className="ritual-art">
          {chapters.map((c, i) => (
            <div
              className={`ritual-product ${active === i ? "active" : ""}`}
              key={i}
            >
              <div className="ritual-halo" />
              <img
                src={`/media/product-${c.product}.png`}
                alt={products[c.product].name}
              />
            </div>
          ))}
        </div>
        <div className="ritual-copy">
          <span className="eyebrow ritual-time">{chapters[active].time}</span>
          <h3>{chapters[active].title}</h3>
          <p>{chapters[active].text}</p>
          <a className="text-link" href="#collection">
            Discover your ritual ↗
          </a>
          <div
            className="chapter-tabs"
            role="group"
            aria-label="Ritual chapters"
          >
            {chapters.map((c, i) => (
              <button
                aria-label={c.time}
                aria-pressed={active === i}
                key={i}
                onClick={() => {
                  const el = root.current!;
                  window.scrollTo({
                    top:
                      el.offsetTop +
                      (el.offsetHeight - innerHeight) * (i / 3 + 0.06),
                    behavior: matchMedia("(prefers-reduced-motion:reduce)")
                      .matches
                      ? "instant"
                      : "smooth",
                  });
                }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="ritual-line">
          <span />
        </div>
      </div>
    </section>
  );
}
export function Campaign() {
  const reduced = useReducedMotion();
  const media = useMedia();
  return (
    <section className="campaign" id="journal">
      <div className="campaign-heading">
        <div>
          <span className="eyebrow">05 — The AURELLE journal</span>
          <h2>
            Skin. Light.
            <br />
            <em>A little life.</em>
          </h2>
        </div>
        <p>
          Notes from our world.
          <br />
          An ongoing study in everyday beauty.
        </p>
        <span className="edition">Volume 01 — The beginning</span>
      </div>
      <div className="campaign-grid">
        <figure className="portrait-story">
          {media.campaign.src && !reduced ? (
            <video src={media.campaign.src} muted loop playsInline autoPlay />
          ) : (
            <img
              src="/media/hero-woman-poster.webp"
              alt="A close portrait study in warm light"
              loading="lazy"
            />
          )}
          <figcaption>
            <span>01 / IN YOUR OWN SKIN</span>
            <span>Portrait study</span>
          </figcaption>
        </figure>
        <figure className="object-story">
          <img
            src="/media/campaign-still-life.webp"
            alt="AURELLE serum on warm travertine, photographed in angled sunlight"
            loading="lazy"
          />
          <figcaption>
            <span>02 / OBJECTS OF INTENTION</span>
            <span>A still-life study</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
export function Philosophy() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const spans = root.current!.querySelectorAll<HTMLElement>(
      ".philosophy-statement>span",
    );
    const t = ScrollTrigger.create({
      trigger: root.current,
      start: "top 75%",
      end: "bottom 60%",
      onUpdate: (self) => {
        spans.forEach((s, i) => {
          s.style.opacity = String(
            0.22 + 0.78 * clamp((self.progress - i * 0.13) * 3),
          );
        });
      },
    });
    return () => t.kill();
  }, []);
  return (
    <section className="philosophy" id="philosophy" ref={root}>
      <span className="eyebrow">06 — Our philosophy</span>
      <p className="philosophy-statement">
        <span>Beauty isn’t more.</span> <span>It’s knowing</span>{" "}
        <span>what matters.</span>{" "}
        <em>
          <span>And making room for it.</span>
        </em>
      </p>
      <div className="philosophy-bottom">
        <span className="philosophy-symbol">A</span>
        <p>
          We believe care should feel like a connection.
          <br />
          To your skin. To your senses. To yourself.
          <br />
          This is AURELLE.
        </p>
        <a href="#collection" className="text-link">
          Explore the collection ↗
        </a>
      </div>
    </section>
  );
}
