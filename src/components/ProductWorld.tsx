import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { makeProduct, setupScene } from "../lib/productScene";
function World({
  progress = 0,
  interactive = false,
  variant = "serum",
  progressSource,
}: {
  progress?: number;
  interactive?: boolean;
  variant?: "serum" | "liquid";
  progressSource?: RefObject<number>;
}) {
  const container = useRef<HTMLDivElement>(null),
    p = useRef(progress);
  p.current = progress;
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const parent = container.current!,
      canvas = document.createElement("canvas");
    parent.prepend(canvas);
    let cleanup = () => {};
    try {
      const { renderer, scene, camera, dispose } = setupScene(canvas);
      const calm = matchMedia("(prefers-reduced-motion:reduce)");
      renderer.setClearColor(variant === "liquid" ? "#b8ab91" : "#c7bca6");
      const bottle = makeProduct(0);
      scene.add(bottle);
      const control = interactive ? new OrbitControls(camera, canvas) : null;
      if (control) {
        control.enableZoom = false;
        control.enablePan = false;
        control.enableDamping = true;
        control.minPolarAngle = Math.PI * 0.25;
        control.maxPolarAngle = Math.PI * 0.7;
        control.target.set(0, 0.2, 0);
        control.update();
      }
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshStandardMaterial({
          color: "#a99b80",
          roughness: 0.36,
          metalness: 0.18,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.15;
      scene.add(floor);
      const sculpt = new THREE.Group();
      const glass = new THREE.MeshPhysicalMaterial({
        color: "#d9c8a0",
        metalness: 0.15,
        roughness: 0.12,
        transmission: 0.8,
        thickness: 1.2,
        ior: 1.4,
        transparent: true,
        opacity: 0.88,
      });
      for (let i = 0; i < 5; i++) {
        const g = new THREE.Mesh(
          new THREE.TorusGeometry(
            1.8 + i * 0.16,
            0.08 + (i % 2) * 0.09,
            20,
            100,
          ),
          glass,
        );
        g.rotation.set(Math.PI * 0.42, Math.PI * 0.15, i * 0.11);
        g.position.y = -0.6 + i * 0.19;
        sculpt.add(g);
      }
      scene.add(sculpt);
      sculpt.position.set(0, -0.6, -2);
      sculpt.scale.setScalar(0.72);
      if (interactive) sculpt.visible = false;
      const bubbleGeo = new THREE.SphereGeometry(1, 32, 32);
      const bubbles = new THREE.Group();
      for (let i = 0; i < 9; i++) {
        const b = new THREE.Mesh(bubbleGeo, glass);
        const a = i * 2.4;
        b.position.set(
          Math.sin(a) * 2,
          Math.cos(a * 1.3) * 1.5,
          Math.cos(a) * 1.2,
        );
        b.scale.setScalar(0.08 + (i % 3) * 0.1);
        bubbles.add(b);
      }
      scene.add(bubbles);
      if (interactive) bubbles.visible = false;
      if (variant === "liquid") {
        bottle.visible = false;
        sculpt.scale.setScalar(1.25);
      }
      let running = true,
        visible = true,
        raf = 0,
        last = 0,
        dirtyFrame = true,
        lastProgress = -1;
      control?.addEventListener("change", () => {
        dirtyFrame = true;
      });
      const size = () => {
        dirtyFrame = true;
        const w = parent.clientWidth,
          h = parent.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(size);
      ro.observe(parent);
      size();
      const observer = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      observer.observe(parent);
      const render = (t: number) => {
        raf = requestAnimationFrame(render);
        if (!visible || t - last < 30) return;
        last = t;
        const v = calm.matches ? 0 : (progressSource?.current ?? p.current);
        control?.update();
        if (!dirtyFrame && v === lastProgress) return;
        dirtyFrame = false;
        lastProgress = v;
        if (!interactive) {
          camera.position.set(
            Math.sin(v * Math.PI * 1.5) * 3,
            0.6 + Math.sin(v * Math.PI) * 1.1,
            5.6 - Math.sin(v * Math.PI) * 1.1,
          );
          camera.lookAt(0, 0.1, 0);
          bottle.rotation.y = v * Math.PI * 2 - 0.3;
          bottle.rotation.z = Math.sin(v * Math.PI) * 0.16;
        }
        sculpt.rotation.y = v * Math.PI * 0.7;
        bubbles.rotation.y = v * Math.PI * 1.4;
        control?.update();
        renderer.render(scene, camera);
        parent.dataset.rotation = bottle.rotation.y.toFixed(3);
        parent.dataset.camera = camera.position
          .toArray()
          .map((n) => n.toFixed(3))
          .join(",");
        parent.dataset.rendered = "true";
      };
      raf = requestAnimationFrame(render);
      const lost = (e: Event) => {
        e.preventDefault();
        if (running) setFailed(true);
      };
      canvas.addEventListener("webglcontextlost", lost);
      const reset = () => {
        camera.position.set(0, 0.3, 6);
        control?.target.set(0, 0.2, 0);
        control?.update();
      };
      parent.addEventListener("reset-view", reset);
      const rotate = (e: Event) => {
        const angle = (e as CustomEvent<number>).detail;
        const offset = camera.position
          .clone()
          .sub(control?.target ?? new THREE.Vector3());
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.copy(
          offset.add(control?.target ?? new THREE.Vector3()),
        );
        control?.update();
      };
      parent.addEventListener("rotate-view", rotate);
      cleanup = () => {
        running = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        observer.disconnect();
        canvas.removeEventListener("webglcontextlost", lost);
        parent.removeEventListener("reset-view", reset);
        parent.removeEventListener("rotate-view", rotate);
        control?.dispose();
        dispose();
        canvas.remove();
      };
    } catch {
      canvas.remove();
      setFailed(true);
    }
    return () => cleanup();
  }, [interactive, variant, progressSource]);
  return (
    <div
      className={`product-world ${variant}`}
      ref={container}
      role="img"
      aria-label={
        interactive
          ? "Interactive three-dimensional AURELLE serum. Drag to rotate."
          : "A real-time three-dimensional study of serum, glass and light"
      }
    >
      {failed && (
        <div className="webgl-fallback">
          <img src="/media/product-0.png" alt="Renewal Serum product render" />
          <p>3D view unavailable on this device. Product render shown.</p>
        </div>
      )}
      {interactive && !failed && (
        <>
          <span className="world-instruction">DRAG TO ROTATE · LIVE 3D</span>
          <button
            className="reset-view"
            aria-label="Reset product view"
            onClick={() =>
              container.current?.dispatchEvent(new Event("reset-view"))
            }
          >
            Reset ↺
          </button>
          <div className="rotation-buttons">
            <button
              aria-label="Rotate product left"
              onClick={() =>
                container.current?.dispatchEvent(
                  new CustomEvent("rotate-view", { detail: -0.35 }),
                )
              }
            >
              ←
            </button>
            <button
              aria-label="Rotate product right"
              onClick={() =>
                container.current?.dispatchEvent(
                  new CustomEvent("rotate-view", { detail: 0.35 }),
                )
              }
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductWorld(props: Parameters<typeof World>[0]) {
  const ref = useRef<HTMLDivElement>(null),
    [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="world-container" ref={ref}>
      {visible ? <World {...props} /> : <div className="world-loading" />}
    </div>
  );
}
