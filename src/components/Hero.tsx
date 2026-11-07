import { useEffect, useRef, useState } from "react";
import { useMedia, useReducedMotion, createSeekController } from "../lib/media";
import { clamp } from "../lib/products";
export default function Hero() {
  const media = useMedia(),
    reduced = useReducedMotion(),
    root = useRef<HTMLElement>(null),
    video = useRef<HTMLVideoElement>(null),
    seek = useRef<ReturnType<typeof createSeekController> | null>(null);
  const [ready, setReady] = useState(false),
    [playing, setPlaying] = useState(true),
    [progress, setProgress] = useState(0),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const el = root.current!,
      v = video.current;
    if (!v || reduced) return;
    let previous: number | null = null,
      target = 0;
    const controller = createSeekController(v);
    seek.current = controller;
    const abort = new AbortController();
    const move = (e: PointerEvent) => {
      if (
        e.pointerType !== "mouse" ||
        (e.target as HTMLElement).closest("a,button,input")
      ) {
        previous = null;
        return;
      }
      if (previous !== null && Number.isFinite(v.duration)) {
        v.pause();
        setPlaying(false);
        target = clamp(
          target + ((e.clientX - previous) / innerWidth) * 0.8 * v.duration,
          0,
          v.duration,
        );
        controller.seek(target);
        setProgress(target / v.duration);
      } else target = v.currentTime;
      previous = e.clientX;
    };
    el.addEventListener("pointermove", move, { signal: abort.signal });
    el.addEventListener(
      "pointerleave",
      () => {
        previous = null;
      },
      { signal: abort.signal },
    );
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) {
        v.pause();
        setPlaying(false);
      }
    });
    io.observe(el);
    return () => {
      abort.abort();
      io.disconnect();
      controller.dispose();
      seek.current = null;
    };
  }, [media.hero.src, reduced, ready]);
  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play().then(() => setPlaying(true));
    else {
      v.pause();
      setPlaying(false);
    }
  };
  return (
    <section className="hero" ref={root} id="top" aria-labelledby="hero-title">
      <img
        className="hero-poster"
        src={media.hero.poster}
        alt="Portrait in natural light"
        fetchPriority="high"
      />
      {media.hero.src && !reduced && !failed && (
        <video
          ref={video}
          className={`hero-video ${ready ? "ready" : ""}`}
          src={media.hero.src}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          poster={media.hero.poster}
          onLoadedData={() => setReady(true)}
          onTimeUpdate={(e) => {
            if (
              !e.currentTarget.paused &&
              Number.isFinite(e.currentTarget.duration)
            )
              setProgress(
                e.currentTarget.currentTime / e.currentTarget.duration,
              );
          }}
          onError={() => setFailed(true)}
          aria-label="Playable portrait film"
        />
      )}
      <div className="hero-shade" />
      <div className="hero-topline">
        <span>AURELLE / SKIN STUDIO</span>
        <span>COLLECTION Nº 01</span>
      </div>
      <div className="hero-copy">
        <span className="eyebrow">A different kind of daily.</span>
        <h1>
          Made for
          <br />
          <em>your skin.</em>
        </h1>
        <p className="typewriter">
          Essential skincare. Beautiful objects.
          <br />A moment that belongs to you.
        </p>
        <div className="hero-actions">
          <a className="pill" href="#collection">
            Explore the collection <span>↗</span>
          </a>
          {!reduced && ready && (
            <button
              className="film-toggle"
              onClick={toggle}
              aria-label={
                playing ? "Pause portrait film" : "Play portrait film"
              }
            >
              {playing ? (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 2h3v12H4zM10 2h3v12h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M4 2l10 6-10 6z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="hero-bottom">
        <a href="#signature" className="scroll-cue">
          <span>↓</span> TAKE A CLOSER LOOK
        </a>
        {!reduced && ready && (
          <label className="film-control">
            <span>MOVE TO EXPLORE</span>
            <input
              type="range"
              min="0"
              max="1"
              step=".001"
              value={progress}
              aria-label="Portrait film position"
              onChange={(e) => {
                const value = Number(e.target.value);
                video.current?.pause();
                setPlaying(false);
                setProgress(value);
                if (video.current && Number.isFinite(video.current.duration))
                  seek.current?.seek(value * video.current.duration);
              }}
            />
          </label>
        )}
      </div>
      <span className="hero-wordmark" aria-hidden="true">
        AURELLE / 2026
      </span>
    </section>
  );
}
