import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useMedia, useReducedMotion } from "../lib/media";
import FrameFilm from "./FrameFilm";
import { clamp } from "../lib/products";
const ProductWorld = lazy(() => import("./ProductWorld"));
gsap.registerPlugin(ScrollTrigger);
export default function Story() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null),
    progress = useRef(0);
  const media = useMedia();
  const [failed, setFailed] = useState(false);
  const onFailure = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const el = root.current!,
      panels = Array.from(el.querySelectorAll<HTMLElement>(".story-panel")),
      bar = el.querySelector<HTMLElement>(".story-progress-fill")!,
      label = el.querySelector<HTMLElement>(".story-counter")!;
    const calm = matchMedia("(prefers-reduced-motion:reduce)");
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        progress.current = p;
        el.dataset.progress = p.toFixed(4);
        const a = calm.matches
          ? p < 0.5
            ? 1
            : 0
          : clamp((p - 0.02) / 0.12) * (1 - clamp((p - 0.42) / 0.1));
        const b = calm.matches ? (p >= 0.5 ? 1 : 0) : clamp((p - 0.58) / 0.12);
        [a, b].forEach((alpha, i) => {
          panels[i].style.opacity = String(alpha);
          panels[i].style.visibility = alpha < 0.01 ? "hidden" : "visible";
          panels[i].style.transform =
            `translateY(${calm.matches ? 0 : (1 - alpha) * 32}px)`;
        });
        bar.style.transform = `scaleX(${p})`;
        label.textContent = p < 0.5 ? "01 — INTENTION" : "02 — CONNECTION";
      },
    });
    return () => trigger.kill();
  }, []);
  return (
    <section
      className="story"
      id="story"
      ref={root}
      aria-label="A continuous study in light and form"
    >
      <div className="story-sticky">
        <Suspense fallback={<div className="world-loading" />}>
          <ProductWorld progressSource={progress} />
        </Suspense>
        {media.story.src && !failed && !reduced && (
          <FrameFilm
            src={media.story.src}
            strategy={media.story.strategy}
            progress={progress}
            onFailure={onFailure}
          />
        )}
        <div className="story-top">
          <span className="eyebrow">01 — A closer connection</span>
          <span className="eyebrow">AURELLE / IN FOCUS</span>
        </div>
        <article className="story-panel first">
          <span className="eyebrow">01 / Begin with intention</span>
          <h2>
            Less noise.
            <br />
            <em>More feeling.</em>
          </h2>
          <p>
            Not another step to keep up with.
            <br />A small, deliberate moment to come back to.
          </p>
          <span className="fine-line" />
        </article>
        <article className="story-panel second">
          <span className="eyebrow">02 / Made for your everyday</span>
          <h2>
            Care, in its
            <br />
            <em>purest form.</em>
          </h2>
          <p>
            Thoughtful textures. Considered essentials.
            <br />
            An invitation to find your own rhythm.
          </p>
          <a className="text-link" href="#signature">
            Meet your daily essential <span>↗</span>
          </a>
        </article>
        <div className="story-bottom">
          <span className="story-counter">01 — INTENTION</span>
          <div className="story-progress">
            <span className="story-progress-fill" />
          </div>
          <span>
            {media.story.src && !failed
              ? "SCROLL TO EXPLORE THE FILM"
              : "LIVE 3D · A STUDY IN LIGHT & FORM"}
          </span>
        </div>
        {import.meta.env.DEV && !media.story.src && (
          <span className="dev-media-note">
            DEV · Hand-wipe film pending. Original live 3D study shown.
          </span>
        )}
      </div>
    </section>
  );
}
