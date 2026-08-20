import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, TrendingUp, Users, Sparkles, Shield } from "lucide-react";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Logo from "../components/ui/Logo";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "../utils/validation";

// ── Shared: animated orb ──────────────────────────────────────────────────────
function Orb({ size, style, delay = 0, color }: {
  size: number; style?: React.CSSProperties; delay?: number; color: string;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: "blur(72px)", ...style }}
      animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.65, 0.4] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Shared: dot-grid background ───────────────────────────────────────────────
function DotGrid({ id }: { id: string }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
      <defs>
        <pattern id={id} x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ── Shared: stat column ───────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>{value}</span>
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.48)" }}>{label}</span>
    </div>
  );
}

// ── Login feature list ────────────────────────────────────────────────────────
const FEATURES = [
  { Icon: CheckCircle, label: "Track every application in one place" },
  { Icon: TrendingUp,  label: "Rich analytics to sharpen your search" },
  { Icon: Sparkles,   label: "AI-powered insights and skill gaps" },
  { Icon: Users,      label: "Contact and follow-up management" },
];

export default function Login() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ee = validateEmail(email);
    const pe = validatePassword(password);
    if (ee) toast.error(ee);
    if (pe) toast.error(pe);
    if (ee || pe) return;

    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setAuth(res.user, res.token);
      toast.success(`Welcome back, ${res.user.firstName}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── LEFT BRAND PANEL ─────────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col justify-between flex-shrink-0 relative overflow-hidden"
        style={{
          width: 440,
          background: "linear-gradient(150deg, #08303f 0%, #0b597a 55%, #0d7494 100%)",
        }}
      >
        <Orb size={320} style={{ top: -80, left: -80 }}   delay={0} color="rgba(13,116,148,0.7)" />
        <Orb size={240} style={{ top: "42%", left: "28%" }} delay={3} color="rgba(240,169,78,0.16)" />
        <Orb size={180} style={{ bottom: -40, left: -40 }} delay={5} color="rgba(11,89,122,0.9)" />
        <DotGrid id="dlg" />

        <div className="relative z-10 flex flex-col gap-10 h-full px-10 py-12">
          {/* Logo */}
          <div>
            <Logo size="lg" withText mono />
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              The smart job-search companion<br />for ambitious professionals.
            </p>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3 flex-1 justify-center">
            {FEATURES.map(({ Icon, label }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.55)" }} strokeWidth={2} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.82)" }}>{label}</span>
              </motion.li>
            ))}
          </ul>

          {/* Stats */}
          <div>
            <div
              className="flex items-center justify-around py-4 rounded-xl mb-5"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <Stat value="10 k+" label="Jobs tracked" />
              <div className="w-px h-7" style={{ background: "rgba(255,255,255,0.12)" }} />
              <Stat value="4.9 / 5" label="User rating" />
              <div className="w-px h-7" style={{ background: "rgba(255,255,255,0.12)" }} />
              <Stat value="Free" label="Forever" />
            </div>
            <p className="text-[11px] text-center" style={{ color: "rgba(255,255,255,0.26)" }}>
              &copy; {new Date().getFullYear()} HireWire
            </p>
          </div>
        </div>
      </aside>

      {/* ── RIGHT FORM PANEL ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto relative">
        {/* Accent glow */}
        <div
          className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--surface-tint)) 0%, transparent 70%)", opacity: 0.35 }}
        />

        {/* Mobile logo */}
        <div className="flex flex-col items-center mb-8 lg:hidden">
          <Logo size="lg" withText />
          <p className="mt-1.5 text-xs text-muted-foreground text-center">The smart job-search companion.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back! Your job search is waiting!
            </p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl border border-border/50 p-7"
            style={{
              background: "hsl(var(--card))",
              boxShadow: "0 2px 4px hsl(var(--shadow-color)/0.04), 0 12px 32px -6px hsl(var(--shadow-color)/0.09)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Email address"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                validate={validateEmail}
                required
              />
              <FormField
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                validate={validatePassword}
                required
              />
              <Button type="submit" className="w-full" loading={loading} size="md">
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/50 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">
                Create one free
              </Link>
            </div>
          </div>

          {/* Trust line */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground opacity-65">
            <Shield className="w-3.5 h-3.5" />
            <span>Your data is encrypted and never shared.</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
