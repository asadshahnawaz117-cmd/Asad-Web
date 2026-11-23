import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  drawProjectPreviewCanvas,
  PROJECTS,
  ProjectItem,
} from '../data/projects';
import { createStudioRenderer, scheduleAfterDraw } from '../utils/webgl';

interface NightTunnelSectionProps {
  isDark: boolean;
  onSelectProject: (project: ProjectItem) => void;
  onStartProject: () => void;
}

// Helper to create rounded-rectangle rib points for the architectural tunnel
function buildRoundedRectPoints(w: number, h: number, r: number, segsPerCorner = 6): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const hw = w / 2;
  const hh = h / 2;
  const corners = [
    { cx: hw - r, cy: hh - r, a0: 0, a1: Math.PI / 2 },
    { cx: -hw + r, cy: hh - r, a0: Math.PI / 2, a1: Math.PI },
    { cx: -hw + r, cy: -hh + r, a0: Math.PI, a1: (Math.PI * 3) / 2 },
    { cx: hw - r, cy: -hh + r, a0: (Math.PI * 3) / 2, a1: Math.PI * 2 },
  ];

  corners.forEach((c) => {
    for (let i = 0; i <= segsPerCorner; i++) {
      const a = c.a0 + ((c.a1 - c.a0) * i) / segsPerCorner;
      pts.push(new THREE.Vector3(c.cx + Math.cos(a) * r, c.cy + Math.sin(a) * r, 0));
    }
  });
  pts.push(pts[0].clone());
  return pts;
}

function createCeilingContourTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0B0A08';
  ctx.fillRect(0, 0, 512, 512);

  // Warm champagne-gold illuminated architectural light panel with concentric contour rings
  const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 250);
  grad.addColorStop(0, '#E8CC8C');
  grad.addColorStop(0.65, '#C49F59');
  grad.addColorStop(1, '#5D4822');
  ctx.fillStyle = grad;
  ctx.fillRect(18, 18, 476, 476);

  ctx.strokeStyle = 'rgba(10, 9, 7, 0.72)';
  ctx.lineWidth = 7;
  for (let i = 1; i <= 7; i++) {
    const pad = 22 + i * 28;
    const w = 512 - pad * 2;
    const h = 512 - pad * 2;
    if (w <= 20) break;
    ctx.beginPath();
    ctx.roundRect(pad, pad, w, h, Math.max(8, 56 - i * 6));
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function NightTunnelSection({
  isDark,
  onSelectProject,
  onStartProject,
}: NightTunnelSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [tunnelProgress, setTunnelProgress] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const stateRef = useRef({
    targetProgress: 0,
    currentProgress: 0,
    mouseX: 0,
    mouseY: 0,
    isDark,
    onSelectProject,
  });

  stateRef.current.isDark = isDark;
  stateRef.current.onSelectProject = onSelectProject;

  // Sync sticky scroll runway to tunnel travel progress [0..1]
  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const raw = THREE.MathUtils.clamp(-rect.top / scrollable, 0, 1);
      stateRef.current.targetProgress = raw;
      setTunnelProgress(raw);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const jumpToProject = (idx: number) => {
    const clamped = THREE.MathUtils.clamp(idx, 0, PROJECTS.length - 1);
    const el = sectionRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    const targetFrac = (clamped + 0.35) / (PROJECTS.length + 0.8);
    const top = el.offsetTop + scrollable * targetFrac;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { renderer, isSoftwareGl } = createStudioRenderer(container, false);
    const scene = new THREE.Scene();
    const bgHex = isDark ? 0x060608 : 0xe9e4da;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, 0.022);

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(58, w / h, 0.1, 140);
    camera.position.set(0, 0, 2.5);

    const tunnelWidth = 9.2;
    const tunnelHeight = 5.6;
    const tunnelDepth = 138;

    // Wireframe architectural tunnel ribs
    const ribPts = buildRoundedRectPoints(tunnelWidth, tunnelHeight, 1.3, 6);
    const ribGeo = new THREE.BufferGeometry().setFromPoints(ribPts);
    const ribMat = new THREE.LineBasicMaterial({
      color: isDark ? 0xd4b475 : 0x8a6d35,
      transparent: true,
      opacity: isDark ? 0.24 : 0.3,
    });

    const disposables: { dispose: () => void }[] = [ribGeo, ribMat];

    for (let z = 4; z >= -tunnelDepth; z -= 4) {
      const rib = new THREE.Line(ribGeo, ribMat);
      rib.position.z = z;
      scene.add(rib);
    }

    // Longitudinal tunnel grid lines along walls, ceiling, and floor
    const longLineMat = new THREE.LineBasicMaterial({
      color: isDark ? 0xd4b475 : 0x8a6d35,
      transparent: true,
      opacity: isDark ? 0.16 : 0.22,
    });
    disposables.push(longLineMat);

    ribPts.forEach((pt, idx) => {
      if (idx % 2 !== 0) return;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(pt.x, pt.y, 4),
        new THREE.Vector3(pt.x, pt.y, -tunnelDepth),
      ]);
      disposables.push(geo);
      scene.add(new THREE.Line(geo, longLineMat));
    });

    // Illuminated golden ceiling contour light panels
    const ceilingTex = createCeilingContourTexture();
    disposables.push(ceilingTex);
    const ceilingGeo = new THREE.PlaneGeometry(3.8, 3.8);
    const ceilingMat = new THREE.MeshBasicMaterial({
      map: ceilingTex,
      side: THREE.DoubleSide,
    });
    disposables.push(ceilingGeo, ceilingMat);

    for (let z = -5; z >= -tunnelDepth + 6; z -= 16) {
      const panel = new THREE.Mesh(ceilingGeo, ceilingMat);
      panel.position.set(0, tunnelHeight / 2 - 0.06, z);
      panel.rotation.x = Math.PI / 2;
      scene.add(panel);
    }

    const panelMeshes: THREE.Mesh[] = [];
    const panelFrames: {
      group: THREE.Group;
      borderMat: THREE.LineBasicMaterial;
      project: ProjectItem;
      zPos: number;
      index: number;
    }[] = [];

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const panelGeo = new THREE.PlaneGeometry(4.6, 2.88);
    const backingGeo = new THREE.PlaneGeometry(4.74, 3.02);
    const borderGeo = new THREE.EdgesGeometry(backingGeo);
    disposables.push(panelGeo, backingGeo, borderGeo);

    const backingMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0d });
    disposables.push(backingMat);

    PROJECTS.forEach((project, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 640;
      drawProjectPreviewCanvas(canvas, project, null);

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(maxAniso, 8);
      tex.needsUpdate = true;
      disposables.push(tex);

      // Load dedicated photographic image for this panel and redraw when ready
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (disposed) return;
        drawProjectPreviewCanvas(canvas, project, img);
        tex.needsUpdate = true;
      };
      img.onerror = () => {
        if (disposed) return;
        drawProjectPreviewCanvas(canvas, project, null);
        tex.needsUpdate = true;
      };
      img.src = project.imageUrl;

      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        fog: false,
      });
      const borderMat = new THREE.LineBasicMaterial({
        color: 0xd4b475,
        transparent: true,
        opacity: 0.55,
      });
      disposables.push(mat, borderMat);

      const group = new THREE.Group();
      const screenMesh = new THREE.Mesh(panelGeo, mat);
      screenMesh.userData = { project, index: idx };
      // Keep Layer 0 enabled for camera rendering AND enable Layer 1 for raycasting
      screenMesh.layers.enable(1);
      panelMeshes.push(screenMesh);

      const backingMesh = new THREE.Mesh(backingGeo, backingMat);
      backingMesh.position.z = -0.02;

      const borderLine = new THREE.LineSegments(borderGeo, borderMat);
      borderLine.position.z = 0.01;

      group.add(backingMesh);
      group.add(screenMesh);
      group.add(borderLine);

      const isRight = idx % 2 === 0;
      const zPos = -7 - idx * 9.8;
      group.position.set(isRight ? 2.65 : -2.65, -0.08, zPos);
      group.rotation.y = isRight ? -0.46 : 0.46;

      scene.add(group);
      panelFrames.push({ group, borderMat, project, zPos, index: idx });
    });

    // Pointer look & Raycasting
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let lastRaycast = 0;
    let currentHovered: string | null = null;

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      stateRef.current.mouseX = pointer.x;
      stateRef.current.mouseY = pointer.y;

      const now = performance.now();
      if (now - lastRaycast < 45) return;
      lastRaycast = now;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(panelMeshes, false);
      if (hits.length > 0) {
        const proj = hits[0].object.userData.project as ProjectItem;
        if (currentHovered !== proj.id) {
          currentHovered = proj.id;
          setHoveredId(proj.id);
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        if (currentHovered !== null) {
          currentHovered = null;
          setHoveredId(null);
        }
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointer.y = -(((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(panelMeshes, false);
      if (hits.length > 0) {
        const proj = hits[0].object.userData.project as ProjectItem;
        stateRef.current.onSelectProject(proj);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', updatePointer, { passive: true });
    dom.addEventListener('click', handleClick);

    const onResize = () => {
      const nw = container.clientWidth || 1;
      const nh = container.clientHeight || 1;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let disposed = false;
    let lastTime = performance.now();
    let reportedActive = 0;

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const s = stateRef.current;
      const dark = s.isDark;

      const targetBg = dark ? 0x060608 : 0xe9e4da;
      (scene.background as THREE.Color).setHex(targetBg);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(targetBg);
      }
      ribMat.color.setHex(dark ? 0xd4b475 : 0x7c5f27);
      longLineMat.color.setHex(dark ? 0xd4b475 : 0x7c5f27);

      // Smooth damped camera walk down Z
      s.currentProgress = THREE.MathUtils.damp(s.currentProgress, s.targetProgress, 7, dt);
      const camZ = THREE.MathUtils.lerp(2.5, -122, s.currentProgress);
      camera.position.z = camZ;

      // Smooth mouse look inside the tunnel
      const targetCamX = s.mouseX * 0.68;
      const targetCamY = s.mouseY * 0.42;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 5, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 5, dt);
      camera.lookAt(s.mouseX * 1.4, s.mouseY * 0.75, camZ - 12);

      // Determine closest project ahead of camera for bottom HUD
      let bestIdx = 0;
      let bestDist = Infinity;
      panelFrames.forEach((pf) => {
        const dist = Math.abs(pf.zPos - (camZ - 5.5));
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = pf.index;
        }
        const isHov = currentHovered === pf.project.id;
        pf.borderMat.opacity = isHov ? 1.0 : 0.45;
        const targetScale = isHov ? 1.04 : 1.0;
        pf.group.scale.x = THREE.MathUtils.damp(pf.group.scale.x, targetScale, 8, dt);
        pf.group.scale.y = THREE.MathUtils.damp(pf.group.scale.y, targetScale, 8, dt);
      });

      if (bestIdx !== reportedActive) {
        reportedActive = bestIdx;
        setActiveIndex(bestIdx);
      }

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
      dom.removeEventListener('pointermove', updatePointer);
      dom.removeEventListener('click', handleClick);
      window.removeEventListener('resize', onResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  const currentProject = PROJECTS[activeIndex] || PROJECTS[0];
  const atExit = tunnelProgress > 0.9;

  return (
    <section id="work" ref={sectionRef} className="relative h-[340vh]">
      {/* Sticky 3D Night Tunnel Viewport */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] w-full overflow-hidden border-y border-black/10 dark:border-white/10">
        <div ref={mountRef} className="h-full w-full" />

        {/* Section Intro Banner at Tunnel Entrance */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-14 z-10 mx-auto max-w-[1440px] px-6 sm:px-12 transition-opacity duration-500 ${
            tunnelProgress < 0.08 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
            02 · SELECTED WORK
          </p>
          <h2 className="mt-2 font-serif-editorial text-[clamp(2rem,4vw,3.3rem)] font-normal leading-tight text-[#141417] dark:text-[#F4F0E8]">
            Built to be used.{' '}
            <span className="italic text-[#6F6D66] dark:text-[#8E8A82]">Step inside.</span>
          </h2>
        </div>

        {/* Top Minimal HUD */}
        <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex flex-wrap items-center justify-between gap-4 px-5 sm:px-8 font-mono-tech text-[10px] tracking-[0.18em] text-[#5A5A64] dark:text-[#8E8A82]">
          <span>NIGHT TUNNEL · SELECTED WORK</span>
          <span className="hidden sm:inline">
            SCROLL TO WALK · MOVE YOUR MOUSE TO LOOK · CLICK A PANEL TO OPEN
          </span>
        </div>

        {/* Tunnel Exit Prompt at 90%+ progress */}
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center transition-all duration-500 ${
            atExit ? 'pointer-events-auto opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'
          }`}
        >
          <p className="font-serif-editorial text-3xl sm:text-5xl text-[#141417] dark:text-[#F4F0E8]">
            Your project could <span className="italic text-[#B08D4B] dark:text-[#D4B475]">hang here next.</span>
          </p>
          <p className="mt-3 font-mono-tech text-[11px] tracking-[0.2em] text-[#5A5A64] dark:text-[#8E8A82]">
            THANKS FOR WALKING THROUGH
          </p>
          <button
            type="button"
            onClick={onStartProject}
            className="mt-6 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#141417] px-6 py-3 text-xs font-semibold text-[#F4F0E8] transition-transform hover:scale-[1.03] dark:bg-[#F4F0E8] dark:text-[#070709]"
          >
            <span>START A PROJECT</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#D4B475] dark:text-[#B08D4B]" />
          </button>
        </div>

        {/* Bottom Interactive Tunnel HUD Capsule */}
        <div className="pointer-events-auto absolute bottom-5 left-1/2 z-20 flex w-[min(94vw,620px)] -translate-x-1/2 flex-col gap-2">
          <div className="flex items-center justify-between gap-3 rounded-full border border-black/15 bg-[#F4F1EA]/95 px-3 py-2 shadow-lg dark:border-white/15 dark:bg-[#0B0B0F]/95">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => jumpToProject(activeIndex - 1)}
                disabled={activeIndex === 0}
                aria-label="Previous project in tunnel"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#141417] transition-colors hover:bg-black/5 disabled:opacity-35 dark:border-white/10 dark:text-[#F4F0E8] dark:hover:bg-white/10"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => jumpToProject(activeIndex + 1)}
                disabled={activeIndex === PROJECTS.length - 1}
                aria-label="Next project in tunnel"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 text-[#141417] transition-colors hover:bg-black/5 disabled:opacity-35 dark:border-white/10 dark:text-[#F4F0E8] dark:hover:bg-white/10"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="min-w-0 flex-1 px-1">
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[11px] text-[#8A6D35] dark:text-[#D4B475]">
                  {currentProject.number}
                </span>
                <span className="truncate text-xs sm:text-sm font-semibold text-[#141417] dark:text-[#F4F0E8]">
                  {currentProject.title}
                </span>
              </div>
              <p className="truncate font-mono-tech text-[9px] tracking-[0.16em] text-[#71717A] dark:text-[#8E8A82]">
                {hoveredId ? 'CLICK PANEL TO INSPECT' : currentProject.category}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectProject(currentProject)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#141417] py-1.5 pl-4 pr-1.5 text-[11px] font-semibold text-[#F4F0E8] transition-transform hover:scale-[1.03] dark:bg-[#F4F0E8] dark:text-[#070709] whitespace-nowrap shrink-0"
            >
              <span>OPEN</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#D4B475] text-[#070709]">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>

          {/* Subtle Tunnel Progress Dots */}
          <div className="flex items-center justify-center gap-1.5">
            {PROJECTS.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => jumpToProject(idx)}
                aria-label={`Jump to ${p.title}`}
                className={`h-1.5 cursor-pointer rounded-full transition-all ${
                  activeIndex === idx
                    ? 'w-6 bg-[#D4B475]'
                    : 'w-1.5 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/45'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
