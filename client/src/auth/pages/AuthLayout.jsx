import { Link } from "react-router";

function Brand({ light = false }) {
  return <Link to="/" aria-label="Morrow and Made home" className={`inline-flex items-center gap-3 font-semibold tracking-tight ${light ? "text-white" : "text-[#193e37]"}`}>
    <span className="grid size-10 place-items-center rounded-2xl bg-[#193e37] shadow-sm shadow-[#193e37]/20">
      <svg viewBox="0 0 40 40" fill="none" className="size-7" aria-hidden="true">
        <path d="M7 28V13.5c0-1.7 2.1-2.4 3.1-1l8.4 11.2c.7.9 2.1.9 2.8 0l8.4-11.2c1-1.4 3.1-.7 3.1 1V28" stroke="#E5B77E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 29.5h14" stroke="#F4F3ED" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="32.5" cy="8" r="2" fill="#D89A55" />
      </svg>
    </span>
    <span className="text-lg">Morrow <span className={light ? "font-normal text-[#e5b77e]" : "font-normal text-[#b87535]"}>&amp; Made</span></span>
  </Link>;
}

export function AuthInput({ id, label, type = "text", value, onChange, placeholder, autoComplete, required = true }) {
  return <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-[#253b36]">{label}</label>
    <input
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      className="w-full rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-4 py-3.5 text-[15px] text-[#193e37] outline-none transition placeholder:text-[#a0aaa4] hover:border-[#c6d1c9] focus:border-[#277766] focus:bg-white focus:ring-4 focus:ring-[#277766]/10"
    />
  </div>;
}

export function AuthAlert({ children }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800">{children}</p>;
}

export default function AuthLayout({ mode, title, subtitle, children }) {
  const registering = mode === "register";
  return <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f3ed] px-4 py-8 sm:px-8">
    <div aria-hidden="true" className="absolute -left-28 top-12 -z-10 size-80 rounded-full bg-[#e3c59f]/35 blur-3xl" />
    <div aria-hidden="true" className="absolute -bottom-36 -right-20 -z-10 size-96 rounded-full bg-[#b8d1c0]/45 blur-3xl" />

    <div className="grid w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_90px_-38px_rgba(27,57,49,0.3)] lg:min-h-[680px] lg:grid-cols-[1.02fr_0.98fr]">
      <section className="relative hidden overflow-hidden bg-[#193e37] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div aria-hidden="true" className="absolute -right-32 -top-28 size-96 rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-44 -left-24 size-[30rem] rounded-full border border-white/10" />
        <div className="relative"><Brand light /></div>
        <div className="relative max-w-lg py-12">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#e7c89f]">
            <span className="size-1.5 rounded-full bg-[#e2a75f]" /> Made for thoughtful finds
          </span>
          <h2 className="text-5xl font-semibold leading-[1.08] tracking-[-0.04em] xl:text-[3.6rem]">Good things, from good people.</h2>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70">A considered marketplace for independent makers, small shops, and the pieces you’ll keep close.</p>

          <div className="mt-11 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-[#d89a55] text-[#193e37]">
                <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="m4.5 8.7 7.5 4.4 7.5-4.4M12 13v6.5M8 6.2l8 4.6" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
              </div>
              <div><p className="font-semibold">A little more personal</p><p className="mt-0.5 text-sm text-white/60">Discover independent sellers and their craft.</p></div>
            </div>
          </div>
        </div>
        <p className="relative text-xs text-white/45">Thoughtfully found. Made to be kept.</p>
      </section>

      <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#b87535]">{registering ? "Join the marketplace" : "Welcome back"}</p>
            <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#193e37] sm:text-[2.15rem]">{title}</h1>
            <p className="mt-3 text-[15px] leading-6 text-[#718079]">{subtitle}</p>
          </div>
          {children}
          <p className="mt-8 text-center text-sm text-[#78847e]">
            {registering ? "Already have an account?" : "New to Morrow & Made?"}{" "}
            <Link to={registering ? "/login" : "/register"} className="font-semibold text-[#277766] underline decoration-[#277766]/30 underline-offset-4 transition hover:text-[#193e37] hover:decoration-[#193e37]">
              {registering ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <p className="mt-10 text-center text-xs text-[#a0aaa4]">By continuing, you agree to our <a href="#terms" className="underline underline-offset-2 hover:text-[#62736a]">Terms</a> and <a href="#privacy" className="underline underline-offset-2 hover:text-[#62736a]">Privacy Policy</a>.</p>
        </div>
      </section>
    </div>
  </main>;
}
