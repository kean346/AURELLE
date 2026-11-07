import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { products, money } from "../lib/products";
import { Dialog } from "./Dialogs";
const cards = [
  {
    title: "The morning reset.",
    sub: "01 / CLEANSE",
    text: "Start fresh with Essential Cleanser. A quiet first step, before the day begins.",
    product: 1,
    accent: "#889477",
  },
  {
    title: "Stay a little longer.",
    sub: "02 / REPLENISH",
    text: "Renewal Serum. Take a closer look at your new daily essential.",
    product: 0,
    accent: "#ab8753",
  },
  {
    title: "Make time for night.",
    sub: "03 / RESTORE",
    text: "An evening with Restorative Cream. A comforting finishing touch.",
    product: 2,
    accent: "#9b7d64",
  },
];
export default function ClosingCards({ add }: { add: (i: number) => void }) {
  const root = useRef<HTMLElement>(null),
    [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const els = root.current!.querySelectorAll<HTMLElement>(".ritual-card");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  function tilt(e: PointerEvent<HTMLElement>) {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height;
    e.currentTarget.style.setProperty("--rx", `${(y - 0.5) * -10}deg`);
    e.currentTarget.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    e.currentTarget.style.setProperty("--px", `${x * 100}%`);
    e.currentTarget.style.setProperty("--py", `${y * 100}%`);
  }
  return (
    <section className="closing-cards" id="ritual" ref={root}>
      <div className="cards-heading">
        <div>
          <span className="eyebrow">YOUR DAY. YOUR WAY.</span>
          <h2>
            Make it <em>yours.</em>
          </h2>
        </div>
        <p>
          Three moments worth keeping.
          <br />
          Touch a card. Find your rhythm.
        </p>
      </div>
      <div className="ritual-card-grid">
        {cards.map((c, i) => (
          <article
            className="ritual-card"
            key={c.title}
            style={
              {
                "--card-accent": c.accent,
                "--delay": `${i * 90}ms`,
              } as CSSProperties
            }
            onPointerMove={tilt}
            onPointerLeave={(e) => {
              e.currentTarget.style.setProperty("--rx", "0deg");
              e.currentTarget.style.setProperty("--ry", "0deg");
            }}
          >
            <button
              className="card-open"
              aria-label={`Explore ${c.title}`}
              onClick={() => setOpen(i)}
            >
              <span className="card-kicker">{c.sub}</span>
              <div className="card-art">
                <div className="card-orbit" />
                <img
                  src={`/media/product-${c.product}.png`}
                  alt={products[c.product].name}
                  loading="lazy"
                />
              </div>
              <div className="card-body">
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <span className="card-discover">
                  EXPLORE THIS RITUAL <b>↗</b>
                </span>
              </div>
            </button>
          </article>
        ))}
      </div>
      {open !== null && (
        <Dialog title={cards[open].title} onClose={() => setOpen(null)}>
          <div className="ritual-detail">
            <img
              src={`/media/product-${cards[open].product}.png`}
              alt={products[cards[open].product].name}
            />
            <p>{cards[open].text}</p>
            <button
              className="dark-button"
              onClick={() => add(cards[open].product)}
            >
              Add {products[cards[open].product].name}{" "}
              <span>{money(products[cards[open].product].price)} +</span>
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
