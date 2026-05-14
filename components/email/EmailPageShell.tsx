export function EmailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-warm-200 bg-white px-6 py-8 font-body shadow-sm sm:px-8">
      {children}
    </div>
  );
}
