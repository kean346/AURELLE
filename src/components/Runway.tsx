import { useEffect, useRef } from "react";
import { products, money, wrap, clamp } from "../lib/products";
export const KX = [1.2, 0.744, 0.496, 0.346, 0.235, 0.15, 0.085],
  KF = [1.14, 0.89, 0.777, 0.704, 0.651, 0.616, 0.59],
  KH = [1.18, 0.832, 0.574, 0.436, 0.334, 0.258, 0.19],
  KB = [0, 0, 1.5, 4, 8, 12, 17],
  KO = [1, 1, 1, 1, 0.86, 0.5, 0];
export default function Runway({
  add,
  favorites,
  toggleFavorite,
}: {
  add: (i: number) => void;
  favorites: number[];
  toggleFavorite: (i: number) => void;
}) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!,
      stage = el.querySelector<HTMLElement>(".runway-stage")!,
      rail = el.querySelector<HTMLElement>(".product-rail")!,
      roll = el.querySelector<HTMLElement>(".roll")!,
      ring = el.querySelector<HTMLElement>(".ring")!;
    const people = Array.from(
      stage.querySelectorAll<HTMLElement>(".product-sprite"),
    ).map((e, i) => ({ e, r: products[i].ratio, f: "", o: "" }));
    const cards = Array.from(
      rail.querySelectorAll<HTMLElement>(".product-card"),
    );
    let rowH = 38;
    let W = 0,
      H = 0,
      base = 0,
      cardS = 0,
      side = false,
      dirty = true,
      p = 0,
      target = 0,
      last = 0,
      raf = 0;
    let mx = 0,
      my = 0,
      cx = 0,
      cy = 0,
      down = false,
      sx = 0,
      st = 0,
      moved = 0,
      wheelT = 0;
    const calm = matchMedia("(prefers-reduced-motion:reduce)");
    const abort = new AbortController();
    const signal = abort.signal;
    function size() {
      W = stage.clientWidth;
      H = stage.clientHeight;
      base = H * 1.2;
      side = innerWidth <= 820;
      people.forEach((m) => {
        m.e.style.width = base * m.r + "px";
        m.e.style.height = base + "px";
      });
      cardS = side ? 160 : rail.clientHeight / 3;
      cards.forEach((c) => (c.style.height = side ? "100%" : cardS + "px"));
      rowH = roll.firstElementChild!.getBoundingClientRect().height;
      dirty = true;
    }
    function paint() {
      people.forEach((m, i) => {
        let d = wrap(i - p, 6);
        if (d > 5) d -= 6;
        const k = clamp(d + 1, 0, 6),
          a = Math.floor(k),
          b = Math.min(6, a + 1),
          t = k - a,
          mix = (A: number[]) => A[a] + (A[b] - A[a]) * t;
        const h = mix(KH) * H,
          s = h / base,
          w = h * m.r,
          x = mix(KX) * W - w / 2,
          y = mix(KF) * H - h;
        m.e.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(4)})`;
        const f = mix(KB) / s,
          fs = f < 0.2 ? "none" : `blur(${f.toFixed(1)}px)`,
          o = mix(KO).toFixed(3);
        if (fs !== m.f) {
          m.f = fs;
          m.e.style.filter = fs;
        }
        if (o !== m.o) {
          m.o = o;
          m.e.style.opacity = o;
        }
        m.e.style.zIndex = String(100 - Math.round(d * 10));
      });
      const all = cardS * 12;
      cards.forEach((c, i) => {
        let y = wrap(i * cardS - p * 2 * cardS, all);
        if (y > all - cardS) y -= all;
        c.style.transform = side
          ? `translate3d(${y.toFixed(1)}px,0,0)`
          : `translate3d(0,${y.toFixed(1)}px,0)`;
        const visible =
          y >= -cardS * 0.5 &&
          y < (side ? rail.clientWidth : rail.clientHeight) - cardS * 0.5;
        c.inert = !visible;
      });
      roll.style.transform = `translate3d(0,${(-wrap(p, 6) * rowH).toFixed(1)}px,0)`;
      el.dataset.position = p.toFixed(4);
      el.dataset.target = String(target);
      el.dataset.active = String(wrap(Math.round(p), 6));
    }
    function frame(now: number) {
      const dt = Math.min(50, now - last) || 16;
      last = now;
      const was = p;
      if (calm.matches) p = target;
      else p += (target - p) * (1 - Math.exp(-dt * 0.0072));
      if (Math.abs(target - p) < 0.0004) p = target;
      if (p !== was || dirty) {
        dirty = false;
        paint();
      }
      cx += (mx - cx) * 0.32;
      cy += (my - cy) * 0.32;
      ring.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      raf = requestAnimationFrame(frame);
    }
    stage.addEventListener(
      "pointerenter",
      (e) => {
        if (e.pointerType === "mouse") ring.classList.add("show");
      },
      { signal },
    );
    stage.addEventListener(
      "pointerleave",
      () => ring.classList.remove("show"),
      { signal },
    );
    stage.addEventListener(
      "pointermove",
      (e) => {
        const r = stage.getBoundingClientRect();
        mx = e.clientX - r.left;
        my = e.clientY - r.top;
        if (!down) return;
        const dx = e.clientX - sx;
        moved = Math.max(moved, Math.abs(dx));
        target = st + dx / Math.max(150, W * 0.2);
      },
      { signal },
    );
    stage.addEventListener(
      "pointerdown",
      (e) => {
        if ((e.target as HTMLElement).closest("a,button")) return;
        down = true;
        sx = e.clientX;
        st = target;
        moved = 0;
        stage.focus({ preventScroll: true });
        stage.setPointerCapture(e.pointerId);
        ring.classList.add("drag");
      },
      { signal },
    );
    function release(e: PointerEvent) {
      if (!down) return;
      down = false;
      if (stage.hasPointerCapture(e.pointerId))
        stage.releasePointerCapture(e.pointerId);
      ring.classList.remove("drag");
      if (e.type === "pointercancel") {
        target = Math.round(target);
        return;
      }
      if (moved < 6) {
        const hit = document
          .elementsFromPoint(e.clientX, e.clientY)
          .map((e) => e.closest<HTMLElement>(".product-sprite"))
          .find(Boolean);
        if (hit) {
          let d = wrap(Number(hit.dataset.i) - target, 6);
          d = Math.round(d);
          if (d > 0 && d < 6) target = Math.round(target) + d;
        }
      } else target = Math.round(target);
    }
    stage.addEventListener("pointerup", release, { signal });
    stage.addEventListener("pointercancel", release, { signal });
    stage.addEventListener(
      "wheel",
      (e) => {
        if (!stage.contains(document.activeElement) || e.ctrlKey) return;
        e.preventDefault();
        target += clamp(e.deltaY + e.deltaX, -120, 120) / 420;
        clearTimeout(wheelT);
        wheelT = window.setTimeout(() => {
          target = Math.round(target);
        }, 150);
      },
      { passive: false, signal },
    );
    stage.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape") {
          stage.blur();
          return;
        }
        if ((e.target as HTMLElement).closest("a,button")) return;
        if (["ArrowRight", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          target = Math.round(target) + 1;
        }
        if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
          e.preventDefault();
          target = Math.round(target) - 1;
        }
      },
      { signal },
    );
    el.querySelectorAll<HTMLElement>("[data-step]").forEach((b) =>
      b.addEventListener(
        "click",
        () => {
          target = Math.round(target) + Number(b.dataset.step);
        },
        { signal },
      ),
    );
    el.querySelector(".shop-current")!.addEventListener(
      "click",
      () => add(wrap(Math.round(target), 6)),
      { signal },
    );
    const resize = new ResizeObserver(size);
    resize.observe(stage);
    resize.observe(rail);
    size();
    raf = requestAnimationFrame(frame);
    return () => {
      abort.abort();
      resize.disconnect();
      clearTimeout(wheelT);
      cancelAnimationFrame(raf);
    };
  }, [add]);
  return (
    <section
      ref={root}
      className="runway"
      id="collection"
      aria-labelledby="collection-title"
    >
      <div className="section-head">
        <span className="eyebrow">02 — The collection</span>
        <span className="eyebrow">Six essentials. One considered ritual.</span>
        <span className="edition">A / 26</span>
      </div>
      <div className="runway-layout">
        <div
          className="runway-stage"
          tabIndex={0}
          role="region"
          aria-label="Product runway. Drag or focus to use wheel and arrow keys. Escape or Tab exits."
        >
          <div className="runway-intro">
            <span className="eyebrow">Objects of intention</span>
            <h2 id="collection-title">
              Your skin.
              <br />
              <em>Your rhythm.</em>
            </h2>
            <p>
              A little less, but a little better.
              <br />
              Discover the essentials of your everyday.
            </p>
          </div>
          <div className="depth-line">
            {products.map((p, i) => (
              <div className="product-sprite" data-i={i} key={p.name}>
                <img
                  src={`/media/product-${i}.png`}
                  alt={p.name}
                  draggable={false}
                />
              </div>
            ))}
          </div>
          <div className="runway-tag">
            <div className="look">
              <span>Ritual</span>
              <span className="number-window">
                <span className="roll">
                  {Array.from({ length: 7 }, (_, i) => (
                    <b key={i}>{String((i % 6) + 1).padStart(2, "0")}</b>
                  ))}
                </span>
              </span>
              <span className="look-total">/ 06</span>
            </div>
            <button className="text-link shop-current">
              Add this essential <span>↗</span>
            </button>
          </div>
          <div className="runway-controls">
            <span>DRAG TO DISCOVER</span>
            <div>
              <button data-step="-1" aria-label="Previous product">
                ←
              </button>
              <button data-step="1" aria-label="Next product">
                →
              </button>
            </div>
            <a
              href="#ritual"
              className="exit-runway"
              onPointerUp={(e) => {
                if (e.pointerType === "touch") {
                  e.preventDefault();
                  e.currentTarget.click();
                }
              }}
            >
              Continue the ritual ↓
            </a>
          </div>
          <div className="ring">
            <span>DRAG</span>
          </div>
        </div>
        <aside className="product-rail" aria-label="Shop the collection">
          {Array.from({ length: 12 }, (_, i) => {
            const pi = Math.floor(i / 2),
              p = products[pi];
            return (
              <article
                className={`product-card ${i % 2 ? "alternate" : ""}`}
                key={i}
                data-product={pi}
              >
                <button
                  className="favorite"
                  aria-label={`Save ${p.name}${i % 2 ? " ritual" : ""}`}
                  aria-pressed={favorites.includes(pi)}
                  onClick={() => toggleFavorite(pi)}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 20S3.5 15 3.5 9A4.6 4.6 0 0 1 12 6.6 4.6 4.6 0 0 1 20.5 9C20.5 15 12 20 12 20Z" />
                  </svg>
                </button>
                <span className="card-edition">
                  {String(pi + 1).padStart(2, "0")} /{" "}
                  {i % 2 ? "THE RITUAL" : "THE ESSENTIAL"}
                </span>
                <img
                  src={`/media/product-${pi}.png`}
                  alt=""
                  draggable={false}
                />
                <div className="product-meta">
                  <h3>
                    {p.name}
                    {i % 2 ? " · Duo" : ""}
                  </h3>
                  <span>
                    {money(p.price * (i % 2 ? 2 : 1))}{" "}
                    <small>
                      / {i % 2 ? "2 × " : ""}
                      {p.size}
                    </small>
                  </span>
                  <button
                    className="add-product"
                    aria-label={`Add ${p.name}${i % 2 ? " duo" : ""} to bag`}
                    onClick={() => {
                      add(pi);
                      if (i % 2) add(pi);
                    }}
                  >
                    +
                  </button>
                </div>
              </article>
            );
          })}
        </aside>
      </div>
      <div className="runway-caption">
        <span>A study in form, light & everyday care.</span>
        <span>Depth-projected product renders · drag, scroll, explore</span>
      </div>
    </section>
  );
}
