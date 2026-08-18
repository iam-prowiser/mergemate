interface DividerProps {
  text?: string;
}

export default function Divider({
  text = "or",
}: DividerProps) {
  return (
    <div className="my-6 flex items-center">
      <div className="h-px flex-1 bg-gray-300" />

      <span className="mx-4 text-sm text-gray-500">
        {text}
      </span>

      <div className="h-px flex-1 bg-gray-300" />
    </div>
  );
}