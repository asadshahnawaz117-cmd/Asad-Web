import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Plus,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { FracturedPlatesCanvas } from './FracturedPlatesCanvas';

interface LoginPageProps {
  isDark: boolean;
  onBackToPortfolio: () => void;
}

interface WorkspaceProject {
  id: string;
  name: string;
  phase: string;
  progress: number;
  stagingUrl: string;
  invoiceStatus: string;
}

interface TodoRow {
  id: number | string;
  name?: string;
  title?: string;
}

const CLIENT_SPRINT_PROJECTS: WorkspaceProject[] = [
  {
    id: 'ws-1',
    name: 'NURIGHT Beauty Parlour v2',
    phase: '3D Storefront & Paystack Checkout',
    progress: 88,
    stagingUrl: 'https://staging.nurightparlour.example.com',
    invoiceStatus: 'Milestone 2 · Paid',
  },
  {
    id: 'ws-2',
    name: 'Cogito AI Banking Cockpit',
    phase: 'GLSL Card Shaders & Auth Flow',
    progress: 64,
    stagingUrl: 'https://staging.cogitobank.example.com',
    invoiceStatus: 'Milestone 1 · Cleared',
  },
];

export function LoginPage({ isDark, onBackToPortfolio }: LoginPageProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [signedInUser, setSignedInUser] = useState<{
    name: string;
    email: string;
    isDemo?: boolean;
  } | null>(null);

  // Live Supabase `todos` table integration
  const [todos, setTodos] = useState<TodoRow[]>([]);
  const [todosSupported, setTodosSupported] = useState<boolean>(false);
  const [newTodoName, setNewTodoName] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);

  // Sync existing Supabase session & auth state listener
  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const user = data.session?.user;
      if (user) {
        const display =
          (user.user_metadata?.full_name as string) ||
          user.email?.split('@')[0] ||
          'Studio Client';
        setSignedInUser({ name: display, email: user.email || '' });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const display =
          (session.user.user_metadata?.full_name as string) ||
          session.user.email?.split('@')[0] ||
          'Studio Client';
        setSignedInUser({ name: display, email: session.user.email || '' });
      } else if (event === 'SIGNED_OUT') {
        setSignedInUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Load `todos` from Supabase when workspace is active
  useEffect(() => {
    if (!signedInUser) return;
    let active = true;
    supabase
      .from('todos')
      .select('*')
      .limit(12)
      .then(
        ({ data, error }) => {
          if (!active) return;
          if (!error && Array.isArray(data)) {
            setTodosSupported(true);
            setTodos(data as TodoRow[]);
          }
        },
        () => undefined
      );
    return () => {
      active = false;
    };
  }, [signedInUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || (authMode === 'register' && !fullName.trim())) {
      setErrorMsg('Please complete all required credentials.');
      return;
    }

    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (authMode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          setErrorMsg(error.message);
        } else if (data.user) {
          const display =
            (data.user.user_metadata?.full_name as string) ||
            data.user.email?.split('@')[0] ||
            'Studio Client';
          setSignedInUser({ name: display, email: data.user.email || email.trim() });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              workspace_code: workspaceCode.trim() || null,
            },
          },
        });
        if (error) {
          setErrorMsg(error.message);
        } else if (data.session && data.user) {
          setSignedInUser({ name: fullName.trim(), email: data.user.email || email.trim() });
        } else if (data.user) {
          setInfoMsg(
            `Account created for ${email.trim()}. Check your inbox to confirm your email before signing in.`
          );
        }
      }
    } catch {
      setErrorMsg('Unable to reach authentication service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setErrorMsg('');
    setInfoMsg('');
    setSignedInUser({
      name: 'Nuright Studio',
      email: 'client@nurightparlour.com',
      isDemo: true,
    });
  };

  const handleResetRequest = async () => {
    if (!email.trim()) {
      setErrorMsg('Enter your email address first to send a reset link.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/#login`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setResetSent(true);
        setTimeout(() => {
          setResetSent(false);
          setForgotOpen(false);
        }, 3500);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut().catch(() => undefined);
    setSignedInUser(null);
    setTodos([]);
  };

  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoName.trim() || addingTodo) return;
    setAddingTodo(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({ name: newTodoName.trim() })
        .select()
        .single();
      if (!error && data) {
        setTodos((prev) => [...prev, data as TodoRow]);
        setNewTodoName('');
      }
    } finally {
      setAddingTodo(false);
    }
  };

  return (
    <main className="relative mx-auto max-w-[1440px] px-4 pt-4 pb-12 sm:px-8 sm:pt-6">
      <div className="relative overflow-hidden rounded-[26px] border border-black/10 bg-[#ECE8DF] dark:border-white/10 dark:bg-[#09090C] min-h-[calc(100vh-7.5rem)] flex flex-col justify-between">
        {/* 3D Fractured Obsidian Plates Backdrop */}
        <FracturedPlatesCanvas ambientFracture={true} isDark={isDark} />

        {/* Subtle Directional Champagne Gold Ambient Rim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_52%,rgba(212,180,117,0.14),transparent_55%)]"
        />

        {/* Top Return Bar */}
        <div className="relative z-10 flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/10 sm:px-12">
          <button
            type="button"
            onClick={onBackToPortfolio}
            className="inline-flex cursor-pointer items-center gap-2 font-mono-tech text-[11px] tracking-[0.16em] text-[#5A5A64] transition-colors hover:text-[#141417] dark:text-[#A1A1AA] dark:hover:text-[#F4F0E8]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>BACK TO PORTFOLIO</span>
          </button>

          <span className="font-mono-tech text-[10px] tracking-[0.18em] text-[#8A6D35] dark:text-[#D4B475]">
            CLIENT PORTAL · ACCESS
          </span>
        </div>

        {/* Main Content */}
        {!signedInUser ? (
          <div className="relative z-10 grid flex-1 grid-cols-1 items-center gap-12 px-6 py-10 sm:px-12 lg:grid-cols-12 lg:px-14">
            {/* Left Editorial Welcome */}
            <div className="lg:col-span-6">
              <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
                ASAD WEB DEVELOPER · STUDIO GATEWAY
              </p>

              <h1 className="mt-4 font-serif-editorial text-[clamp(2.6rem,5vw,4.4rem)] font-normal leading-[0.98] tracking-tight text-[#141417] dark:text-[#F4F0E8] text-balance">
                Step back{' '}
                <span className="italic text-[#6F6D66] dark:text-[#D4B475]">inside.</span>
              </h1>

              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4A4A52] dark:text-[#B4B0A8]">
                Sign in to inspect active 3D builds, test live WebGL staging links, approve sprint
                milestones, and manage Paystack invoice rails in one focused workspace.
              </p>

              <div className="mt-10 grid max-w-md grid-cols-2 gap-6 border-t border-black/10 pt-6 dark:border-white/10">
                <div>
                  <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
                    SESSION AUTH
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-[#141417] dark:text-[#F4F0E8]">
                    Supabase · Encrypted
                  </p>
                </div>
                <div>
                  <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#78746C]">
                    STUDIO HOURS
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-[#141417] dark:text-[#F4F0E8]">
                    Worldwide · Remote
                  </p>
                </div>
              </div>
            </div>

            {/* Right Auth Card matching Contact Card Aesthetic */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <form
                onSubmit={handleSubmit}
                className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-black/12 bg-[#F4F1EA]/95 p-6 sm:p-8 shadow-2xl dark:border-white/15 dark:bg-[#0D0D12]/95"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,180,117,0.22),transparent_70%)]"
                />

                <div className="relative z-10">
                  {/* Segmented Mode Switch */}
                  <div className="flex rounded-xl border border-black/10 bg-black/[0.04] p-1 dark:border-white/10 dark:bg-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setErrorMsg('');
                        setInfoMsg('');
                      }}
                      className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition-colors ${
                        authMode === 'signin'
                          ? 'bg-[#141417] text-[#F4F0E8] dark:bg-[#F4F0E8] dark:text-[#070709]'
                          : 'text-[#5A5A64] hover:text-[#141417] dark:text-[#A1A1AA] dark:hover:text-[#F4F0E8]'
                      }`}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg('');
                        setInfoMsg('');
                      }}
                      className={`flex-1 cursor-pointer rounded-lg py-2 text-xs font-semibold transition-colors ${
                        authMode === 'register'
                          ? 'bg-[#141417] text-[#F4F0E8] dark:bg-[#F4F0E8] dark:text-[#070709]'
                          : 'text-[#5A5A64] hover:text-[#141417] dark:text-[#A1A1AA] dark:hover:text-[#F4F0E8]'
                      }`}
                    >
                      Request access
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {authMode === 'register' && (
                      <div>
                        <label
                          htmlFor="login-name"
                          className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                        >
                          FULL NAME OR STUDIO
                        </label>
                        <input
                          id="login-name"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Asad Shahnawaz"
                          className="mt-2 w-full rounded-xl border border-black/12 bg-white/80 px-4 py-3 text-sm text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#14141B] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                        />
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="login-email"
                        className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                      >
                        EMAIL ADDRESS
                      </label>
                      <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@studio.com"
                        className="mt-2 w-full rounded-xl border border-black/12 bg-white/80 px-4 py-3 text-sm text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#14141B] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="login-password"
                          className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                        >
                          PASSWORD
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotOpen((f) => !f)}
                          className="cursor-pointer font-mono-tech text-[10px] tracking-[0.12em] text-[#8A6D35] hover:underline dark:text-[#D4B475]"
                        >
                          FORGOT KEY?
                        </button>
                      </div>
                      <div className="relative mt-2">
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full rounded-xl border border-black/12 bg-white/80 py-3 pl-4 pr-11 text-sm text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#14141B] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-[#71717A] hover:text-[#141417] dark:text-[#8E8A82] dark:hover:text-[#F4F0E8]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div>
                        <label
                          htmlFor="login-code"
                          className="block font-mono-tech text-[10px] tracking-[0.18em] text-[#71717A] dark:text-[#8E8A82]"
                        >
                          PROJECT INVITE CODE (OPTIONAL)
                        </label>
                        <input
                          id="login-code"
                          type="text"
                          value={workspaceCode}
                          onChange={(e) => setWorkspaceCode(e.target.value)}
                          placeholder="AW-2026-STUDIO"
                          className="mt-2 w-full rounded-xl border border-black/12 bg-white/80 px-4 py-3 font-mono-tech text-xs text-[#141417] placeholder:text-[#9CA3AF] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#14141B] dark:text-[#F4F0E8] dark:placeholder:text-[#52525B] dark:focus:border-[#D4B475]"
                        />
                      </div>
                    )}

                    {forgotOpen && (
                      <div className="rounded-xl border border-[#D4B475]/30 bg-[#D4B475]/10 p-3 text-xs text-[#141417] dark:text-[#F4F0E8]">
                        {resetSent ? (
                          <span className="inline-flex items-center gap-2 text-[#8A6D35] dark:text-[#D4B475]">
                            <Check className="h-3.5 w-3.5" />
                            Recovery link dispatched to {email}.
                          </span>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span>Send magic recovery link to your email?</span>
                            <button
                              type="button"
                              onClick={handleResetRequest}
                              className="cursor-pointer font-mono-tech text-[10px] font-semibold text-[#8A6D35] underline dark:text-[#D4B475]"
                            >
                              SEND LINK
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remember Device Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setRememberDevice((r) => !r)}
                        className="inline-flex cursor-pointer items-center gap-2.5 text-xs text-[#4A4A52] dark:text-[#A1A1AA]"
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                            rememberDevice
                              ? 'border-[#D4B475] bg-[#D4B475] text-[#070709]'
                              : 'border-black/25 dark:border-white/25'
                          }`}
                        >
                          {rememberDevice && <Check className="h-3 w-3" />}
                        </span>
                        <span>Keep session active on this device</span>
                      </button>
                    </div>

                    {errorMsg && (
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        {errorMsg}
                      </p>
                    )}

                    {infoMsg && (
                      <p className="text-xs font-medium text-[#8A6D35] dark:text-[#D4B475]">
                        {infoMsg}
                      </p>
                    )}

                    {/* Primary Submit Button */}
                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full cursor-pointer items-center justify-between rounded-full bg-[#141417] py-2 pl-6 pr-2 text-xs font-semibold text-[#F4F0E8] transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 dark:bg-[#F4F0E8] dark:text-[#070709]"
                      >
                        <span>
                          {loading
                            ? 'AUTHENTICATING...'
                            : authMode === 'signin'
                              ? 'SIGN IN TO PORTAL'
                              : 'CREATE CLIENT ACCOUNT'}
                        </span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4B475] text-[#070709]">
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ArrowRight className="h-4 w-4" />
                          )}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDemoAccess}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-black/15 py-2.5 text-xs font-medium text-[#141417] transition-colors hover:border-[#B08D4B] hover:text-[#8A6D35] dark:border-white/15 dark:text-[#D4CFC5] dark:hover:border-[#D4B475] dark:hover:text-[#D4B475]"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Enter Demo Client Workspace</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Client Workspace View inside the exact same Obsidian & Gold aesthetic */
          <div className="relative z-10 flex flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-14">
            <div className="flex flex-wrap items-end justify-between gap-6 border-b border-black/10 pb-6 dark:border-white/10">
              <div>
                <p className="font-mono-tech text-[11px] tracking-[0.2em] text-[#8A6D35] dark:text-[#D4B475]">
                  ACTIVE WORKSPACE · {signedInUser.email.toUpperCase()}
                </p>
                <h2 className="mt-2 font-serif-editorial text-4xl sm:text-5xl font-normal text-[#141417] dark:text-[#F4F0E8]">
                  Welcome back, <span className="italic">{signedInUser.name}.</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/15 px-4 py-2 text-xs font-medium text-[#141417] transition-colors hover:border-rose-500/60 dark:border-white/15 dark:text-[#F4F0E8]"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {CLIENT_SPRINT_PROJECTS.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-black/10 bg-[#F4F1EA]/90 p-6 dark:border-white/12 dark:bg-[#0D0D12]/90"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono-tech text-[10px] tracking-[0.16em] text-[#8A6D35] dark:text-[#D4B475]">
                        {item.invoiceStatus}
                      </p>
                      <h3 className="mt-1.5 font-serif-editorial text-2xl text-[#141417] dark:text-[#F4F0E8]">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#5A5A64] dark:text-[#A1A1AA]">{item.phase}</p>
                    </div>
                    <span className="font-mono-tech text-lg font-semibold tabular-nums text-[#141417] dark:text-[#F4F0E8]">
                      {item.progress}%
                    </span>
                  </div>

                  <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      style={{ width: `${item.progress}%` }}
                      className="h-full rounded-full bg-[#D4B475]"
                    />
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
                    <a
                      href={item.stagingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 font-mono-tech text-[11px] tracking-[0.12em] text-[#141417] hover:text-[#8A6D35] dark:text-[#F4F0E8] dark:hover:text-[#D4B475]"
                    >
                      <span>OPEN STAGING BUILD</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={onBackToPortfolio}
                      className="cursor-pointer font-mono-tech text-[10px] tracking-[0.14em] text-[#71717A] hover:text-[#141417] dark:text-[#8E8A82] dark:hover:text-[#F4F0E8]"
                    >
                      VIEW GALLERY
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Supabase `todos` Sprint Tasks Card (appears when `todos` table is readable) */}
            {todosSupported && (
              <div className="mt-6 rounded-2xl border border-black/10 bg-[#F4F1EA]/90 p-6 dark:border-white/12 dark:bg-[#0D0D12]/90">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#8A6D35] dark:text-[#D4B475]">
                      SUPABASE · SPRINT DELIVERABLES
                    </p>
                    <h3 className="mt-1 font-serif-editorial text-2xl text-[#141417] dark:text-[#F4F0E8]">
                      Active Tasks ({todos.length})
                    </h3>
                  </div>

                  <form onSubmit={handleAddTodo} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTodoName}
                      onChange={(e) => setNewTodoName(e.target.value)}
                      placeholder="Add deliverable..."
                      className="rounded-xl border border-black/12 bg-white/80 px-3.5 py-2 text-xs text-[#141417] focus:border-[#B08D4B] focus:outline-none dark:border-white/12 dark:bg-[#14141B] dark:text-[#F4F0E8]"
                    />
                    <button
                      type="submit"
                      disabled={addingTodo}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-[#D4B475] px-3 py-2 text-xs font-semibold text-[#070709]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </form>
                </div>

                {todos.length === 0 ? (
                  <p className="mt-4 text-xs text-[#71717A] dark:text-[#8E8A82]">
                    No items in your `todos` table yet.
                  </p>
                ) : (
                  <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {todos.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex items-center gap-2.5 rounded-lg border border-black/10 px-3.5 py-2.5 text-sm text-[#141417] dark:border-white/10 dark:text-[#F4F0E8]"
                      >
                        <Check className="h-3.5 w-3.5 text-[#D4B475]" />
                        <span>{todo.name || todo.title || `Task #${todo.id}`}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Architectural Footer */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 px-6 py-4 font-mono-tech text-[10px] tracking-[0.18em] text-[#5A5A64] dark:border-white/10 dark:text-[#8E8A82] sm:px-12">
          <span>© 2026 ASAD WEB DEVELOPER</span>
          <span>LAGOS · 6.52° N, 3.38° E</span>
        </div>
      </div>
    </main>
  );
}
