import { useState } from "react";
import { login } from "../api/auth.api.js";
import useAuth from "../hooks/useAuth";
import AuthLayout, { AuthAlert, AuthInput } from "./AuthLayout.jsx";
import { useNavigate } from "react-router";

const Login = () => {
  const { setAccessToken, setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await login({ email, password });
      setAccessToken(data.accessToken);
      setUser(data.data);
      navigate("/");
    } catch (err) {
      const details = err.response?.data?.errors;
      setError(
        err.response?.data?.message ||
          (Array.isArray(details)
            ? details.map((item) => item.msg).join(" ")
            : "") ||
          err.message ||
          "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      mode="login"
      title="Sign in to your account"
      subtitle="Pick up where you left off and find something you’ll love."
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-6">
        <AuthAlert>{error}</AuthAlert>
        <AuthInput
          id="email"
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2.5 text-sm text-[#66756e]">
            <input
              type="checkbox"
              className="size-4 rounded border-[#cbd5ce] accent-[#277766] focus:ring-[#277766]"
            />
            Remember me
          </label>
          <a
            href="#forgot-password"
            className="text-sm font-semibold text-[#277766] transition hover:text-[#193e37]"
          >
            Forgot password?
          </a>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#193e37] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#193e37]/15 transition hover:-translate-y-0.5 hover:bg-[#24564c] hover:shadow-xl hover:shadow-[#193e37]/20 focus:outline-none focus:ring-4 focus:ring-[#277766]/20 disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
          {!isSubmitting && (
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              <path
                d="M4 10h12m-5-5 5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
