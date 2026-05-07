export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-warm-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-3 font-body text-xs uppercase tracking-[0.08em] text-warm-400">
          or
        </span>
      </div>
    </div>
  );
}
