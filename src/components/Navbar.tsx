import { Moon, Sun, Menu, X } from 'lucide-react';
import { useState } from 'react';
import brandLogo from '../assets/images/brand_logo.jpg';

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenLogin: () => void;
  onReplayReveal?: () => void;
  currentView: 'portfolio' | 'login';
  onBackToPortfolio?: () => void;
}

export function Navbar({
  isDark,
  onToggleTheme,
  onOpenLogin,
  currentView,
  onBackToPortfolio,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileOpen(false);
    if (currentView !== 'portfolio' && onBackToPortfolio) {
      onBackToPortfolio();
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 60);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 bg-[#F4F1EA]/95 dark:border-white/10 dark:bg-[#070709]/95 transition-colors">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-8 px-5 sm:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            if (currentView !== 'portfolio' && onBackToPortfolio) onBackToPortfolio();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#D4B475]"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-[#D4B475]/45 bg-black shrink-0">
            <img
              src={brandLogo}
              alt="Asad Web Developer logo"
              className="h-full w-full scale-[1.26] object-cover object-[50%_45%]"
            />
          </span>
          <span className="font-sans-display text-sm font-semibold tracking-tight text-[#141417] dark:text-[#F4F0E8]">
            Asad Web Developer
          </span>
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-xs font-medium text-[#52525B] dark:text-[#A1A1AA]"
        >
          <button
            type="button"
            onClick={() => handleNavClick('about')}
            className="cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-[#141417] dark:hover:text-[#F4F0E8]"
          >
            <span className="font-mono-tech text-[11px] text-[#B08D4B] dark:text-[#D4B475] mr-1.5">01</span>
            About
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('work')}
            className="cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-[#141417] dark:hover:text-[#F4F0E8]"
          >
            <span className="font-mono-tech text-[11px] text-[#B08D4B] dark:text-[#D4B475] mr-1.5">02</span>
            Work
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('stack')}
            className="cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-[#141417] dark:hover:text-[#F4F0E8]"
          >
            <span className="font-mono-tech text-[11px] text-[#B08D4B] dark:text-[#D4B475] mr-1.5">03</span>
            Stack
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-[#141417] dark:hover:text-[#F4F0E8]"
          >
            <span className="font-mono-tech text-[11px] text-[#B08D4B] dark:text-[#D4B475] mr-1.5">04</span>
            Contact
          </button>
          <button
            type="button"
            onClick={onOpenLogin}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors hover:text-[#141417] dark:hover:text-[#F4F0E8] ${
              currentView === 'login' ? 'text-[#B08D4B] dark:text-[#D4B475] font-semibold' : ''
            }`}
          >
            Client Login
          </button>
        </nav>

        {/* Zone 3: Theme switch + Primary CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/15 text-[#141417] transition-colors hover:bg-black/5 dark:border-white/15 dark:text-[#F4F0E8] dark:hover:bg-white/10"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            className="hidden sm:inline-flex cursor-pointer items-center justify-center rounded-full bg-[#141417] px-4 py-2 text-xs font-semibold text-[#F4F0E8] transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-[#F4F0E8] dark:text-[#070709] whitespace-nowrap shrink-0"
          >
            Hire me
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="flex h-9 w-9 md:hidden cursor-pointer items-center justify-center rounded-lg border border-black/15 text-[#141417] dark:border-white/15 dark:text-[#F4F0E8]"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="border-t border-black/10 bg-[#F4F1EA] px-5 py-4 dark:border-white/10 dark:bg-[#0B0B0E] md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <button
              type="button"
              onClick={() => handleNavClick('about')}
              className="flex items-center justify-between py-1.5 text-left font-medium text-[#141417] dark:text-[#F4F0E8]"
            >
              <span>01. About</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('work')}
              className="flex items-center justify-between py-1.5 text-left font-medium text-[#141417] dark:text-[#F4F0E8]"
            >
              <span>02. Work</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('stack')}
              className="flex items-center justify-between py-1.5 text-left font-medium text-[#141417] dark:text-[#F4F0E8]"
            >
              <span>03. Stack</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="flex items-center justify-between py-1.5 text-left font-medium text-[#141417] dark:text-[#F4F0E8]"
            >
              <span>04. Contact</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenLogin();
              }}
              className="flex items-center justify-between py-1.5 text-left font-semibold text-[#B08D4B] dark:text-[#D4B475]"
            >
              <span>Client Login Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
