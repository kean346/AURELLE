import { useEffect, useRef } from "react";
import * as THREE from "three";
import { makeProduct, setupScene } from "./lib/productScene";
export default function Studio() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const { renderer, scene, camera, dispose } = setupScene(
      canvas.current!,
      true,
    );
    renderer.setPixelRatio(1);
    renderer.setSize(600, 1200);
    camera.aspect = 0.5;
    camera.position.set(0, 0.3, 6.3);
    camera.lookAt(0, 0.3, 0);
    camera.updateProjectionMatrix();
    let product: THREE.Group;
    Object.assign(window, {
      renderProduct: (i: number) => {
        if (product) scene.remove(product);
        product = makeProduct(i);
        scene.add(product);
        product.rotation.y = -0.15;
        if (i === 2 || i === 5) {
          camera.position.set(0, 0.55, 4.8);
          camera.lookAt(0, 0.1, 0);
        } else {
          camera.position.set(0, 0.5, 5.1);
          camera.lookAt(0, 0.5, 0);
        }
        renderer.render(scene, camera);
        return canvas.current!.toDataURL("image/png");
      },
    });
    return dispose;
  }, []);
  return <canvas ref={canvas} />;
}
