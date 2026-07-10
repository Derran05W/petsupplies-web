import type { AdminProduct } from '@/types/admin';
import { AdminProductRow } from './AdminProductRow';

interface AdminProductTableProps {
  products: AdminProduct[];
}

export function AdminProductTable({ products }: AdminProductTableProps) {
  return (
    <div className="max-w-full overflow-hidden rounded-card border border-line bg-paper">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Admin products list</caption>
          <thead className="border-b border-line">
            <tr className="font-body text-micro uppercase text-ink-muted">
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
