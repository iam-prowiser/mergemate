import { GitBranch } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-900"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f6feb] text-white">
              <GitBranch size={17} />
            </div>
          <span>MergeMate</span>
        </Link>

        <Link
          to="/"
          className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          Back to home
        </Link>
      </div>
    </nav>
  );
}