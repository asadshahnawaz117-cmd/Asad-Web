import { type MutableRefObject, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createStudioRenderer, scheduleAfterDraw } from '../utils/webgl';

interface FracturedPlatesCanvasProps {
  /** Incremented to replay the shatter-and-assemble choreography */
  revealTrigger?: number;
  /** Keep plates floating in subtle fractured perspective (ideal for Login backdrop) */
  ambientFracture?: boolean;
  /** Current theme mode */
  isDark: boolean;
  /** Normalized scroll shatter progress [0..1] driven externally without React re-renders */
  scrollProgressRef?: MutableRefObject<number>;
}

export interface ShardDef {
  points: [number, number][];
  scatterOffset: [number, number, number];
  scatterRot: [number, number, number];
  delay: number;
  /** Staggered scroll window [start, end] within [0..1] so shards break & rejoin one by one */
  scrollWindow: [number, number];
}

// Geometric Voronoi-inspired architectural slabs that tile the viewport
export const SHARD_DEFS: ShardDef[] = [
  {
    points: [
      [-9, 5.5],
      [-1.4, 5.5],
      [-2.5, 0.9],
      [-9, 1.8],
    ],
    scatterOffset: [-3.8, 2.5, 2.6],
    scatterRot: [0.42, -0.52, 0.22],
    delay: 0.0,
    scrollWindow: [0.0, 0.44],
  },
  {
    points: [
      [-1.4, 5.5],
      [4.2, 5.5],
      [2.6, 0.5],
      [-2.5, 0.9],
    ],
    scatterOffset: [0.4, 3.4, 3.3],
    scatterRot: [-0.46, 0.28, -0.16],
    delay: 0.14,
    scrollWindow: [0.16, 0.62],
  },
  {
    points: [
      [4.2, 5.5],
      [9, 5.5],
      [9, -0.2],
      [2.6, 0.5],
    ],
    scatterOffset: [4.1, 2.3, 2.1],
    scatterRot: [0.32, 0.56, -0.22],
    delay: 0.07,
    scrollWindow: [0.08, 0.52],
  },
  {
    points: [
      [-9, 1.8],
      [-2.5, 0.9],
      [-1.2, -5.5],
      [-9, -5.5],
    ],
    scatterOffset: [-3.9, -2.4, 2.9],
    scatterRot: [-0.34, -0.44, -0.24],
    delay: 0.21,
    scrollWindow: [0.24, 0.72],
  },
  {
    points: [
      [-2.5, 0.9],
      [2.6, 0.5],
      [4.6, -5.5],
      [-1.2, -5.5],
    ],
    scatterOffset: [0.6, -3.2, 3.6],
    scatterRot: [0.52, -0.24, 0.18],
    delay: 0.34,
    scrollWindow: [0.4, 0.95],
  },
  {
    points: [
      [2.6, 0.5],
      [9, -0.2],
      [9, -5.5],
      [4.6, -5.5],
    ],
    scatterOffset: [3.9, -2.6, 2.3],
    scatterRot: [-0.4, 0.48, 0.26],
    delay: 0.28,
    scrollWindow: [0.32, 0.84],
  },
];

export function computeShardScrollFactor(progress: number, [start, end]: [number, number]): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  const norm = (progress - start) / Math.max(end - start, 0.001);
  // Smooth ease-in-out cubic so each piece snaps crisply when joining back
  return norm < 0.5 ? 4 * norm * norm * norm : 1 - Math.pow(-2 * norm + 2, 3) / 2;
}

export function FracturedPlatesCanvas({
  revealTrigger = 0,
  ambientFracture = false,
  isDark,
  scrollProgressRef,
}: FracturedPlatesCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    revealTrigger,
    ambientFracture,
    isDark,
    animStart: performance.now(),
    mouseX: 0,
    mouseY: 0,
    scrollProgressRef,
  });

  stateRef.current.ambientFracture = ambientFracture;
  stateRef.current.isDark = isDark;
  stateRef.current.scrollProgressRef = scrollProgressRef;

  useEffect(() => {
    stateRef.current.revealTrigger = revealTrigger;
    stateRef.current.animStart = performance.now();
  }, [revealTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { renderer, isSoftwareGl } = createStudioRenderer(container, true);
    const scene = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 0, 11.5);

    // Procedural Studio Environment for crisp metallic edge reflections
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    pmrem.dispose();

    const keyLight = new THREE.DirectionalLight(0xf6dfb0, 1.75);
    keyLight.position.set(5, 6, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9ab8ff, 0.95);
    rimLight.position.set(-6, -4, 5);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0xf4f0e8, 0x0b0b0e, 0.85);
    scene.add(hemiLight);

    const slabMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0c0c10 : 0xeae5db,
      roughness: 0.38,
      metalness: 0.56,
      clearcoat: 0.5,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.78,
    });

    const edgeMat = new THREE.LineBasicMaterial({
      color: isDark ? 0xd4b475 : 0x9c7b38,
      transparent: true,
      opacity: isDark ? 0.28 : 0.32,
    });

    const shards: {
      group: THREE.Group;
      def: ShardDef;
      curPos: THREE.Vector3;
      curRot: THREE.Euler;
    }[] = [];

    const geometries: THREE.BufferGeometry[] = [];

    SHARD_DEFS.forEach((def) => {
      const shape = new THREE.Shape();
      def.points.forEach(([x, y], idx) => {
        if (idx === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });
      shape.closePath();

      const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.18,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.04,
        bevelSegments: 2,
      });
      extrudeGeo.center();
      geometries.push(extrudeGeo);

      let cx = 0;
      let cy = 0;
      def.points.forEach(([x, y]) => {
        cx += x;
        cy += y;
      });
      cx /= def.points.length;
      cy /= def.points.length;

      const mesh = new THREE.Mesh(extrudeGeo, slabMat);
      const edgesGeo = new THREE.EdgesGeometry(extrudeGeo, 24);
      geometries.push(edgesGeo);
      const line = new THREE.LineSegments(edgesGeo, edgeMat);

      const group = new THREE.Group();
      group.add(mesh);
      group.add(line);
      group.userData = { baseX: cx, baseY: cy };
      scene.add(group);

      shards.push({
        group,
        def,
        curPos: new THREE.Vector3(cx, cy, 0),
        curRot: new THREE.Euler(0, 0, 0),
      });
    });

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      stateRef.current.mouseX = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      stateRef.current.mouseY = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const {
        animStart,
        ambientFracture: isFractured,
        mouseX,
        mouseY,
        isDark: dark,
        scrollProgressRef: sRef,
      } = stateRef.current;

      slabMat.color.setHex(dark ? 0x0c0c10 : 0xe9e4da);
      slabMat.metalness = dark ? 0.56 : 0.22;
      slabMat.roughness = dark ? 0.38 : 0.48;
      edgeMat.color.setHex(dark ? 0xd4b475 : 0x8c6d32);

      const elapsedSinceReveal = (now - animStart) / 1000;
      const scrollVal = sRef ? sRef.current : 0;

      shards.forEach((s, i) => {
        const baseX = s.group.userData.baseX as number;
        const baseY = s.group.userData.baseY as number;

        let revealFactor = 0;
        let scrollFactor = 0;

        if (isFractured) {
          revealFactor = 0.42 + Math.sin(now * 0.0007 + i * 1.1) * 0.06;
        } else if (!prefersReduced) {
          // Staggered 1-by-1 initial assembly
          const t = Math.max(0, elapsedSinceReveal - s.def.delay);
          if (t < 0.2) {
            revealFactor = 1.0;
          } else {
            const p = Math.min(1, (t - 0.2) / 1.15);
            const eased = 1 - Math.pow(1 - p, 4);
            revealFactor = 1 - eased;
          }
          // Staggered 1-by-1 scroll shatter/reassemble along fracture seams
          scrollFactor = computeShardScrollFactor(scrollVal, s.def.scrollWindow);
        }

        const targetFactor = Math.max(revealFactor, scrollFactor);

        const parallaxX = mouseX * 0.14 * (1 + (i % 3) * 0.15);
        const parallaxY = mouseY * 0.12 * (1 + (i % 2) * 0.2);

        const tx = baseX + s.def.scatterOffset[0] * targetFactor + parallaxX;
        const ty = baseY + s.def.scatterOffset[1] * targetFactor + parallaxY;
        const tz = -0.35 + s.def.scatterOffset[2] * targetFactor;

        const rx = s.def.scatterRot[0] * targetFactor + mouseY * 0.035;
        const ry = s.def.scatterRot[1] * targetFactor - mouseX * 0.045;
        const rz = s.def.scatterRot[2] * targetFactor;

        const dampAlpha = 1 - Math.exp(-9 * dt);
        s.curPos.x = THREE.MathUtils.lerp(s.curPos.x, tx, dampAlpha);
        s.curPos.y = THREE.MathUtils.lerp(s.curPos.y, ty, dampAlpha);
        s.curPos.z = THREE.MathUtils.lerp(s.curPos.z, tz, dampAlpha);

        s.curRot.x = THREE.MathUtils.lerp(s.curRot.x, rx, dampAlpha);
        s.curRot.y = THREE.MathUtils.lerp(s.curRot.y, ry, dampAlpha);
        s.curRot.z = THREE.MathUtils.lerp(s.curRot.z, rz, dampAlpha);

        s.group.position.copy(s.curPos);
        s.group.rotation.copy(s.curRot);
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        scheduleAfterDraw(renderer, tick, (id) => {
          frameId = id;
        });
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      geometries.forEach((g) => g.dispose());
      slabMat.dispose();
      edgeMat.dispose();
      envTex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
    />
  );
}
