import { type Metadata } from 'next';
import { SuccessContents } from '@/components/checkout/SuccessContents';

export const metadata: Metadata = {
  title: 'Order confirmed',
  description: 'Thank you for your order.',
};

interface SuccessPageProps {
  searchParams: { session_id?: string | string[] };
}

function readSessionId(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value) && value.length > 0 && value[0]) return value[0];
  return null;
}

export default function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const sessionId = readSessionId(searchParams.session_id);

  return (
    <section className="px-6 pb-20 pt-12 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <SuccessContents sessionId={sessionId} />
      </div>
    </section>
  );
}
