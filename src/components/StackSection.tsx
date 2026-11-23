import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import brandLogo from '../assets/images/brand_logo.jpg';
import { PROJECTS, ProjectItem } from '../data/projects';
import { createStudioRenderer, scheduleAfterDraw } from '../utils/webgl';

type StackCategory = 'CORE WEB' | '3D & MOTION' | 'BACKEND' | 'COMMERCE & APIS' | 'TOOLING';

interface StackNode {
  name: string;
  category: StackCategory;
  pos: THREE.Vector3;
}

const STACK_NODES_DEF: { name: string; category: StackCategory }[] = [
  { name: 'React', category: 'CORE WEB' },
  { name: 'TypeScript', category: 'CORE WEB' },
  { name: 'Next.js', category: 'CORE WEB' },
  { name: 'HTML', category: 'CORE WEB' },
  { name: 'CSS', category: 'CORE WEB' },
  { name: 'JavaScript', category: 'CORE WEB' },
  { name: 'Three.js', category: '3D & MOTION' },
  { name: 'GLSL', category: '3D & MOTION' },
  { name: 'Framer Motion', category: '3D & MOTION' },
  { name: 'Lenis', category: '3D & MOTION' },
  { name: 'GSAP', category: '3D & MOTION' },
  { name: 'PHP', category: 'BACKEND' },
  { name: 'MySQL', category: 'BACKEND' },
  { name: 'JWT', category: 'BACKEND' },
  { name: 'PWA', category: 'BACKEND' },
  { name: 'Vite', category: 'BACKEND' },
  { name: 'Paystack', category: 'COMMERCE & APIS' },
  { name: 'Shipbubble', category: 'COMMERCE & APIS' },
  { name: 'Google Auth', category: 'COMMERCE & APIS' },
  { name: 'AI APIs', category: 'COMMERCE & APIS' },
  { name: 'WordPress', category: 'COMMERCE & APIS' },
  { name: 'Tailwind', category: 'TOOLING' },
  { name: 'Git', category: 'TOOLING' },
  { name: 'Figma', category: 'TOOLING' },
  { name: 'Playwright', category: 'TOOLING' },
  { name: 'Leaflet', category: 'TOOLING' },
];

const CATEGORY_COLORS: Record<StackCategory, string> = {
  'CORE WEB': '#60A5FA',
  '3D & MOTION': '#D4B475',
  BACKEND: '#34D399',
  'COMMERCE & APIS': '#F472B6',
  TOOLING: '#A78BFA',
};

interface StackSectionProps {
  isDark: boolean;
  onInspectProject: (project: ProjectItem) => void;
}

export function StackSection({ isDark, onInspectProject }: StackSectionProps) {
  const [activeCategory, setActiveCategory] = useState<StackCategory | null>(null);
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>([58, 60, 59, 60, 60, 60, 59, 60, 60, 60]);

  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeCatRef = useRef<StackCategory | null>(null);
  const darkRef = useRef(isDark);

  activeCatRef.current = activeCategory;
  darkRef.current = isDark;

  // Live FPS telemetry meter
  useEffect(() => {
    let frames = 0;
    let lastCheck = performance.now();
    let rafId = 0;

    const measure = () => {
      frames++;
      const now = performance.now();
      if (now - lastCheck >= 600) {
        const currentFps = Math.min(120, Math.round((frames * 1000) / (now - lastCheck)));
        setFps(currentFps);
        setFpsHistory((prev) => [...prev.slice(1), currentFps]);
        frames = 0;
        lastCheck = now;
      }
      rafId = requestAnimationFrame(measure);
    };
    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 3D Orbital Sphere Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { renderer, isSoftwareGl } = createStudioRenderer(container, true);
    const scene = new THREE.Scene();

    const w = container.clientWidth || 500;
    const h = container.clientHeight || 460;
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 50);
    camera.position.set(0, 0, 7.2);

    const sphereGroup = new THREE.Group();
    scene.add(sphereGroup);

    // 3 Tilted Orbital Rings
    const ringGeo = new THREE.RingGeometry(2.38, 2.4, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xd4b475 : 0x8a6d35,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });

    const ringAngles: [number, number, number][] = [
      [Math.PI / 2.4, 0.25, 0],
      [-Math.PI / 3.1, -0.4, 0.3],
      [0.3, Math.PI / 2.2, -0.2],
    ];
    ringAngles.forEach(([rx, ry, rz]) => {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.set(rx, ry, rz);
      sphereGroup.add(ring);
    });

    // Subtle inner wireframe core shell
    const coreGeo = new THREE.IcosahedronGeometry(0.92, 1);
    const coreEdges = new THREE.EdgesGeometry(coreGeo);
    const coreMat = new THREE.LineBasicMaterial({
      color: 0xd4b475,
      transparent: true,
      opacity: 0.22,
    });
    const coreMesh = new THREE.LineSegments(coreEdges, coreMat);
    sphereGroup.add(coreMesh);

    // Fibonacci sphere distribution for tech nodes
    const nodes: StackNode[] = STACK_NODES_DEF.map((item, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / STACK_NODES_DEF.length);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const radius = 2.42;
      return {
        ...item,
        pos: new THREE.Vector3(
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.sin(phi) * Math.sin(theta),
          radius * Math.cos(phi)
        ),
      };
    });

    // Small glowing 3D dots for each node
    const dotGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const dotMeshes: THREE.Mesh[] = nodes.map((node) => {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(CATEGORY_COLORS[node.category]),
      });
      const m = new THREE.Mesh(dotGeo, mat);
      m.position.copy(node.pos);
      sphereGroup.add(m);
      return m;
    });

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0.0025;
    let velY = 0.0045;

    const dom = renderer.domElement;
    const onDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      velY = dx * 0.006;
      velX = dy * 0.006;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onUp = () => {
      isDragging = false;
    };

    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const onResize = () => {
      const nw = container.clientWidth || 1;
      const nh = container.clientHeight || 1;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    const tmpVec = new THREE.Vector3();
    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      ringMat.color.setHex(darkRef.current ? 0xd4b475 : 0x8a6d35);

      sphereGroup.rotation.y += velY * (dt * 60);
      sphereGroup.rotation.x += velX * (dt * 60);
      sphereGroup.rotation.x = THREE.MathUtils.clamp(sphereGroup.rotation.x, -0.85, 0.85);
      coreMesh.rotation.y -= dt * 0.35;

      if (!isDragging) {
        velX = THREE.MathUtils.lerp(velX, 0.0008, 0.03);
        velY = THREE.MathUtils.lerp(velY, 0.0038, 0.03);
      }

      sphereGroup.updateMatrixWorld();

      const cw = container.clientWidth || w;
      const ch = container.clientHeight || h;
      const catFilter = activeCatRef.current;

      nodes.forEach((node, idx) => {
        tmpVec.copy(node.pos).applyMatrix4(sphereGroup.matrixWorld);
        const zWorld = tmpVec.z;
        tmpVec.project(camera);

        const sx = ((tmpVec.x + 1) / 2) * cw;
        const sy = ((-tmpVec.y + 1) / 2) * ch;
        const depthNorm = THREE.MathUtils.clamp((zWorld + 2.5) / 5.0, 0, 1);

        const el = labelsRef.current[idx];
        if (el) {
          const dimmed = catFilter !== null && catFilter !== node.category;
          const opacity = dimmed ? 0.16 : 0.32 + depthNorm * 0.68;
          const scale = 0.8 + depthNorm * 0.25;
          el.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%) scale(${scale})`;
          el.style.opacity = opacity.toFixed(2);
          el.style.zIndex = String(Math.round(depthNorm * 20));
        }
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
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      ringGeo.dispose();
      ringMat.dispose();
      coreGeo.dispose();
      coreEdges.dispose();
      coreMat.dispose();
      dotGeo.dispose();
      dotMeshes.forEach((m) => (m.material as THREE.Material).dispose());
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  const categories: StackCategory[] = [
    'CORE WEB',
    '3D & MOTION',
    'BACKEND',
    'COMMERCE & APIS',
    'TOOLING',
  ];

  const featuredThumbs = PROJECTS.slice(0, 4);

  return (
    <section id="stack" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
        {/* Left Editorial + Category Legend */}
        <div className="lg:col-span-5">
          <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
            03 · STACK &amp; CRAFT
          </p>

          <h2 className="mt-4 font-serif-editorial text-[clamp(2.3rem,4.3vw,3.75rem)] font-normal leading-[1.05] tracking-tight text-[#141417] dark:text-[#F4F0E8] text-balance">
            Built light.{' '}
            <span className="italic text-[#6F6D66] dark:text-[#8E8A82]">Built to last.</span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4A4A52] dark:text-[#B4B0A8]">
            Every tool earns its place. Drag the sphere to spin through what I build with, from GPU
            shaders to payment rails. Hover a group to light it up.
          </p>

          {/* Interactive Category Legend */}
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onMouseEnter={() => setActiveCategory(cat)}
                  onMouseLeave={() => setActiveCategory(null)}
                  onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 font-mono-tech text-[10px] tracking-[0.14em] transition-colors whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'border-[#B08D4B] bg-[#D4B475]/15 text-[#141417] dark:border-[#D4B475] dark:text-[#F4F0E8]'
                      : 'border-black/10 text-[#5A5A64] hover:border-black/25 dark:border-white/10 dark:text-[#8E8A82] dark:hover:border-white/25'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Interactive 3D Orbital Sphere */}
        <div className="lg:col-span-7">
          <div className="relative flex h-[430px] sm:h-[480px] w-full items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-[#ECE8DF]/70 dark:border-white/10 dark:bg-[#0B0B0F]">
            <div
              ref={mountRef}
              className="relative h-full w-full cursor-grab active:cursor-grabbing"
            />

            {/* Central Brand Crest */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-14 w-14 overflow-hidden rounded-full border border-[#D4B475]/55 bg-black shadow-lg">
                <img
                  src={brandLogo}
                  alt="Asad Web Developer emblem"
                  className="h-full w-full scale-[1.26] object-cover object-[50%_45%]"
                />
              </div>
            </div>

            {/* Projected 2D Tech Node Labels */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {STACK_NODES_DEF.map((node, idx) => (
                <div
                  key={node.name}
                  ref={(el) => {
                    labelsRef.current[idx] = el;
                  }}
                  onMouseEnter={() => setHoveredTech(node.name)}
                  onMouseLeave={() => setHoveredTech(null)}
                  className="pointer-events-auto absolute left-0 top-0 select-none rounded-md border border-black/10 bg-[#F4F1EA]/90 px-2 py-0.5 font-mono-tech text-[11px] font-medium text-[#141417] shadow-sm transition-colors dark:border-white/15 dark:bg-[#111116]/90 dark:text-[#F4F0E8]"
                >
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[node.category] }}
                    />
                    <span>{node.name}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-4 inset-x-0 flex items-center justify-center">
              <span className="font-mono-tech text-[10px] tracking-[0.2em] text-[#71717A] dark:text-[#78746C]">
                {hoveredTech ? `SELECTED · ${hoveredTech.toUpperCase()}` : 'DRAG TO SPIN'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Telemetry & Craft Proof Cards */}
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* Card 1: Measured Live FPS */}
        <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#ECE8DF] p-6 dark:border-white/10 dark:bg-[#0D0D11]">
          <div>
            <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
              MEASURED LIVE
            </p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-sans-display text-5xl font-bold tracking-tight tabular-nums text-[#141417] dark:text-[#F4F0E8]">
                {fps}
              </span>
              <span className="font-mono-tech text-xs text-[#71717A] dark:text-[#8E8A82]">fps</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#4A4A52] dark:text-[#A1A1AA]">
              Frames per second on your device, right now. Every animation here is built to hold it.
            </p>
          </div>
          {/* Live FPS Waveform */}
          <div className="mt-6 flex h-10 items-end gap-1.5 border-t border-black/10 pt-3 dark:border-white/10">
            {fpsHistory.map((val, i) => (
              <div
                key={i}
                style={{ height: `${Math.max(20, Math.min(100, (val / 65) * 100))}%` }}
                className="flex-1 rounded-t-sm bg-[#B08D4B]/70 dark:bg-[#D4B475]/75 transition-all"
              />
            ))}
          </div>
        </div>

        {/* Card 2: Zero Defaults */}
        <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#ECE8DF] p-6 dark:border-white/10 dark:bg-[#0D0D11]">
          <div>
            <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
              ZERO DEFAULTS
            </p>
            <p className="mt-4 font-sans-display text-5xl font-bold tracking-tight tabular-nums text-[#141417] dark:text-[#F4F0E8]">
              0
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#4A4A52] dark:text-[#A1A1AA]">
              Native alerts or browser widgets. Every message, select and toast is designed.
            </p>
          </div>
          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg border border-black/10 bg-white/70 px-3 py-2 text-xs font-medium text-[#141417] dark:border-white/15 dark:bg-white/[0.04] dark:text-[#F4F0E8]">
            <Check className="h-3.5 w-3.5 text-[#8A6D35] dark:text-[#D4B475]" />
            <span>Message sent</span>
          </div>
        </div>

        {/* Card 3: Shipped Live */}
        <div className="flex flex-col justify-between rounded-2xl border border-black/10 bg-[#ECE8DF] p-6 dark:border-white/10 dark:bg-[#0D0D11]">
          <div>
            <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
              SHIPPED
            </p>
            <p className="mt-4 font-serif-editorial text-5xl font-normal tracking-tight text-[#141417] dark:text-[#F4F0E8]">
              Live
            </p>
            <p className="mt-3 text-xs leading-relaxed text-[#4A4A52] dark:text-[#A1A1AA]">
              In production across beauty, fashion, fintech, media, healthcare and billboards.
            </p>
          </div>
          <div className="mt-6 flex items-center -space-x-2">
            {featuredThumbs.map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => onInspectProject(proj)}
                title={`Inspect ${proj.title}`}
                className="group relative h-12 w-20 cursor-pointer overflow-hidden rounded-lg border border-black/15 bg-[#121216] transition-transform hover:-translate-y-1 hover:z-10 dark:border-white/20"
              >
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
