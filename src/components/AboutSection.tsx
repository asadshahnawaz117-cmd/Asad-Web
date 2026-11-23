import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createStudioRenderer, scheduleAfterDraw } from '../utils/webgl';

function MiniCubeCanvas({ isDark }: { isDark: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef(isDark);
  darkRef.current = isDark;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const { renderer, isSoftwareGl } = createStudioRenderer(container, true);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      (container.clientWidth || 1) / (container.clientHeight || 1),
      0.1,
      50
    );
    camera.position.set(0, 0, 4.4);

    const group = new THREE.Group();
    scene.add(group);

    // Outer glass-like cube + inner core cube + wireframe edges
    const outerGeo = new THREE.BoxGeometry(1.45, 1.45, 1.45);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.22,
      roughness: 0.2,
      metalness: 0.4,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    group.add(outerMesh);

    const edgeGeo = new THREE.EdgesGeometry(outerGeo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x93c5fd,
      transparent: true,
      opacity: 0.8,
    });
    group.add(new THREE.LineSegments(edgeGeo, edgeMat));

    const innerGeo = new THREE.BoxGeometry(0.68, 0.68, 0.68);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xd4b475,
      roughness: 0.3,
      metalness: 0.7,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.8);
    light1.position.set(3, 4, 5);
    scene.add(light1);
    scene.add(new THREE.AmbientLight(0x88aaff, 0.7));

    let dragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0.008;
    let velY = 0.012;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      velY = (e.clientX - prevX) * 0.01;
      velX = (e.clientY - prevY) * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let frameId = 0;
    let disposed = false;
    let last = performance.now();

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      edgeMat.color.setHex(darkRef.current ? 0x93c5fd : 0x2563eb);
      group.rotation.y += velY * (dt * 60);
      group.rotation.x += velX * (dt * 60);
      innerMesh.rotation.y -= dt * 0.9;

      if (!dragging) {
        velX = THREE.MathUtils.lerp(velX, 0.005, 0.03);
        velY = THREE.MathUtils.lerp(velY, 0.011, 0.03);
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
      dom.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      outerGeo.dispose();
      outerMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      renderer.dispose();
      if (dom.parentNode === container) container.removeChild(dom);
    };
  }, []);

  return <div ref={mountRef} className="h-44 w-full cursor-grab active:cursor-grabbing" />;
}

export function AboutSection({ isDark }: { isDark: boolean }) {
  const [activeCard, setActiveCard] = useState(0);

  // Interactive Card 02 state
  const [glassMode, setGlassMode] = useState(true);
  const [gridOverlay, setGridOverlay] = useState(false);
  const [motionSpeed, setMotionSpeed] = useState<'REDUCED' | 'BALANCED' | 'CRISP'>('BALANCED');
  const [projectScope, setProjectScope] = useState('3D experience');

  // Interactive Card 03 state
  const [orderStep, setOrderStep] = useState<1 | 2 | 3>(2);

  // Interactive Card 04 state
  const [hoveredDay, setHoveredDay] = useState<number | null>(5);
  const revenueBars = [
    { day: 'Mon', val: 145, h: 38 },
    { day: 'Tue', val: 190, h: 52 },
    { day: 'Wed', val: 168, h: 46 },
    { day: 'Thu', val: 235, h: 68 },
    { day: 'Fri', val: 210, h: 60 },
    { day: 'Sat', val: 284, h: 86 },
    { day: 'Sun', val: 312, h: 96 },
  ];

  const cardsMeta = [
    {
      idx: '01 / 04',
      title: '3D & Motion',
      desc: 'WebGL, shaders, Three.js scenes and scroll-driven storytelling, locked at 60fps.',
    },
    {
      idx: '02 / 04',
      title: 'Interface Design',
      desc: 'Bespoke, mobile-first UI. No defaults, no templates, every state designed.',
    },
    {
      idx: '03 / 04',
      title: 'Commerce & APIs',
      desc: 'Paystack, Shipbubble, Google Auth and JWT, wired into checkout flows that just work.',
    },
    {
      idx: '04 / 04',
      title: 'AI & Dashboards',
      desc: 'AI integrations, analytics and real-time data for fintech, energy and IoT.',
    },
  ];

  const nextCard = () => setActiveCard((prev) => (prev + 1) % 4);
  const prevCard = () => setActiveCard((prev) => (prev + 3) % 4);

  return (
    <section id="about" className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 lg:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
        {/* Left Editorial Column */}
        <div className="lg:col-span-6">
          <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
            01 · ABOUT
          </p>

          <h2 className="mt-4 font-serif-editorial text-[clamp(2.25rem,4.2vw,3.65rem)] font-normal leading-[1.06] tracking-tight text-[#141417] dark:text-[#F4F0E8] text-balance">
            Good frontend is invisible.{' '}
            <span className="italic text-[#6F6D66] dark:text-[#8E8A82]">
              Users never notice it, they just feel it working.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-[15px] leading-[1.7] text-[#4A4A52] dark:text-[#B4B0A8]">
            I&apos;m Asad Web Developer, running a modern frontend &amp; 3D studio. I build products
            where aesthetic clarity meets technical depth: real-time 3D, scroll choreography,
            payments and logistics, all tuned to load fast on a mid-range phone.
          </p>

          {/* 3-Column Metadata Strip */}
          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-black/10 pt-6 dark:border-white/10 sm:grid-cols-3">
            <div>
              <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
                BASED IN
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#141417] dark:text-[#F4F0E8]">
                Lagos, Nigeria
              </p>
            </div>
            <div>
              <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
                WORKING
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#141417] dark:text-[#F4F0E8]">
                Worldwide · Remote
              </p>
            </div>
            <div>
              <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
                FOCUS
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#141417] dark:text-[#F4F0E8]">
                3D · Motion · Commerce
              </p>
            </div>
          </div>
        </div>

        {/* Right Interactive Capability Card Deck */}
        <div className="lg:col-span-6">
          <div className="relative rounded-2xl border border-black/10 bg-[#ECE8DF] p-6 sm:p-8 dark:border-white/10 dark:bg-[#0D0D11]">
            {/* Top Bar Inside Card */}
            <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-4 dark:border-white/10">
              <span className="font-mono-tech text-xs text-[#71717A] dark:text-[#8E8A82]">
                {cardsMeta[activeCard].idx}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-mono-tech text-[11px] tracking-[0.16em] text-[#8A6D35] dark:text-[#D4B475]">
                  LIVE PREVIEW
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevCard}
                    aria-label="Previous capability card"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/15 text-[#141417] transition-colors hover:bg-black/5 dark:border-white/15 dark:text-[#F4F0E8] dark:hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextCard}
                    aria-label="Next capability card"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/15 text-[#141417] transition-colors hover:bg-black/5 dark:border-white/15 dark:text-[#F4F0E8] dark:hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Card Body */}
            <div className="mt-6 min-h-[220px]">
              {activeCard === 0 && (
                <div className="flex flex-col items-center justify-center rounded-xl border border-black/10 bg-[#E4DFD4] p-3 dark:border-white/10 dark:bg-[#121218]">
                  <MiniCubeCanvas isDark={isDark} />
                  <p className="mt-1 font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]">
                    DRAG CUBE TO INSPECT SHADER
                  </p>
                </div>
              )}

              {activeCard === 1 && (
                <div
                  className={`rounded-xl border border-black/10 p-5 transition-colors dark:border-white/10 ${
                    glassMode
                      ? 'bg-[#E4DFD4]/80 dark:bg-white/[0.04]'
                      : 'bg-[#DFDAD0] dark:bg-[#13131A]'
                  }`}
                  style={
                    gridOverlay
                      ? {
                          backgroundImage:
                            'linear-gradient(to right, rgba(212,180,117,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(212,180,117,0.12) 1px, transparent 1px)',
                          backgroundSize: '20px 20px',
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-medium text-[#141417] dark:text-[#F4F0E8]">
                      Glass mode
                    </span>
                    <button
                      type="button"
                      onClick={() => setGlassMode((g) => !g)}
                      aria-label="Toggle glass mode"
                      className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                        glassMode ? 'bg-[#D4B475]' : 'bg-black/20 dark:bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#070709] transition-transform ${
                          glassMode ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-xs font-medium text-[#141417] dark:text-[#F4F0E8]">
                      Grid
                    </span>
                    <button
                      type="button"
                      onClick={() => setGridOverlay((g) => !g)}
                      aria-label="Toggle grid overlay"
                      className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                        gridOverlay ? 'bg-[#D4B475]' : 'bg-black/20 dark:bg-white/20'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#070709] transition-transform ${
                          gridOverlay ? 'left-4.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="mt-3">
                    <p className="font-mono-tech text-[10px] tracking-[0.16em] text-[#71717A] dark:text-[#8E8A82]">
                      SPEED
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      {(['REDUCED', 'BALANCED', 'CRISP'] as const).map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setMotionSpeed(spd)}
                          className={`flex-1 cursor-pointer rounded-md py-1.5 font-mono-tech text-[10px] transition-colors ${
                            motionSpeed === spd
                              ? 'bg-[#141417] text-[#F4F0E8] dark:bg-[#F4F0E8] dark:text-[#070709]'
                              : 'border border-black/10 text-[#5A5A64] dark:border-white/10 dark:text-[#8E8A82]'
                          }`}
                        >
                          {spd}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="font-mono-tech text-[10px] tracking-[0.16em] text-[#71717A] dark:text-[#8E8A82]">
                      PROJECT TYPE
                    </p>
                    <div className="mt-1.5 flex gap-1.5">
                      {['3D experience', 'Commerce PWA'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setProjectScope(opt)}
                          className={`flex-1 cursor-pointer rounded-md border px-2.5 py-1.5 text-left text-xs transition-colors ${
                            projectScope === opt
                              ? 'border-[#B08D4B] text-[#141417] dark:border-[#D4B475] dark:text-[#F4F0E8]'
                              : 'border-black/10 text-[#71717A] dark:border-white/10 dark:text-[#8E8A82]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeCard === 2 && (
                <div className="rounded-xl border border-black/10 bg-[#E4DFD4] p-5 dark:border-white/10 dark:bg-[#121218]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono-tech text-[10px] tracking-[0.16em] text-[#71717A] dark:text-[#8E8A82]">
                        ORDER #8204
                      </p>
                      <p className="mt-1 text-sm font-medium text-[#141417] dark:text-[#F4F0E8]">
                        Linen two-piece · M
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-tech text-lg font-semibold text-[#141417] dark:text-[#F4F0E8]">
                        ₦48,900
                      </p>
                      <p className="font-mono-tech text-[10px] text-[#8A6D35] dark:text-[#D4B475]">
                        Express delivery
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg border border-black/10 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <p className="text-xs font-medium text-[#141417] dark:text-[#F4F0E8]">
                      {orderStep === 1 && 'Payment verified · Paystack webhook'}
                      {orderStep === 2 && 'Rider assigned · Shipbubble'}
                      {orderStep === 3 && 'Delivered to Victoria Island'}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { step: 1 as const, label: 'PAID' },
                        { step: 2 as const, label: 'SHIPPED' },
                        { step: 3 as const, label: 'DELIVERED' },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => setOrderStep(s.step)}
                          className={`flex cursor-pointer items-center justify-center gap-1 rounded-md py-1.5 font-mono-tech text-[10px] transition-colors ${
                            orderStep >= s.step
                              ? 'bg-[#D4B475]/20 text-[#8A6D35] dark:text-[#D4B475]'
                              : 'bg-black/5 text-[#71717A] dark:bg-white/5 dark:text-[#78746C]'
                          }`}
                        >
                          {orderStep >= s.step && <Check className="h-3 w-3" />}
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeCard === 3 && (
                <div className="rounded-xl border border-black/10 bg-[#E4DFD4] p-5 dark:border-white/10 dark:bg-[#121218]">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="font-mono-tech text-[10px] tracking-[0.16em] text-[#71717A] dark:text-[#8E8A82]">
                        REVENUE · 7D
                      </p>
                      <p className="mt-1 font-mono-tech text-2xl font-semibold text-[#141417] dark:text-[#F4F0E8]">
                        ₦1.37M
                      </p>
                    </div>
                    <span className="font-mono-tech text-xs text-[#8A6D35] dark:text-[#D4B475]">
                      {hoveredDay !== null
                        ? `${revenueBars[hoveredDay].day}: ₦${revenueBars[hoveredDay].val}k`
                        : '+18% vs last wk'}
                    </span>
                  </div>

                  {/* Interactive Mini Bar Chart */}
                  <div className="mt-5 flex h-24 items-end gap-2">
                    {revenueBars.map((bar, i) => (
                      <button
                        key={bar.day}
                        type="button"
                        onMouseEnter={() => setHoveredDay(i)}
                        onClick={() => setHoveredDay(i)}
                        aria-label={`${bar.day} revenue ₦${bar.val}k`}
                        className="group flex flex-1 cursor-pointer flex-col items-center gap-1.5"
                      >
                        <div className="flex h-20 w-full items-end">
                          <div
                            style={{ height: `${bar.h}%` }}
                            className={`w-full rounded-t-sm transition-colors ${
                              hoveredDay === i
                                ? 'bg-[#D4B475]'
                                : 'bg-black/20 group-hover:bg-[#D4B475]/70 dark:bg-white/15'
                            }`}
                          />
                        </div>
                        <span className="font-mono-tech text-[9px] text-[#71717A] dark:text-[#78746C]">
                          {bar.day}
                        </span>
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs text-[#5A5A64] dark:text-[#A1A1AA]">
                    Revenue is up 18% this week · Top seller: linen two-piece
                  </p>
                </div>
              )}
            </div>

            {/* Card Title & Description */}
            <div className="mt-6">
              <h3 className="font-serif-editorial text-2xl font-medium text-[#141417] dark:text-[#F4F0E8]">
                {cardsMeta[activeCard].title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4A4A52] dark:text-[#A1A1AA]">
                {cardsMeta[activeCard].desc}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex items-center gap-2">
              {cardsMeta.map((c, idx) => (
                <button
                  key={c.idx}
                  type="button"
                  onClick={() => setActiveCard(idx)}
                  aria-label={`Show ${c.title}`}
                  className={`h-1.5 cursor-pointer rounded-full transition-all ${
                    activeCard === idx
                      ? 'w-8 bg-[#B08D4B] dark:bg-[#D4B475]'
                      : 'w-2 bg-black/20 hover:bg-black/35 dark:bg-white/20 dark:hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
