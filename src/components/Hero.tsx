import { useEffect, useRef, useState } from "react";
import { createSeekController, useMedia } from "../lib/media";
import { clamp } from "../lib/products";
function useTypewriter(text: string) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion:reduce)").matches) {
      setShown(text);
      return;
    }
    let interval = 0;
    const delay = setTimeout(() => {
      let i = 0;
      interval = window.setInterval(() => {
        setShown(text.slice(0, ++i));
        if (i >= text.length) clearInterval(interval);
      }, 38);
    }, 600);
    return () => {
      clearTimeout(delay);
      clearInterval(interval);
    };
  }, [text]);
  return shown;
}
export default function Hero() {
  const media = useMedia();
  const root = useRef<HTMLElement>(null),
    video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false),
    [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const text = useTypewriter("A moment for you. A ritual for your skin.");
  useEffect(() => {
    const el = root.current!,
      word = el.querySelector<HTMLElement>(".hero-wordmark")!;
    const calm = matchMedia("(prefers-reduced-motion:reduce)");
    const scroll = () => {
      word.style.transform = `translateY(${-clamp(-el.getBoundingClientRect().top / innerHeight) * innerHeight * (calm.matches ? 0 : 0.4)}px)`;
    };
    addEventListener("scroll", scroll, { passive: true });
    return () => removeEventListener("scroll", scroll);
  }, []);
  useEffect(() => {
    const el = root.current!,
      v = video.current;
    if (!v || !media.hero.src) return;
    const abort = new AbortController(),
      signal = abort.signal,
      controller = createSeekController(v);
    let prevX: number | null = null,
      active =
        el.getBoundingClientRect().bottom > 0 &&
        el.getBoundingClientRect().top < innerHeight,
      target = 0;
    const calm = matchMedia("(prefers-reduced-motion:reduce)");
    const io = new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      el.dataset.mediaActive = String(active);
      prevX = null;
    });
    io.observe(el);
    const move = (e: PointerEvent) => {
      el.dataset.pointerType = e.pointerType;
      if (
        !active ||
        calm.matches ||
        (e.pointerType !== "mouse" && e.buttons === 0) ||
        (e.target as HTMLElement).closest("a,button,input")
      ) {
        prevX = null;
        return;
      }
      if (prevX !== null && Number.isFinite(v.duration)) {
        target = clamp(
          target + ((e.clientX - prevX) / innerWidth) * 0.8 * v.duration,
          0,
          v.duration,
        );
        controller.seek(target);
        el.dataset.filmTarget = String(target);
        setProgress(target / v.duration);
      }
      prevX = e.clientX;
    };
    el.addEventListener("pointermove", move, { signal });
    el.addEventListener(
      "pointerleave",
      () => {
        prevX = null;
      },
      { signal },
    );
    el.addEventListener(
      "pointerdown",
      (e) => {
        prevX = e.clientX;
      },
      { signal },
    );
    const input = el.querySelector<HTMLInputElement>("input[type=range]");
    input?.addEventListener(
      "input",
      () => {
        if (Number.isFinite(v.duration)) {
          target = Number(input.value) * v.duration;
          controller.seek(target);
          el.dataset.filmTarget = String(target);
          setProgress(Number(input.value));
        }
      },
      { signal },
    );
    return () => {
      abort.abort();
      io.disconnect();
      controller.dispose();
    };
  }, [media.hero.src, ready]);
  return (
    <section ref={root} className="hero" id="top" aria-labelledby="hero-title">
      <img
        className="hero-poster"
        src={media.hero.poster}
        alt="Close-up beauty portrait in warm studio light"
        fetchPriority="high"
      />
      {media.hero.src && !failed && (
        <video
          ref={video}
          className={`hero-video ${ready ? "ready" : ""}`}
          src={media.hero.src}
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
          aria-label="Interactive portrait film"
        />
      )}
      <div className="hero-shade" />
      <div className="hero-topline">
        <span>Considered skincare. Uncomplicated beauty.</span>
        <span>Est. MMXXVI</span>
      </div>
      <div className="hero-copy">
        <div className="hero-label">
          <span className="tiny-star">✳︎</span>
          <span>
            A daily return
            <br />
            to yourself.
          </span>
        </div>
        <h1 id="hero-title">
          The art
          <br />
          of <em>being.</em>
        </h1>
        <p
          className="typewriter"
          aria-label="A moment for you. A ritual for your skin."
        >
          <span aria-hidden="true">{text}</span>
        </p>
        <div className="hero-actions">
          <a className="pill" href="#collection">
            Discover the collection <span>↗</span>
          </a>
          <a href="#story" className="hero-secondary">
            Our world <span>↗</span>
          </a>
        </div>
      </div>
      <div className="hero-side-label">
        SKINCARE, IN ITS MOST CONSIDERED FORM.
      </div>
      <div className="hero-bottom">
        <a href="#story" className="scroll-cue">
          <span>↓</span> SCROLL TO FEEL MORE
        </a>
        {media.hero.src && ready ? (
          <label className="film-control">
            EXPLORE THE FILM
            <input
              type="range"
              min="0"
              max="1"
              step=".001"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              aria-label="Portrait film position"
            />
          </label>
        ) : (
          <span className="still-caption">Portrait study — still edition</span>
        )}
        <span>01 / 06</span>
      </div>
      <div className="hero-wordmark" aria-hidden="true">
        AURELLE
      </div>
      {import.meta.env.DEV && (!media.hero.src || failed) && (
        <span className="dev-media-note">
          DEV · Portrait motion asset pending. Static poster shown.
        </span>
      )}
    </section>
  );
}
