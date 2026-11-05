import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { getMe, register } from "../api/auth.api.js";
import useAuth from "../hooks/useAuth.js";
import AuthLayout, { AuthAlert, AuthInput } from "./AuthLayout.jsx";

const Register = () => {
  const location = useLocation();
  const initialRole = new URLSearchParams(location.search).get("role") === "seller" ? "seller" : "user";
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", role: initialRole });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords don’t match. Please check and try again.");
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await register(formData);
      const token = data.data?.accessToken;
      if (token) {
        const profile = await getMe(token);
        setAccessToken(token);
        setUser(profile.data);
        navigate("/");
      } else {
        setSuccess(data.message || "Your account has been created.");
      }
    } catch (err) {
      const details = err.response?.data?.errors;
      setError(err.response?.data?.message || (Array.isArray(details) ? details.map((item) => item.msg).join(" ") : "") || err.message || "Unable to create your account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <AuthLayout mode="register" title="Create your account" subtitle="Join a community that values thoughtful finds and independent makers.">
    <form onSubmit={handleRegister} className="flex flex-col gap-6">
      <AuthAlert>{error}</AuthAlert>
      {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">{success}</p>}
      <AuthInput id="name" label="Your name" value={formData.name} onChange={handleChange} placeholder="Jordan Lee" autoComplete="name" />
      <div className="space-y-2"><label htmlFor="role" className="block text-sm font-semibold text-[#253b36]">Account type</label><select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-4 py-3.5 text-[15px] text-[#193e37] outline-none transition focus:border-[#277766] focus:bg-white focus:ring-4 focus:ring-[#277766]/10"><option value="user">Shopper</option><option value="seller">Seller</option></select></div>
      <AuthInput id="email" label="Email address" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
      <AuthInput id="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" />
      <AuthInput id="confirmPassword" label="Confirm password" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Enter your password again" autoComplete="new-password" />
      <button type="submit" disabled={isSubmitting} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#193e37] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#193e37]/15 transition hover:-translate-y-0.5 hover:bg-[#24564c] hover:shadow-xl hover:shadow-[#193e37]/20 focus:outline-none focus:ring-4 focus:ring-[#277766]/20 disabled:cursor-wait disabled:opacity-70">
        {isSubmitting ? "Creating your account…" : "Create account"}
        {!isSubmitting && <svg viewBox="0 0 20 20" fill="none" className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
    </form>
  </AuthLayout>;
};

export default Register;
