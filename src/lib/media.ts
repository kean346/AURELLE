import { useEffect, useState } from "react";
export interface MediaManifest {
  hero: { src: string | null; poster: string };
  story: { src: string | null; strategy: "seek" | "frames"; fps: number };
  campaign: { src: string | null };
  liquid: { src: string | null };
  final: { src: string | null };
}
export const fallbackManifest: MediaManifest = {
  hero: { src: null, poster: "/media/hero-woman-poster.webp" },
  story: { src: null, strategy: "seek", fps: 24 },
  campaign: { src: null },
  liquid: { src: null },
  final: { src: null },
};
let manifestRequest: Promise<MediaManifest> | undefined;
export function useMedia() {
  const [media, setMedia] = useState(fallbackManifest);
  useEffect(() => {
    let live = true;
    manifestRequest ??= fetch("/media/manifest.json")
      .then((r) => {
        if (!r.ok) throw Error("Manifest unavailable");
        return r.json() as Promise<MediaManifest>;
      })
      .catch(() => fallbackManifest);
    manifestRequest.then((m) => {
      if (live) setMedia(m);
    });
    return () => {
      live = false;
    };
  }, []);
  return media;
}
// Mainframe: exactly one in-flight seek. Latest requested time wins.
export function createSeekController(video: HTMLVideoElement) {
  let target = 0,
    busy = false,
    disposed = false,
    seeks = 0,
    issued = Number.NaN;
  const flush = () => {
    if (
      disposed ||
      busy ||
      video.readyState < 1 ||
      !Number.isFinite(video.duration)
    )
      return;
    const time = Math.min(
      Math.max(0, target),
      Math.max(0, video.duration - 0.001),
    );
    if (
      Math.abs(video.currentTime - time) < 0.012 ||
      Math.abs(issued - time) < 0.012
    )
      return;
    issued = time;
    busy = true;
    seeks++;
    video.currentTime = time;
  };
  const seeked = () => {
    busy = false;
    flush();
  };
  video.addEventListener("seeked", seeked);
  video.addEventListener("loadedmetadata", flush);
  return {
    seek(time: number) {
      target = time;
      flush();
    },
    get target() {
      return target;
    },
    get seeks() {
      return seeks;
    },
    dispose() {
      disposed = true;
      video.removeEventListener("seeked", seeked);
      video.removeEventListener("loadedmetadata", flush);
    },
  };
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion:reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion:reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}
