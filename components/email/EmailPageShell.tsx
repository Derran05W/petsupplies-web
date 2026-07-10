export function EmailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-card border border-line bg-panel px-6 py-8 font-body sm:px-8">
      {children}
    </div>
  );
}
