const MARQUEE_ITEMS = [
  'SASS',
  'Lenis',
  'React',
  'PHP',
  'WordPress',
  'Paystack',
  'PWA',
  'AI Integrations',
  'Three.js',
  'GLSL',
  'TypeScript',
  'Shipbubble',
];

export function MarqueeBand() {
  const repeated = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div
      aria-label="Core technologies marquee"
      className="relative my-6 overflow-hidden border-y border-black/10 bg-[#EBE6DC] py-4 dark:border-white/10 dark:bg-[#0B0B0F]"
    >
      <div className="animate-marquee flex items-center">
        {repeated.map((item, idx) => (
          <div key={`${item}-${idx}`} className="flex items-center shrink-0">
            <span className="px-6 font-serif-editorial text-2xl sm:text-3xl tracking-tight text-[#27272A] dark:text-[#D4CFC5]">
              {item}
            </span>
            <span
              aria-hidden="true"
              className="text-xs text-[#B08D4B] dark:text-[#D4B475]"
            >
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
