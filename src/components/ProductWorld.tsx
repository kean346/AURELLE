import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { makeProduct, setupScene } from "../lib/productScene";
function World({
  interactive = false,
  progressSource,
  variant = "serum",
}: {
  interactive?: boolean;
  progress?: number;
  progressSource?: RefObject<number>;
  variant?: "serum" | "liquid";
}) {
  const ref = useRef<HTMLDivElement>(null),
    [failed, setFailed] = useState(false);
  useEffect(() => {
    const parent = ref.current!,
      canvas = document.createElement("canvas");
    parent.prepend(canvas);
    let clean = () => {};
    try {
      const { renderer, scene, camera, dispose } = setupScene(canvas);
      const calm = matchMedia("(prefers-reduced-motion:reduce)");
      const bottle = makeProduct(0);
      scene.add(bottle);
      bottle.position.set(0, 0, 0);
      camera.position.set(0, 0.25, 6.8);
      camera.lookAt(0, 0.2, 0);
      const controls = interactive ? new OrbitControls(camera, canvas) : null;
      if (controls) {
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.09;
        controls.target.set(0, 0.1, 0);
        controls.minPolarAngle = 0.65;
        controls.maxPolarAngle = 2.1;
        controls.update();
      }
      const floor = new THREE.Mesh(
        new THREE.CircleGeometry(20, 96),
        new THREE.MeshStandardMaterial({
          color: "#1a211b",
          roughness: 0.3,
          metalness: 0.35,
        }),
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.02;
      scene.add(floor);
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(1.25, 1.3, 0.14, 96),
        new THREE.MeshPhysicalMaterial({
          color: "#28352b",
          roughness: 0.3,
          metalness: 0.4,
          clearcoat: 0.7,
        }),
      );
      plinth.position.y = -1.07;
      scene.add(plinth);
      const liquid = new THREE.MeshPhysicalMaterial({
        color: "#e3cf9e",
        metalness: 0,
        roughness: 0.035,
        transmission: 0.96,
        thickness: 0.22,
        ior: 1.44,
        attenuationColor: new THREE.Color("#a36a22"),
        attenuationDistance: 0.8,
        clearcoat: 1,
      });
      const pipette = new THREE.Group();
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.026, 1.05, 32),
        new THREE.MeshPhysicalMaterial({
          color: "#e0cf9f",
          roughness: 0.07,
          transmission: 0.6,
          thickness: 0.09,
        }),
      );
      pipette.add(shaft);
      const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.21, 0.21, 0.24, 64),
        new THREE.MeshStandardMaterial({
          color: "#c0ab7f",
          metalness: 1,
          roughness: 0.22,
        }),
      );
      head.position.y = 0.61;
      pipette.add(head);
      const rubber = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.135, 0.13, 12, 32),
        new THREE.MeshStandardMaterial({ color: "#101910", roughness: 0.3 }),
      );
      rubber.position.y = 0.87;
      pipette.add(rubber);
      pipette.position.set(0.85, 1.4, 0.2);
      pipette.rotation.z = -0.45;
      scene.add(pipette);
      const drops = new THREE.InstancedMesh(
        new THREE.SphereGeometry(1, 24, 16),
        liquid,
        3,
      );
      const dummy = new THREE.Object3D();
      scene.add(drops);
      const puddle = new THREE.Mesh(
        new THREE.SphereGeometry(1, 48, 24),
        liquid,
      );
      puddle.scale.set(0.55, 0.015, 0.4);
      puddle.position.set(0.85, -0.97, 0.3);
      scene.add(puddle);
      const orbs = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(
          new THREE.SphereGeometry(0.35 + i * 0.1, 48, 32),
          liquid,
        );
        b.position.set(
          (i % 2 ? 1 : -1) * (1.1 + i * 0.25),
          -0.3 + i * 0.32,
          -0.5,
        );
        orbs.add(b);
      }
      orbs.visible = false;
      scene.add(orbs);
      if (variant === "liquid") {
        bottle.scale.setScalar(0.7);
        bottle.position.x = -0.55;
        pipette.position.x = 0.55;
        camera.position.set(0, 0.7, 5.7);
      }
      let frame = 0,
        visible = true,
        last = 0,
        eased = 0,
        elapsed = 0;
      const size = () => {
        renderer.setSize(parent.clientWidth, parent.clientHeight);
        camera.aspect = parent.clientWidth / parent.clientHeight;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(size);
      ro.observe(parent);
      size();
      const io = new IntersectionObserver(
        ([e]) => (visible = e.intersectionRatio > 0.1),
        { threshold: 0.1 },
      );
      io.observe(parent);
      const render = (now: number) => {
        frame = requestAnimationFrame(render);
        const dt = Math.min(50, now - last);
        if (dt < 32 || !visible) return;
        last = now;
        if (!calm.matches) elapsed += dt / 1000;
        const target = progressSource?.current ?? 0;
        eased += (target - eased) * (1 - Math.exp(-dt * 0.005));
        if (!interactive) {
          bottle.rotation.y = -0.18 + eased * Math.PI * 1.2;
          camera.position.x = Math.sin(eased * Math.PI) * 0.65;
          camera.lookAt(0, 0.25, 0);
        }
        controls?.update();
        pipette.position.y = 1.02 + Math.sin(elapsed * 0.7) * 0.055;
        for (let i = 0; i < 3; i++) {
          const phase = (elapsed * 0.32 + i * 0.333) % 1;
          dummy.position.set(
            0.7 + Math.sin(i * 5) * 0.14,
            0.53 - phase * phase * 1.5,
            0.23 + Math.cos(i) * 0.16,
          );
          const scale = 0.025 + Math.sin(phase * Math.PI) * 0.035;
          dummy.scale.set(scale, scale * (1.4 + phase), scale);
          dummy.updateMatrix();
          drops.setMatrixAt(i, dummy.matrix);
        }
        drops.instanceMatrix.needsUpdate = true;
        orbs.rotation.y = Math.sin(elapsed * 0.12) * 0.25;
        renderer.render(scene, camera);
        parent.dataset.rendered = "true";
        parent.dataset.rotation = bottle.rotation.y.toFixed(3);
        parent.dataset.camera = camera.position
          .toArray()
          .map((n) => n.toFixed(3))
          .join(",");
      };
      frame = requestAnimationFrame(render);
      const reset = () => {
        camera.position.set(0, 0.25, 6.8);
        controls?.target.set(0, 0.1, 0);
        controls?.update();
      };
      const rotate = (e: Event) => {
        camera.position.applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          (e as CustomEvent<number>).detail,
        );
        controls?.update();
      };
      const lost = (e: Event) => {
        e.preventDefault();
        setFailed(true);
      };
      parent.addEventListener("reset-view", reset);
      parent.addEventListener("rotate-view", rotate);
      canvas.addEventListener("webglcontextlost", lost);
      clean = () => {
        cancelAnimationFrame(frame);
        ro.disconnect();
        io.disconnect();
        controls?.dispose();
        parent.removeEventListener("reset-view", reset);
        parent.removeEventListener("rotate-view", rotate);
        canvas.removeEventListener("webglcontextlost", lost);
        dispose();
        canvas.remove();
      };
    } catch {
      canvas.remove();
      setFailed(true);
    }
    return () => clean();
  }, [interactive, variant, progressSource]);
  return (
    <div
      className={`product-world ${variant}`}
      ref={ref}
      aria-label={
        interactive
          ? "Interactive 3D serum with moving droplets. Drag to rotate."
          : "Three-dimensional serum and suspended golden droplets"
      }
    >
      {failed && (
        <div className="webgl-fallback">
          <img src="/media/product-0.png" alt="Renewal Serum" />
          <p>Interactive view unavailable. Studio render shown.</p>
        </div>
      )}
      {interactive && !failed && (
        <>
          <span className="world-instruction">
            DRAG THE OBJECT · REAL-TIME 3D
          </span>
          <button
            className="reset-view"
            aria-label="Reset product view"
            onClick={() => ref.current?.dispatchEvent(new Event("reset-view"))}
          >
            Reset ↺
          </button>
          <div className="rotation-buttons">
            {[-1, 1].map((d) => (
              <button
                key={d}
                aria-label={`Rotate product ${d < 0 ? "left" : "right"}`}
                onClick={() =>
                  ref.current?.dispatchEvent(
                    new CustomEvent("rotate-view", { detail: d * 0.35 }),
                  )
                }
              >
                {d < 0 ? "←" : "→"}
              </button>
            ))}
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
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "150px" },
    );
    io.observe(ref.current!);
    return () => io.disconnect();
  }, []);
  return (
    <div className="world-container" ref={ref}>
      {visible ? (
        <World {...props} />
      ) : (
        <img
          className="world-placeholder"
          src="/media/product-0.png"
          alt="Renewal Serum studio render"
        />
      )}
    </div>
  );
}
