export function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-line" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-paper px-3 font-body text-micro uppercase text-ink-faint">
          or
        </span>
      </div>
    </div>
  );
}
