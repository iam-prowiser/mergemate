import type { InputHTMLAttributes} from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export default function Input({
  label,
  icon,
  error,
  className = "",
  ...props
}: InputProps) {
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
          className={`w-full py-3 outline-none ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}