"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROLES, Role } from "@/lib/auth";
import { useLanguage } from "@/app/providers/LanguageProvider";

const CODE_PLACEHOLDER: Record<Role, string> = {
  IO: "e.g. IO3420",
  SHO: "e.g. SHO1042",
  LEGAL_ADVISOR: "e.g. LA0087",
};

const ROLE_HOME: Record<Role, string> = {
  IO: "/dashboard/io",
  SHO: "/dashboard/sho",
  LEGAL_ADVISOR: "/dashboard/legal",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<Role>("IO");
  const nextPath = searchParams.get("next") || ROLE_HOME[role];
  const [policeCode, setPoliceCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          police_code: policeCode.trim().toUpperCase(),
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("login.errorGeneric"));
        setLoading(false);
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch {
      setError(t("login.errorConnection"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-[44%] relative bg-[#0B0F1D] flex-col justify-between p-12 overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 20% 15%, #2E3A8C 0%, transparent 45%), radial-gradient(circle at 85% 90%, #1B2450 0%, transparent 50%), #0B0F1D",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3B5BFF]/20 border border-[#3B5BFF]/40 flex items-center justify-center">
            <ShieldIcon />
          </div>
          <div>
            <p className="text-white font-semibold leading-tight">CaseCraftAI</p>
            <p className="text-white/50 text-xs leading-tight">{t("caseOperationsHub")}</p>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <p className="text-[13px] tracking-wide text-[#7C8CFF] font-medium mb-3">
            {t("operationsCenter")}
          </p>
          <h1 className="text-3xl font-semibold text-white leading-snug mb-4">
            {t("login.heroTitle")}
          </h1>
          <p className="text-white/60 text-sm leading-relaxed">
            {t("login.heroSubtitle")}
          </p>
        </div>

        <div className="relative z-10 rounded-2xl bg-white/5 border border-white/10 p-4">
          <p className="text-white text-sm font-medium mb-1">
            {t("secureByDesign")}
          </p>
          <p className="text-white/50 text-xs leading-relaxed">
            {t("secureDescription")}
          </p>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F4F6FB]">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#0B0F1D] flex items-center justify-center">
              <ShieldIcon small />
            </div>
            <span className="font-semibold">CaseCraftAI</span>
          </div>

          <h2 className="text-2xl font-semibold text-[#0B0F1D] mb-1">{t("login.signIn")}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {t("login.subtitle")}
          </p>

          {/* Role tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 rounded-xl bg-gray-100">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  role === r.value
                    ? "bg-white text-[#0B0F1D] shadow-md"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 -mt-4 mb-6">
            {t("login.signingInAs")} {ROLES.find((r) => r.value === role)?.blurb}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#0B0F1D] mb-1.5">
                {t("login.signingInAs")}
              </label>
              <input
                type="text"
                required
                value={policeCode}
                onChange={(e) => setPoliceCode(e.target.value)}
                placeholder={CODE_PLACEHOLDER[role]}
                autoCapitalize="characters"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm uppercase tracking-wide outline-none focus:border-[#3B5BFF] focus:ring-2 focus:ring-[#3B5BFF]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0B0F1D] mb-1.5">
                {t("login.password")}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#3B5BFF] focus:ring-2 focus:ring-[#3B5BFF]/20"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl text-white text-sm font-medium py-2.5 transition-colors disabled:opacity-60"
              style={{ backgroundColor: "#3B5BFF" }}
            >
              {loading ? t("login.signingIn") : t("login.signIn")}
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-6 text-center">
            {t("login.footer")}
          </p>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon({ small }: { small?: boolean }) {
  const size = small ? 16 : 18;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3z"
        stroke="#7C8CFF"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="#7C8CFF"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}