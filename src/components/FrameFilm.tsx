import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { clamp } from "../lib/products";
import { createSeekController } from "../lib/media";
export default function FrameFilm({
  src,
  progress,
  strategy,
  onFailure,
}: {
  src: string;
  progress: RefObject<number>;
  strategy: "seek" | "frames";
  onFailure: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null),
    video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current!,
      c = canvas.current!,
      ctx = c.getContext("2d")!,
      controller = createSeekController(v);
    let raf = 0,
      cur = 0,
      ready = false,
      worker: Worker | undefined,
      disposed = false;
    const edges = new Map<number, { left: number[]; right: number[] }>();
    const blobs = new Map<number, Blob>(),
      bitmaps = new Map<number, ImageBitmap>(),
      loading = new Set<number>();
    let count = 1,
      width = 960,
      height = 540,
      bytes = 0,
      usingFrames = strategy === "frames",
      capturing = false,
      captureId = 0;
    let captureCanvas: HTMLCanvasElement | undefined,
      lastDrawKey = "",
      lastTime = 0;
    const resize = () => {
      c.width = Math.round(c.clientWidth * Math.min(devicePixelRatio, 1.5));
      c.height = Math.round(c.clientHeight * Math.min(devicePixelRatio, 1.5));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();
    const abort = new AbortController();
    const load = async (i: number) => {
      if (
        !blobs.has(i) ||
        bitmaps.has(i) ||
        loading.has(i) ||
        loading.size >= 8
      )
        return;
      loading.add(i);
      try {
        const b = await createImageBitmap(blobs.get(i)!);
        if (disposed) {
          b.close();
          return;
        }
        bitmaps.set(i, b);
        const max = Math.min(
          56,
          Math.max(8, Math.floor(64e6 / (width * height * 4))),
        );
        while (bitmaps.size > max) {
          const key = [...bitmaps.keys()].sort(
            (a, b) => Math.abs(b - cur) - Math.abs(a - cur),
          )[0];
          bitmaps.get(key)!.close();
          bitmaps.delete(key);
        }
      } catch {
        if (!disposed) onFailure();
      } finally {
        loading.delete(i);
      }
    };
    const draw = (b: ImageBitmap, alpha = 1) => {
      const normalized = cur / Math.max(1, count - 1),
        t = clamp((normalized - 0.35) / 0.55),
        ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const start = Math.max(
          c.width / b.width,
          Math.max((c.width * 900) / 1440, c.height) / b.height,
        ),
        end = c.height / b.height,
        s = start + (end - start) * ease,
        w = b.width * s,
        h = b.height * s,
        x = (c.width - w) / 2,
        y =
          ((Math.max((c.width * 900) / 1440, c.height) - b.height * start) /
            2) *
          (1 - ease);
      const edge = edges.get(Math.floor(cur));
      if (alpha === 1) {
        ctx.fillStyle = edge ? `rgb(${edge.left.join(",")})` : "#b8ac98";
        ctx.fillRect(0, 0, c.width / 2, c.height);
        ctx.fillStyle = edge ? `rgb(${edge.right.join(",")})` : "#b8ac98";
        ctx.fillRect(c.width / 2, 0, c.width / 2, c.height);
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(b, x, y, w, h);
      ctx.globalAlpha = 1;
      if (edge && w < c.width) {
        const feather = w * 0.06;
        for (const [side, color] of [
          [0, edge.left],
          [1, edge.right],
        ] as const) {
          const startX = side ? x + w - feather : x;
          const g = ctx.createLinearGradient(startX, 0, startX + feather, 0);
          g.addColorStop(0, `rgba(${color.join(",")},${side ? 0 : 1})`);
          g.addColorStop(1, `rgba(${color.join(",")},${side ? 1 : 0})`);
          ctx.fillStyle = g;
          ctx.fillRect(startX, 0, feather, c.height);
        }
      }
    };
    const captureFallback = () => {
      if (disposed) return;
      worker?.terminate();
      worker = undefined;
      capturing = true;
      c.dataset.pipeline = "capture";
      v.classList.add("frame-capture");
      v.src = src;
      v.load();
    };
    const capture = () => {
      if (disposed || !capturing) return;
      if (typeof v.requestVideoFrameCallback !== "function") {
        capturing = false;
        usingFrames = false;
        ready = true;
        c.dataset.ready = "false";
        v.classList.remove("frame-capture");
        v.dataset.ready = "true";
        return;
      }
      captureCanvas = document.createElement("canvas");
      const scale = Math.min(1, 960 / v.videoWidth);
      width = captureCanvas.width = Math.round(v.videoWidth * scale);
      height = captureCanvas.height = Math.round(v.videoHeight * scale);
      count = Math.ceil(v.duration * 24);
      const cc = captureCanvas.getContext("2d")!;
      let encoding = false;
      const frame: VideoFrameRequestCallback = (_now, meta) => {
        if (disposed) return;
        const i = Math.min(count - 1, Math.round(meta.mediaTime * 24));
        if (!encoding && !blobs.has(i)) {
          encoding = true;
          cc.drawImage(v, 0, 0, width, height);
          captureCanvas!.toBlob(
            (blob) => {
              encoding = false;
              if (disposed || !blob) return;
              bytes += blob.size;
              if (bytes > 64e6) {
                v.pause();
                onFailure();
                return;
              }
              blobs.set(i, blob);
              if (i === 0) void load(0);
            },
            "image/jpeg",
            0.88,
          );
        }
        if (!v.ended) captureId = v.requestVideoFrameCallback(frame);
      };
      captureId = v.requestVideoFrameCallback(frame);
      v.playbackRate = 0.5;
      void v.play().catch(() => {
        capturing = false;
        usingFrames = false;
        v.classList.remove("frame-capture");
        v.dataset.ready = "true";
        ready = true;
      });
    };
    if (
      strategy === "frames" &&
      typeof VideoDecoder !== "undefined" &&
      typeof Worker !== "undefined" &&
      typeof OffscreenCanvas !== "undefined"
    ) {
      try {
        worker = new Worker(
          new URL("../lib/frame-worker.ts", import.meta.url),
          {
            type: "module",
          },
        );
        worker.onmessage = (e) => {
          const m = e.data;
          if (m.type === "meta") {
            c.dataset.pipeline = "webcodecs";
            count = m.count;
            width = m.width;
            height = m.height;
          }
          if (m.type === "frame") {
            edges.set(m.index, { left: m.left, right: m.right });
            bytes += m.blob.size;
            if (bytes > 64e6) {
              worker?.terminate();
              onFailure();
              return;
            }
            blobs.set(m.index, m.blob);
            c.dataset.frames = String(blobs.size);
            if (m.index === 0) void load(0);
          }
          if (m.type === "error") {
            captureFallback();
          }
        };
        worker.onerror = () => {
          captureFallback();
        };
        worker.postMessage({ url: new URL(src, location.href).href });
      } catch {
        captureFallback();
      }
    } else if (strategy === "frames") {
      captureFallback();
    } else {
      v.src = src;
      v.load();
    }
    v.addEventListener(
      "loadeddata",
      () => {
        if (capturing) {
          capture();
        } else if (!usingFrames) {
          ready = true;
          v.dataset.ready = "true";
        }
      },
      { signal: abort.signal },
    );
    v.addEventListener("error", () => onFailure(), { signal: abort.signal });
    function render(now: number) {
      const dt = Math.min(50, now - lastTime) || 16.7;
      lastTime = now;
      raf = requestAnimationFrame(render);
      if (usingFrames) {
        const target = clamp(progress.current / 0.85) * (count - 1);
        cur += (target - cur) * (1 - Math.pow(0.75, dt / 16.7));
        if (Math.abs(target - cur) < 0.02) cur = target;
        const index = Math.floor(cur);
        for (let i = index - 4; i <= index + 14; i++) void load(i);
        const key = `${index}:${(cur - index).toFixed(2)}:${c.width}:${c.height}:${bitmaps.size}`;
        if (key === lastDrawKey) return;
        lastDrawKey = key;
        const a = bitmaps.get(index),
          b = bitmaps.get(index + 1);
        if (a) {
          draw(a);
          if (b) draw(b, cur - index);
          c.dataset.ready = "true";
        } else {
          const nearest = [...bitmaps.keys()]
            .filter((k) => Math.abs(k - index) <= 12)
            .sort((a, b) => Math.abs(a - index) - Math.abs(b - index))[0];
          if (nearest !== undefined) {
            draw(bitmaps.get(nearest)!);
            c.dataset.ready = "true";
          }
        }
      } else if (ready && Number.isFinite(v.duration))
        controller.seek(clamp(progress.current / 0.85) * v.duration);
    }
    raf = requestAnimationFrame(render);
    return () => {
      disposed = true;
      v.pause();
      if (captureId) v.cancelVideoFrameCallback(captureId);
      cancelAnimationFrame(raf);
      abort.abort();
      ro.disconnect();
      worker?.terminate();
      controller.dispose();
      bitmaps.forEach((b) => b.close());
      v.removeAttribute("src");
      v.load();
    };
  }, [src, strategy, progress, onFailure]);
  return (
    <div className="frame-film">
      <video
        ref={video}
        muted
        playsInline
        preload="auto"
        aria-label="Scroll-controlled cinematic film"
      />
      <canvas ref={canvas} aria-hidden="true" />
    </div>
  );
}
