import type { Metadata } from 'next';
import { brand } from '@/lib/config/brand';

export const metadata: Metadata = {
  title: `Admin · Fulfillment · ${brand.name}`,
};

export default function AdminFulfillmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
