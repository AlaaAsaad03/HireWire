import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Star } from "lucide-react";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import Logo from "../components/ui/Logo";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";
import { validateEmail, validatePassword, validateName } from "../utils/validation";

// ── Animated orb ──────────────────────────────────────────────────────────────
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

// ── Dot-grid background ───────────────────────────────────────────────────────
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

// ── Stat column ───────────────────────────────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold" style={{ color: "rgba(255,255,255,0.92)" }}>{value}</span>
      <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.48)" }}>{label}</span>
    </div>
  );
}

// ── How-it-works steps ────────────────────────────────────────────────────────
const STEPS = [
  { n: "1", label: "Create your free account" },
  { n: "2", label: "Add your job applications" },
  { n: "3", label: "Track, follow up, and land offers" },
];

export default function Register() {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [loading,  setLoading]  = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = [
      validateName(formData.firstName),
      validateName(formData.lastName),
      validateEmail(formData.email),
      validatePassword(formData.password),
    ];
    errs.forEach((err) => err && toast.error(err));
    if (errs.some(Boolean)) return;

    setLoading(true);
    try {
      const res = await authApi.register(formData);
      setAuth(res.user, res.token);
      toast.success(`Welcome to HireWire, ${res.user.firstName}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed. Please try again.");
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
        <Orb size={300} style={{ top: -60, left: -60 }}    delay={0} color="rgba(13,116,148,0.7)" />
        <Orb size={200} style={{ top: "50%", left: "32%" }} delay={2} color="rgba(240,169,78,0.16)" />
        <Orb size={160} style={{ bottom: -30, left: -30 }} delay={5} color="rgba(11,89,122,0.9)" />
        <DotGrid id="drg" />

        <div className="relative z-10 flex flex-col gap-10 h-full px-10 py-12">
          {/* Logo */}
          <div>
            <Logo size="lg" withText mono />
            {/* <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Your career command centre —<br />built for serious job seekers.
            </p> */}
          </div>

          {/* How it works */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
              How it works
            </p>
            <div className="flex flex-col gap-3">
              {STEPS.map(({ n, label }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.12 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                    style={{ background: "rgba(255,255,255,0.13)", color: "rgba(255,255,255,0.88)" }}
                  >
                    {n}
                  </div>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.78)" }}>{label}</span>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            <div
              className="mt-7 px-5 py-4 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <p className="text-sm italic leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
                "HireWire transformed how I manage my job search. I landed my dream role in 6 weeks."
              </p>
              <div className="flex items-center gap-2.5 mt-3">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.88)" }}
                >
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>Sarah K.</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.42)" }}>Software Engineer · Google</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

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
          {/* <p className="mt-1.5 text-xs text-muted-foreground text-center">Your career command centre.</p> */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Badge + heading */}
          <div className="mb-7">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: "hsl(var(--brand-soft))", color: "hsl(var(--accent-foreground))" }}
            >
              Free forever — no card needed
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Join professionals already tracking smarter.
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
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="First Name"
                  name="firstName"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  validate={validateName}
                  required
                />
                <FormField
                  label="Last Name"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  validate={validateName}
                  required
                />
              </div>
              <FormField
                label="Email address"
                type="email"
                name="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                validate={validateEmail}
                required
              />
              <FormField
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                validate={validatePassword}
                hint="Minimum 6 characters"
                required
              />
              <Button type="submit" className="w-full" loading={loading} size="md">
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border/50 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline underline-offset-4">
                Sign in
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
