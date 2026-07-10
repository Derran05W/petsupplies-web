import { SettingsForm } from '@/components/account/settings/SettingsForm';

interface ProfileSectionProps {
  initialName: string;
  initialEmail: string;
}

export function ProfileSection({
  initialName,
  initialEmail,
}: ProfileSectionProps) {
  return (
    <section
      id="profile"
      aria-labelledby="profile-heading"
      className="flex scroll-mt-24 flex-col gap-8"
    >
      <div>
        <h2
          id="profile-heading"
          className="mb-1 font-display text-2xl tracking-[-0.01em] text-ink"
        >
          Profile
        </h2>
        <p className="font-body text-sm text-ink-secondary">
          Your name and email appear on orders and receipts.
        </p>
      </div>
      <SettingsForm initialName={initialName} initialEmail={initialEmail} />
    </section>
  );
}
