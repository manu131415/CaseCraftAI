import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-blue-600">Operations Center</p>
        <h2 className="text-xl font-semibold text-slate-900">Daily case overview</h2>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />
          <input
            className="w-40 border-none bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Search"
            aria-label="Search"
          />
        </label>

        <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100">
          <Bell className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-white">
          <UserCircle2 className="h-5 w-5" />
          Inspector Rao
        </div>
      </div>
    </header>
  );
}
