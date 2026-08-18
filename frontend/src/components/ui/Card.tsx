import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-10 shadow-xl shadow-black/5">
      {children}
    </div>
  );
}