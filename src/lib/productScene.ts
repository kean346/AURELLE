import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { products } from "./products";

function label(index: number) {
  const p = products[index];
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 768;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#e5dfce";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#302d26";
  ctx.textAlign = "center";
  ctx.font = "76px Georgia";
  ctx.fillText("A U R E L L E", 512, 175);
  ctx.font = "18px sans-serif";
  ctx.fillText("T H E   A R T   O F   B E I N G", 512, 230);
  ctx.fillRect(170, 325, 684, 1);
  ctx.font = "42px Georgia";
  ctx.fillText(p.name, 512, 425);
  ctx.font = "20px sans-serif";
  ctx.fillText("A CONSIDERED DAILY RITUAL", 512, 485);
  ctx.fillText(p.size.toUpperCase(), 512, 645);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
export function makeProduct(index: number) {
  const p = products[index];
  const group = new THREE.Group();
  group.name = p.name;
  const jar = p.shape === "jar",
    r = jar ? 0.64 : 0.43,
    bodyH = jar ? 0.85 : 1.65;
  const mat = new THREE.MeshPhysicalMaterial({
    color: p.color,
    roughness: 0.22,
    metalness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r * 0.96, bodyH, 80, 1),
    mat,
  );
  group.add(body);
  const base = new THREE.Mesh(
    new THREE.TorusGeometry(r * 0.94, 0.035, 12, 80),
    new THREE.MeshStandardMaterial({
      color: "#b6a583",
      metalness: 0.8,
      roughness: 0.2,
    }),
  );
  base.rotation.x = Math.PI / 2;
  base.position.y = -bodyH / 2;
  group.add(base);
  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), mat);
  shoulder.scale.y = 0.4;
  shoulder.position.y = bodyH / 2 - 0.035;
  group.add(shoulder);
  const capH = jar ? 0.2 : p.shape === "dropper" ? 0.4 : 0.32,
    capR = jar ? r * 1.035 : r * 0.72;
  const capMat = new THREE.MeshStandardMaterial({
    color: "#b7ac96",
    metalness: 0.88,
    roughness: 0.23,
  });
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(capR, capR, capH, 64),
    capMat,
  );
  cap.position.y = bodyH / 2 + capH / 2 + 0.09;
  group.add(cap);
  if (p.shape === "dropper") {
    const bulb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.18, 0.24, 12, 32),
      new THREE.MeshStandardMaterial({ color: "#292823", roughness: 0.55 }),
    );
    bulb.position.y = bodyH / 2 + capH + 0.28;
    group.add(bulb);
  }
  if (p.shape === "pump") {
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.28, 32),
      capMat,
    );
    neck.position.y = bodyH / 2 + capH + 0.2;
    group.add(neck);
    const nozzle = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.13, 0.25),
      capMat,
    );
    nozzle.position.set(0.15, bodyH / 2 + capH + 0.38, 0);
    group.add(nozzle);
  }
  const labelH = jar ? 0.54 : 1.04;
  const l = new THREE.Mesh(
    new THREE.CylinderGeometry(
      r + 0.003,
      r + 0.003,
      labelH,
      80,
      1,
      true,
      Math.PI * 0.64,
      Math.PI * 0.72,
    ),
    new THREE.MeshStandardMaterial({
      map: label(index),
      roughness: 0.7,
      side: THREE.DoubleSide,
    }),
  );
  l.rotation.y = Math.PI;
  group.add(l);
  group.rotation.y = -0.16;
  group.position.y = -0.15;
  group.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return group;
}
export function setupScene(canvas: HTMLCanvasElement, transparent = false) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: transparent,
    antialias: true,
    preserveDrawingBuffer: transparent,
  });
  const gl = renderer.getContext(),
    debug = gl.getExtension("WEBGL_debug_renderer_info");
  const software = debug
    ? /swiftshader|llvmpipe/i.test(
        gl.getParameter(debug.UNMASKED_RENDERER_WEBGL),
      )
    : false;
  renderer.setPixelRatio(software ? 0.6 : Math.min(devicePixelRatio, 1.5));
  renderer.transmissionResolutionScale = 0.5;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor("#c7bca6", transparent ? 0 : 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0.3, 6);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04, 0.1, 100, { size: 64 });
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.AmbientLight("#fff1dc", 2));
  const key = new THREE.DirectionalLight("#fff6df", 5);
  key.position.set(-3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#fff", 4);
  rim.position.set(4, 2, -3);
  scene.add(rim);
  return {
    renderer,
    scene,
    camera,
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const ms = Array.isArray(o.material) ? o.material : [o.material];
          ms.forEach((m) => {
            Object.values(m).forEach((v) => {
              if (v instanceof THREE.Texture) v.dispose();
            });
            m.dispose();
          });
        }
      });
      env.dispose();
      renderer.dispose();
    },
  };
}
