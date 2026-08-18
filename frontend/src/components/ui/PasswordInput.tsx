import type { InputHTMLAttributes } from "react";
import { useState} from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export default function PasswordInput({
  label,
  icon,
  error,
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-5">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        className={`flex items-center rounded-lg border bg-white px-3 ${
          error
            ? "border-red-500"
            : "border-gray-300 focus-within:border-black"
        }`}
      >
        {icon && (
          <span className="mr-3 text-gray-400">
            {icon}
          </span>
        )}

        <input
          type={showPassword ? "text" : "password"}
          className={`w-full py-3 outline-none ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-gray-500 transition hover:text-black"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}