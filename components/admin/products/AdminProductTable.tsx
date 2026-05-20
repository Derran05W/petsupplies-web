import type { AdminProduct } from '@/types/admin';
import { AdminProductRow } from './AdminProductRow';

interface AdminProductTableProps {
  products: AdminProduct[];
}

export function AdminProductTable({ products }: AdminProductTableProps) {
  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-warm-200 bg-surface-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Admin products list</caption>
          <thead className="border-b border-warm-200 bg-warm-50">
            <tr className="font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
              <th scope="col" className="px-4 py-3">
                Product
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Price
              </th>
              <th scope="col" className="px-4 py-3">
                Stock
              </th>
              <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <AdminProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
