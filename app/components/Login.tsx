"use client";

import { useState } from "react";
import Logo from "./Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse [animation-delay:4s]" />

      <div className="relative w-full max-w-md mx-4 animate-[fadeInUp_0.8s_ease-out]">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 border border-white/50 p-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center animate-[scaleIn_0.6s_ease-out]">
              <Logo className="w-32 h-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 animate-[fadeInUp_0.8s_ease-out_0.2s_both]">
              Welcome Back
            </h1>
            <p className="text-gray-500 animate-[fadeInUp_0.8s_ease-out_0.3s_both]">
              Sign in to your account to continue
            </p>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-5 animate-[fadeInUp_0.8s_ease-out_0.4s_both]"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 animate-[fadeInUp_0.8s_ease-out_0.5s_both]">
            Don&apos;t have an account?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
