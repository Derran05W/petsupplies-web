import { AdminSettingsNav } from '@/components/admin/settings/AdminSettingsNav';

export default function AdminSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSettingsNav />
      {children}
    </>
  );
}
