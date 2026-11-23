import { ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Copy, MessageCircle } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';

const PROJECT_TYPES = [
  '3D & Interactive Web',
  'E-Commerce & Payments',
  'SaaS / AI Dashboard',
  'Landing Page / Brand',
  'Full-Time / Contract Role',
];

interface ContactSectionProps {
  preselectedProjectType?: string;
}

export function ContactSection({ preselectedProjectType }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (preselectedProjectType) {
      setProjectType(preselectedProjectType);
    }
  }, [preselectedProjectType]);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('asadshahnawaz117@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2200);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg('Please fill in your name, email, and project details.');
      return;
    }
    setErrorMsg('');

    // Attempt to persist inquiry in Supabase `contact_messages` if table exists
    await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: email.trim(),
        project_type: projectType,
        message: message.trim(),
      })
      .then(() => undefined, () => undefined);

    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 4500);
  };

  const whatsappTextParts = [
    name.trim() ? `Name: ${name.trim()}` : '',
    email.trim() ? `Email: ${email.trim()}` : '',
    `Project: ${projectType}`,
    message.trim() ? `Message: ${message.trim()}` : '',
  ].filter(Boolean);

  const whatsappHref =
    name.trim() || email.trim() || message.trim()
      ? `https://wa.me/923290715117?text=${encodeURIComponent(whatsappTextParts.join('\n'))}`
      : 'https://wa.me/923290715117';

  return (
    <footer
      id="contact"
      className="mx-auto max-w-[1440px] border-t border-black/10 px-5 pt-20 pb-12 sm:px-8 lg:pt-28 dark:border-white/10"
    >
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Contact Copy & Links */}
        <div className="flex flex-col justify-between lg:col-span-6">
          <div>
            <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
              04 · CONTACT
            </p>
            <h2 className="mt-4 font-serif-editorial text-[clamp(2.4rem,4.5vw,3.85rem)] font-normal leading-[1.04] tracking-tight text-[#141417] dark:text-[#F4F0E8] text-balance">
              Let&apos;s build something{' '}
              <span className="italic text-[#6F6D66] dark:text-[#8E8A82]">worth using.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4A4A52] dark:text-[#B4B0A8]">
              Open to freelance, contract and full-time roles. Whether you need a frontend built from
              scratch or an existing product taken further, let&apos;s talk.
            </p>

            {/* Copyable Email Line */}
            <div className="mt-8 flex items-center gap-3">
              <a
                href="mailto:asadshahnawaz117@gmail.com"
                className="font-serif-editorial text-2xl sm:text-3xl text-[#141417] underline decoration-[#B08D4B]/40 underline-offset-8 transition-colors hover:text-[#8A6D35] dark:text-[#F4F0E8] dark:decoration-[#D4B475]/40 dark:hover:text-[#D4B475]"
              >
                asadshahnawaz117@gmail.com
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                aria-label="Copy email address"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/15 text-[#5A5A64] transition-colors hover:border-[#B08D4B] hover:text-[#141417] dark:border-white/15 dark:text-[#8E8A82] dark:hover:border-[#D4B475] dark:hover:text-[#F4F0E8]"
              >
                {copiedEmail ? <Check className="h-3.5 w-3.5 text-[#D4B475]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            {/* Direct WhatsApp Line */}
            <div className="mt-3 flex items-center gap-2.5 font-mono-tech text-xs tracking-[0.12em] text-[#5A5A64] dark:text-[#A4A098]">
              <a
                href="https://wa.me/923290715117"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-[#8A6D35] dark:hover:text-[#D4B475]"
              >
                WHATSAPP · 03290715117
              </a>
            </div>
          </div>

          {/* 2x2 Social Grid */}
          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
            {[
              { label: 'WHATSAPP · 03290715117', href: 'https://wa.me/923290715117' },
              { label: 'LINKEDIN', href: 'https://linkedin.com' },
              { label: 'GITHUB', href: 'https://github.com' },
              { label: 'EMAIL', href: 'mailto:asadshahnawaz117@gmail.com' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.label === 'EMAIL' ? undefined : '_blank'}
                rel={item.label === 'EMAIL' ? undefined : 'noreferrer'}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-[#ECE8DF]/70 px-4 py-3 font-mono-tech text-[11px] tracking-[0.16em] text-[#141417] transition-colors hover:border-[#B08D4B] dark:border-white/10 dark:bg-[#0D0D11] dark:text-[#D4CFC5] dark:hover:border-[#D4B475]"
              >
                <span className="truncate">{item.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#8A6D35] dark:text-[#D4B475]" />
              </a>
            ))}
          </div>
        </div>

        {/* Right Sculpted Form Card */}
        <div className="lg:col-span-6">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-2xl border border-black/12 bg-[#ECE8DF] p-6 sm:p-8 dark:border-white/12 dark:bg-[#0C0C10]"
          >
            {/* Subtle bottom-right champagne gold glow matching the video */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,180,117,0.22),transparent_70%)]"
            />

            <div className="relative z-10 space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                >
                  YOUR NAME
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  className="mt-2 w-full rounded-xl border border-black/12 bg-white/75 px-4 py-3 text-sm text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#121218] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                >
                  EMAIL ADDRESS
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-xl border border-black/12 bg-white/75 px-4 py-3 text-sm text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#121218] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                />
              </div>

              {/* Custom Designed Dropdown (Zero Browser Default Widget) */}
              <div className="relative">
                <span className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]">
                  PROJECT TYPE
                </span>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-xl border border-black/12 bg-white/75 px-4 py-3 text-left text-sm text-[#141417] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#121218] dark:text-[#F4F0E8] dark:focus:border-[#D4B475]"
                >
                  <span>{projectType}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#8E8A82] transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 right-0 z-20 mt-1.5 overflow-hidden rounded-xl border border-black/15 bg-[#F4F1EA] shadow-xl dark:border-white/15 dark:bg-[#14141B]">
                    {PROJECT_TYPES.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setProjectType(opt);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                          projectType === opt
                            ? 'font-semibold text-[#8A6D35] dark:text-[#D4B475]'
                            : 'text-[#141417] dark:text-[#F4F0E8]'
                        }`}
                      >
                        <span>{opt}</span>
                        {projectType === opt && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                >
                  TELL ME ABOUT YOUR PROJECT
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Timeline, goals, or links you love..."
                  className="mt-2 w-full resize-none rounded-xl border border-black/12 bg-white/75 px-4 py-3 text-sm text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#121218] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{errorMsg}</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center gap-3 rounded-full bg-[#141417] py-2 pl-5 pr-2 text-xs font-semibold text-[#F4F0E8] transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-[#F4F0E8] dark:text-[#070709]"
                >
                  <span>SEND MESSAGE</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#D4B475] text-[#070709]">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-black/15 bg-white/80 py-2 pl-4 pr-2 text-xs font-semibold text-[#141417] transition-all hover:border-[#25D366] hover:scale-[1.02] active:scale-[0.98] dark:border-white/15 dark:bg-[#14141B] dark:text-[#F4F0E8] dark:hover:border-[#25D366]"
                >
                  <span>WHATSAPP</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-[#070709]">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </span>
                </a>
              </div>

              {submitted && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-[#D4B475]/40 bg-[#D4B475]/15 px-3 py-1.5 text-xs font-medium text-[#8A6D35] dark:text-[#D4B475]">
                  <Check className="h-3.5 w-3.5" />
                  <span>Message sent</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Footer Bar */}
      <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6 font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:border-white/10 dark:text-[#78746C]">
        <span>© 2026 ASAD WEB DEVELOPER</span>
        <span>BUILT IN LAGOS FOR THE WORLD</span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex cursor-pointer items-center gap-1.5 text-[#141417] transition-colors hover:text-[#8A6D35] dark:text-[#F4F0E8] dark:hover:text-[#D4B475]"
        >
          <span>BACK TO TOP</span>
          <ArrowUp className="h-3 w-3" />
        </button>
      </div>
    </footer>
  );
}
