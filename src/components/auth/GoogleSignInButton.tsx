"use client";

import React, { useState } from "react";
import { signInWithGoogle } from "@/lib/firebase";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface GoogleSignInButtonProps {
  text?: string;
  redirectTo?: string;
  className?: string;
}

export default function GoogleSignInButton({
  text = "Continue with Google",
  redirectTo = "/",
  className = "",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { success, error } = useToast();
  const { loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorDetails(null);
      const res = await signInWithGoogle();
      if (!res.success || !res.user) {
        const errorMsg = res.error || "Google sign-in was cancelled or failed";
        error(errorMsg);
        setErrorDetails(errorMsg);
        setLoading(false);
        return;
      }

      // Sync with our application auth state if method is available
      if (loginWithGoogle) {
        const syncRes = await loginWithGoogle(res.user);
        if (!syncRes.success) {
          const syncErr = syncRes.error || "Failed to synchronize user session";
          error(syncErr);
          setErrorDetails(syncErr);
          setLoading(false);
          return;
        }
      }

      success(`Welcome, ${res.user.displayName || "User"}!`);
      router.push(redirectTo);
    } catch (err: any) {
      const errMsg = err.message || "An error occurred during Google sign-in";
      error(errMsg);
      setErrorDetails(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-3 text-xs sm:text-sm shadow-sm active:scale-95 transition-all disabled:opacity-60 ${className}`}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span>{loading ? "Signing in..." : text}</span>
      </button>

      {errorDetails && (
        <div className="text-[11px] text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1.5 leading-relaxed">
          <div className="font-semibold flex items-center gap-1.5 text-amber-800">
            <span>⚠️</span>
            <span>Google Sign-In Domain Setup Required</span>
          </div>
          <p className="text-slate-600">{errorDetails}</p>
          <div className="pt-1">
            <a
              href="https://console.firebase.google.com/project/my-ecommerce-e8ba0/authentication/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100/80 hover:bg-orange-200/80 px-2.5 py-1 rounded-lg transition-colors underline"
            >
              Open Firebase Settings ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
