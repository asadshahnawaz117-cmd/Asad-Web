import { ArrowRight, RotateCcw, Lock } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { PORTRAIT_IMAGE_PATH } from '../data/projects';
import {
  computeShardScrollFactor,
  FracturedPlatesCanvas,
  SHARD_DEFS,
} from './FracturedPlatesCanvas';

interface HeroSectionProps {
  isDark: boolean;
  onOpenLogin: () => void;
}

// 6 exact CSS polygon clip-paths aligned 1-to-1 with the 3D fracture seams in FracturedPlatesCanvas
const SHARD_CLIP_POLYGONS = [
  'polygon(0% 0%, 42.6% 0%, 36.8% 40%, 0% 30%)',
  'polygon(42.6% 0%, 72.1% 0%, 63.7% 44.5%, 36.8% 40%)',
  'polygon(72.1% 0%, 100% 0%, 100% 52.3%, 63.7% 44.5%)',
  'polygon(0% 30%, 36.8% 40%, 43.7% 100%, 0% 100%)',
  'polygon(36.8% 40%, 63.7% 44.5%, 74.2% 100%, 43.7% 100%)',
  'polygon(63.7% 44.5%, 100% 52.3%, 100% 100%, 74.2% 100%)',
];

const SHARD_DOM_VECTORS = [
  { tx: -260, ty: -170, tz: 190, rx: 18, ry: -24, rz: -12 },
  { tx: 30, ty: -230, tz: 230, rx: -22, ry: 14, rz: 9 },
  { tx: 270, ty: -160, tz: 165, rx: 16, ry: 26, rz: 14 },
  { tx: -275, ty: 180, tz: 210, rx: -18, ry: -22, rz: 14 },
  { tx: 45, ty: 245, tz: 250, rx: 24, ry: -12, rz: -10 },
  { tx: 265, ty: 185, tz: 175, rx: -20, ry: 24, rz: -14 },
];

export function HeroSection({ isDark, onOpenLogin }: HeroSectionProps) {
  const [revealCount, setRevealCount] = useState(0);
  const [lagosTime, setLagosTime] = useState('20:51');
  const [portraitSrc, setPortraitSrc] = useState(PORTRAIT_IMAGE_PATH);
  const [imgError, setImgError] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const scrollProgressRef = useRef(0);
  const revealStartRef = useRef(performance.now());
  const frameBgRef = useRef<HTMLDivElement>(null);
  const unifiedLayerRef = useRef<HTMLDivElement>(null);
  const shardLayerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentShardFactorsRef = useRef<number[]>([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date());
        setLagosTime(formatted);
      } catch {
        setLagosTime('20:51');
      }
    };
    updateClock();
    const timer = window.setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    revealStartRef.current = performance.now();
  }, [revealCount]);

  // Smooth scroll-driven 1-by-1 fracture & reassembly sync for hero UI slices
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        scrollProgressRef.current = 0;
        return;
      }
      // Map scroll runway [0..1] cleanly
      const raw = Math.min(1, Math.max(0, -rect.top / scrollable));
      scrollProgressRef.current = raw;
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    let rafId = 0;
    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const elapsedReveal = (now - revealStartRef.current) / 1000;
      const scrollVal = scrollProgressRef.current;
      let maxFactor = 0;

      SHARD_DEFS.forEach((def, idx) => {
        let revealFactor = 0;
        let scrollFactor = 0;

        if (!prefersReduced) {
          const t = Math.max(0, elapsedReveal - def.delay);
          if (t < 0.2) {
            revealFactor = 1.0;
          } else {
            const p = Math.min(1, (t - 0.2) / 1.15);
            revealFactor = 1 - (1 - Math.pow(1 - p, 4));
          }
          scrollFactor = computeShardScrollFactor(scrollVal, def.scrollWindow);
        }

        const target = Math.max(revealFactor, scrollFactor);
        const cur = currentShardFactorsRef.current[idx];
        const next = cur + (target - cur) * (1 - Math.exp(-10 * dt));
        currentShardFactorsRef.current[idx] = next;
        if (next > maxFactor) maxFactor = next;

        const shardEl = shardLayerRefs.current[idx];
        if (shardEl) {
          const vec = SHARD_DOM_VECTORS[idx];
          const tx = vec.tx * next;
          const ty = vec.ty * next;
          const tz = vec.tz * next;
          const rx = vec.rx * next;
          const ry = vec.ry * next;
          const rz = vec.rz * next;
          const opacity = Math.max(0, 1 - Math.pow(next, 1.55) * 0.92);

          shardEl.style.transform = `perspective(1100px) translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${tz.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg)`;
          shardEl.style.opacity = next > 0.008 ? opacity.toFixed(3) : '0';
          shardEl.style.visibility = next > 0.008 ? 'visible' : 'hidden';
        }
      });

      const unifiedEl = unifiedLayerRef.current;
      if (unifiedEl) {
        const isFractured = maxFactor > 0.012;
        unifiedEl.style.opacity = isFractured ? '0' : '1';
        unifiedEl.style.pointerEvents = isFractured ? 'none' : 'auto';
      }

      const frameBgEl = frameBgRef.current;
      if (frameBgEl) {
        frameBgEl.style.opacity = String(Math.max(0, 1 - maxFactor * 2.2));
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', updateScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderHeroContent = (isClone: boolean) => (
    <>
      {/* Subtle directional backdrop over 3D specular glare so hero copy always reads crisply */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(212,180,117,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_28%_48%,rgba(236,232,223,0.76),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_28%_48%,rgba(7,7,10,0.74),transparent_66%)]"
      />

      {/* Hero Split Content */}
      <div className="relative z-10 grid flex-1 grid-cols-1 items-stretch gap-8 px-6 pt-10 pb-6 sm:px-12 lg:grid-cols-12 lg:px-14 lg:pt-14">
        {/* Left Typographic Anchor */}
        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
            FRONTEND DEVELOPER · LAGOS
          </p>

          <h1 className="mt-4 font-sans-display text-[clamp(2.45rem,4.7vw,4.35rem)] font-bold leading-[0.96] tracking-tight text-[#141417] dark:text-[#F4F0E8] text-balance">
            Asad Web
            <br />
            Developer.
          </h1>

          <p className="mt-6 max-w-lg text-[15px] font-medium leading-relaxed text-[#1E1E24] dark:text-[#E8CFA0]">
            I build fast, modern, and responsive websites and web apps that help businesses grow
            online and win more clients.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              tabIndex={isClone ? -1 : undefined}
              onClick={isClone ? undefined : () => scrollTo('contact')}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#141417] px-6 py-3 text-xs font-semibold text-[#F4F0E8] transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-[#F4F0E8] dark:text-[#070709] whitespace-nowrap shrink-0"
            >
              <span>Start a project</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              tabIndex={isClone ? -1 : undefined}
              onClick={isClone ? undefined : () => scrollTo('work')}
              className="inline-flex cursor-pointer items-center gap-2 px-3 py-2.5 text-xs font-semibold text-[#141417] transition-colors hover:text-[#8A6D35] dark:text-[#F4F0E8] dark:hover:text-[#D4B475] whitespace-nowrap shrink-0"
            >
              <span>What I build</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              tabIndex={isClone ? -1 : undefined}
              onClick={isClone ? undefined : onOpenLogin}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 px-4 py-2.5 text-xs font-medium text-[#141417] transition-colors hover:border-[#B08D4B] hover:text-[#8A6D35] dark:border-white/15 dark:text-[#D4CFC5] dark:hover:border-[#D4B475] dark:hover:text-[#D4B475] whitespace-nowrap shrink-0"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Client Portal</span>
            </button>
          </div>
        </div>

        {/* Right Dramatic Portrait Anchor */}
        <div className="relative flex items-center justify-center lg:col-span-5 lg:justify-end">
          <div className="relative h-[360px] w-full max-w-[400px] sm:h-[420px] sm:max-w-[460px] lg:h-[460px] lg:max-w-[480px] overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
            {!imgError ? (
              <img
                src={portraitSrc}
                alt="Asad Web Developer — workspace portrait"
                referrerPolicy="no-referrer"
                onError={
                  isClone
                    ? undefined
                    : () => {
                        const directUrl =
                          'https://i.pinimg.com/736x/bc/19/07/bc1907e33f020ad5aef2b72e973ea2b4.jpg';
                        if (portraitSrc !== directUrl) {
                          setPortraitSrc(directUrl);
                        } else {
                          setImgError(true);
                        }
                      }
                }
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#1C1A17] to-[#0A0A0D] p-8 text-center">
                <span className="font-serif-editorial text-5xl text-[#D4B475]">AW</span>
                <span className="mt-2 font-mono-tech text-xs text-white/60">Asad Web Developer</span>
              </div>
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#ECE8DF]/75 via-transparent to-transparent dark:from-[#09090C]/75 dark:via-transparent dark:to-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bottom Architectural Footer Bar Inside Hero */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 px-6 py-4 text-[11px] font-mono-tech text-[#5A5A64] dark:border-white/10 dark:text-[#8E8A82] sm:px-12 lg:px-14">
        <div className="flex items-center gap-4">
          <span>© 2026 Asad Web Developer</span>
          <button
            type="button"
            tabIndex={isClone ? -1 : undefined}
            onClick={isClone ? undefined : () => setRevealCount((c) => c + 1)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[#8A6D35] transition-colors hover:text-[#141417] dark:text-[#D4B475] dark:hover:text-[#F4F0E8]"
            title="Replay 3D shatter reveal"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Replay 3D reveal</span>
          </button>
        </div>
        <span>Available · Lagos {lagosTime} · 6.52° N, 3.38° E</span>
      </div>
    </>
  );

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative mx-auto max-w-[1440px] px-4 pt-4 pb-8 sm:px-8 sm:pt-6 lg:h-[165vh]"
    >
      {/* Sticky Hero Viewport so scrolling down shatters the plates 1-by-1 and scrolling up rejoins them 1-by-1 */}
      <div className="lg:sticky lg:top-20 relative overflow-visible rounded-[26px] min-h-[580px] lg:min-h-[640px] flex flex-col justify-between">
        {/* Outer frame border & backing that dissolves as shards break apart */}
        <div
          ref={frameBgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[26px] border border-black/10 bg-[#ECE8DF] dark:border-white/10 dark:bg-[#09090C]"
        />

        {/* 3D Fractured Obsidian Plates Layer */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[26px]">
          <FracturedPlatesCanvas
            revealTrigger={revealCount}
            isDark={isDark}
            scrollProgressRef={scrollProgressRef}
          />
        </div>

        {/* Unified Interactive Hero Content (active when assembled) */}
        <div
          ref={unifiedLayerRef}
          className="relative z-10 flex flex-1 flex-col justify-between overflow-hidden rounded-[26px]"
        >
          {renderHeroContent(false)}
        </div>

        {/* 6 Clipped Fracture Shards that break apart & rejoin 1-by-1 along the crack lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 overflow-visible"
        >
          {SHARD_CLIP_POLYGONS.map((polygon, idx) => (
            <div
              key={idx}
              ref={(el) => {
                shardLayerRefs.current[idx] = el;
              }}
              style={{
                clipPath: polygon,
                visibility: 'hidden',
                willChange: 'transform, opacity',
              }}
              className="absolute inset-0 flex flex-col justify-between rounded-[26px] bg-[#ECE8DF]/55 dark:bg-[#09090C]/55"
            >
              {renderHeroContent(true)}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
