import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { products } from "./products";
const tones = [
  "#30261b",
  "#394238",
  "#352b23",
  "#665039",
  "#283b2f",
  "#303c35",
];
function print(index: number) {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1536;
  const x = c.getContext("2d")!;
  x.textAlign = "center";
  x.fillStyle = "#dfd1ad";
  x.font = '112px "Cormorant Garamond", Georgia';
  x.fillText("A U R E L L E", 1024, 310);
  x.font = '24px "DM Sans", sans-serif';
  x.fillText("S K I N   S T U D I O", 1024, 405);
  x.fillStyle = "#aa956b";
  x.fillRect(555, 570, 938, 2);
  x.fillStyle = "#eadfc5";
  x.font = '82px "Cormorant Garamond", Georgia';
  x.fillText(products[index].name, 1024, 790);
  x.font = '25px "DM Sans", sans-serif';
  x.fillText(
    "Nº " + String(index + 1).padStart(2, "0") + "     /     DAILY SKINCARE",
    1024,
    920,
  );
  x.fillText(products[index].size.toUpperCase(), 1024, 1230);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
function lathe(points: number[][]) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([r, y]) => new THREE.Vector3(r, y, 0)),
  );
  return new THREE.LatheGeometry(
    curve
      .getPoints(100)
      .map(
        (p) =>
          new THREE.Vector2(
            Math.max(0, Math.min(Math.max(...points.map((v) => v[0])), p.x)),
            p.y,
          ),
      ),
    128,
  );
}
export function makeProduct(index: number) {
  const p = products[index],
    g = new THREE.Group();
  g.name = p.name;
  const jar = p.shape === "jar",
    r = jar ? 0.62 : 0.405;
  const glass = new THREE.MeshPhysicalMaterial({
    color: tones[index],
    metalness: 0.12,
    roughness: 0.15,
    clearcoat: 1,
    clearcoatRoughness: 0.07,
    ior: 1.46,
    transmission: 0.08,
    thickness: 0.18,
    attenuationColor: new THREE.Color("#604222"),
    attenuationDistance: 1,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: "#a9956e",
    metalness: 1,
    roughness: 0.27,
  });
  const black = new THREE.MeshPhysicalMaterial({
    color: "#151c17",
    roughness: 0.29,
    clearcoat: 0.4,
  });
  const profile = jar
    ? [
        [0, -0.65],
        [0.55, -0.65],
        [0.61, -0.6],
        [0.62, -0.49],
        [0.62, 0.05],
        [0.6, 0.13],
        [0.55, 0.16],
        [0, 0.16],
      ]
    : [
        [0, -1],
        [0.32, -1],
        [0.395, -0.96],
        [0.405, -0.84],
        [0.405, 0.55],
        [0.4, 0.67],
        [0.34, 0.76],
        [0.24, 0.82],
        [0.23, 0.93],
        [0, 0.93],
      ];
  const body = new THREE.Mesh(lathe(profile), glass);
  g.add(body);
  const bottom = new THREE.Mesh(
    new THREE.TorusGeometry(r * 0.92, 0.022, 12, 96),
    gold,
  );
  bottom.rotation.x = Math.PI / 2;
  bottom.position.y = jar ? -0.64 : -0.98;
  g.add(bottom);
  const capY = jar ? 0.19 : 0.98,
    capR = jar ? 0.63 : 0.252,
    capH = jar ? 0.19 : 0.27;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(capR, capR, capH, 96),
    gold,
  );
  cap.position.y = capY;
  g.add(cap);
  const ridges = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.003, 0.003, capH * 0.82, 4),
    new THREE.MeshStandardMaterial({
      color: "#574d39",
      metalness: 0.85,
      roughness: 0.4,
    }),
    48,
  );
  const ridgeMatrix = new THREE.Matrix4();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    ridgeMatrix.makeTranslation(
      Math.sin(a) * (capR + 0.001),
      capY,
      Math.cos(a) * (capR + 0.001),
    );
    ridges.setMatrixAt(i, ridgeMatrix);
  }
  g.add(ridges);

  if (p.shape === "dropper") {
    const bulb = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.145, 0.14, 16, 32),
      black,
    );
    bulb.position.y = 1.31;
    g.add(bulb);
  }
  if (p.shape === "pump") {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.19, 32),
      gold,
    );
    stem.position.y = 1.2;
    g.add(stem);
    const nozzle = new THREE.Mesh(
      new RoundedBoxGeometry(0.48, 0.11, 0.16, 4, 0.035),
      black,
    );
    nozzle.position.set(0.11, 1.34, 0);
    g.add(nozzle);
  }
  if (p.shape === "mist") {
    const top = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.18, 64),
      black,
    );
    top.position.y = 1.16;
    g.add(top);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), gold);
    hole.position.set(0, 1.16, 0.222);
    g.add(hole);
  }
  const labelH = jar ? 0.52 : 1.18;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(
      r + 0.004,
      r + 0.004,
      labelH,
      128,
      1,
      true,
      Math.PI * 0.62,
      Math.PI * 0.76,
    ),
    new THREE.MeshStandardMaterial({
      map: print(index),
      transparent: true,
      metalness: 0.55,
      roughness: 0.4,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  label.rotation.y = Math.PI;
  label.position.y = jar ? -0.25 : -0.18;
  g.add(label);
  g.rotation.y = -0.15;
  g.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return g;
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
  renderer.setPixelRatio(
    transparent ? 1 : Math.min(devicePixelRatio, software ? 1 : 1.75),
  );
  renderer.transmissionResolutionScale = 0.5;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor("#181d19", transparent ? 0 : 1);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.25, 6);
  const studio = new THREE.Scene();
  studio.background = new THREE.Color("#20261f");
  const panels = [
    [-4, 2, 2, 1.8, 6, "#efe4c9"],
    [4, 1, -1, 1.2, 5, "#b9c7ad"],
    [0, 5, 0, 6, 1, "#e8dfc8"],
  ];
  for (const [x, y, z, w, h, c] of panels) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(Number(w), Number(h)),
      new THREE.MeshBasicMaterial({
        color: c as string,
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(Number(x), Number(y), Number(z));
    m.lookAt(0, 0, 0);
    studio.add(m);
  }
  const pmrem = new THREE.PMREMGenerator(renderer),
    env = pmrem.fromScene(studio, 0.02, 0.1, 100, {
      size: transparent ? 128 : 64,
    });
  scene.environment = env.texture;
  studio.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  pmrem.dispose();
  scene.add(new THREE.AmbientLight("#b9bca0", 0.65));
  const key = new THREE.DirectionalLight("#fff0d2", 3);
  key.position.set(-3, 3, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#d9e6ce", 4);
  rim.position.set(3, 2, -2);
  scene.add(rim);
  return {
    renderer,
    scene,
    camera,
    dispose() {
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(
            (m) => {
              Object.values(m).forEach((v) => {
                if (v instanceof THREE.Texture) v.dispose();
              });
              m.dispose();
            },
          );
        }
      });
      env.dispose();
      renderer.dispose();
    },
  };
}
