import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB] p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 5v6c0 5 3.4 8.4 8 11 4.6-2.6 8-6 8-11V5l-8-3z"
              stroke="#EF4444"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 9.5l5 5m0-5l-5 5"
              stroke="#EF4444"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className="text-xl font-semibold text-ink mb-2">
          You don't have access to this page
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Your current role doesn't include this section. If this seems
          wrong, ask your administrator to update your role permissions.
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="w-full rounded-xl bg-accent text-white text-sm font-medium py-2.5 hover:bg-accent/90 transition-colors"
          >
            Back to dashboard
          </Link>
          <Link
            href="/login"
            className="w-full rounded-xl border border-gray-200 text-ink text-sm font-medium py-2.5 hover:bg-gray-50 transition-colors"
          >
            Sign in as a different role
          </Link>
        </div>
      </div>
    </div>
  );
}
