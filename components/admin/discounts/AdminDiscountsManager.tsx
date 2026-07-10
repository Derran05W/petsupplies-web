'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  discountCreateSchema,
  parseOptionalDollarsToCents,
  parseOptionalIsoDate,
  parseOptionalPositiveInt,
} from '@/lib/admin/discount-schema';
import {
  centsToDollarsInput,
  formatDiscountTypeLabel,
  formatDiscountValue,
  toDateTimeLocalValue,
} from '@/lib/admin/discount-display';
import {
  useAdminDiscountsQuery,
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useUpdateDiscountMutation,
} from '@/hooks/useAdminDiscounts';
import type { AdminDiscount, DiscountType } from '@/types/admin-discount';
import {
  settingsInputBase,
  settingsLabelBase,
} from '@/components/admin/settings/admin-settings-form-styles';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils/format';
import { NAV_LINK_CLASSES } from '@/components/ui';

const selectBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink focus:border-ink focus:outline-none';

type ActiveFilter = 'all' | 'active' | 'inactive';

function StatusBadge({ discount }: { discount: AdminDiscount }) {
  const inactive = !discount.active;
  return (
    <span
      className={cn(
        'inline-flex rounded-tag border px-2 py-0.5 font-body text-micro uppercase',
        inactive
          ? 'border-line bg-panel text-ink-muted'
          : 'border-pine/40 bg-tile-sage text-tile-sage-ink',
      )}
    >
      {inactive ? 'Inactive' : 'Active'}
    </span>
  );
}

function DiscountFormFields({
  mode,
  discount,
  onCancel,
  onSaved,
}: {
  mode: 'create' | 'edit';
  discount?: AdminDiscount;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const createMutation = useCreateDiscountMutation();
  const updateMutation = useUpdateDiscountMutation();
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState(discount?.code ?? '');
  const [type, setType] = useState<DiscountType>(
    discount?.type ?? 'PERCENTAGE',
  );
  const [value, setValue] = useState(
    String(discount?.type === 'FREE_SHIPPING' ? 0 : (discount?.value ?? 10)),
  );
  const [minCartDollars, setMinCartDollars] = useState(
    centsToDollarsInput(discount?.minCartCents ?? null),
  );
  const [maxRedemptions, setMaxRedemptions] = useState(
    discount?.maxRedemptions !== null && discount?.maxRedemptions !== undefined
      ? String(discount.maxRedemptions)
      : '',
  );
  const [validFrom, setValidFrom] = useState(
    toDateTimeLocalValue(discount?.validFrom ?? null),
  );
  const [validUntil, setValidUntil] = useState(
    toDateTimeLocalValue(discount?.validUntil ?? null),
  );
  const [active, setActive] = useState(discount?.active ?? true);

  const pending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (type === 'FREE_SHIPPING') {
      setValue('0');
    }
  }, [type]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);

        if (mode === 'create') {
          const parsed = discountCreateSchema.safeParse({
            code,
            type,
            value: Number.parseInt(value, 10),
            minCartDollars,
            maxRedemptions,
            validFrom,
            validUntil,
            active,
          });
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? 'Invalid form');
            return;
          }

          const minCartCents = parseOptionalDollarsToCents(minCartDollars);
          if (minCartCents === undefined) {
            setError('Enter a valid minimum cart amount or leave blank.');
            return;
          }
          const maxRed = parseOptionalPositiveInt(maxRedemptions);
          if (maxRed === undefined) {
            setError('Max redemptions must be a positive whole number.');
            return;
          }
          const from = parseOptionalIsoDate(validFrom);
          const until = parseOptionalIsoDate(validUntil);
          if (from === undefined || until === undefined) {
            setError('Enter valid start/end dates or leave blank.');
            return;
          }

          try {
            await createMutation.mutateAsync({
              code: parsed.data.code.trim().toUpperCase(),
              type: parsed.data.type,
              value: parsed.data.value,
              minCartCents,
              maxRedemptions: maxRed,
              validFrom: from,
              validUntil: until,
              active: parsed.data.active,
            });
            onSaved();
          } catch (err) {
            setError(adminApiErrorMessage(err));
          }
          return;
        }

        const numericValue = Number.parseInt(value, 10);
        const body: Record<string, unknown> = {};
        if (discount && numericValue !== discount.value) {
          body.value = numericValue;
        } else if (!discount) {
          body.value = numericValue;
        }

        const minCartCents = parseOptionalDollarsToCents(minCartDollars);
        if (minCartCents === undefined) {
          setError('Enter a valid minimum cart amount or leave blank.');
          return;
        }
        if (
          minCartCents !==
          (discount?.minCartCents === undefined
            ? undefined
            : discount.minCartCents)
        ) {
          body.minCartCents = minCartCents;
        }

        const maxRed = parseOptionalPositiveInt(maxRedemptions);
        if (maxRed === undefined) {
          setError('Max redemptions must be a positive whole number.');
          return;
        }
        if (maxRed !== discount?.maxRedemptions) {
          body.maxRedemptions = maxRed;
        }

        const from = parseOptionalIsoDate(validFrom);
        const until = parseOptionalIsoDate(validUntil);
        if (from === undefined || until === undefined) {
          setError('Enter valid start/end dates or leave blank.');
          return;
        }
        if (from !== discount?.validFrom) body.validFrom = from;
        if (until !== discount?.validUntil) body.validUntil = until;
        if (active !== discount?.active) body.active = active;

        if (Object.keys(body).length === 0) {
          setError('Change at least one field before saving.');
          return;
        }

        if (!discount) return;

        try {
          await updateMutation.mutateAsync({ id: discount.id, body });
          onSaved();
        } catch (err) {
          setError(adminApiErrorMessage(err));
        }
      }}
    >
      {mode === 'create' ? (
        <div>
          <label htmlFor="discount-code" className={settingsLabelBase}>
            Code
          </label>
          <input
            id="discount-code"
            className={settingsInputBase}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="SAVE10"
            autoComplete="off"
            required
          />
          <p className="mt-1.5 font-body text-xs text-ink-muted">
            3–32 characters: letters, numbers, underscores, dashes. Stored
            uppercase.
          </p>
        </div>
      ) : (
        <div>
          <span className={settingsLabelBase}>Code</span>
          <p className="font-body text-sm font-medium text-ink">
            {discount?.code}
          </p>
          <p className="mt-1 font-body text-xs text-ink-muted">
            {formatDiscountTypeLabel(discount!.type)} — type and code cannot be
            changed after creation.
          </p>
        </div>
      )}

      {mode === 'create' ? (
        <div>
          <label htmlFor="discount-type" className={settingsLabelBase}>
            Type
          </label>
          <select
            id="discount-type"
            className={selectBase}
            value={type}
            onChange={(e) => setType(e.target.value as DiscountType)}
          >
            <option value="PERCENTAGE">Percentage off subtotal</option>
            <option value="FIXED">Fixed amount off subtotal</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </select>
        </div>
      ) : null}

      {type !== 'FREE_SHIPPING' ? (
        <div>
          <label htmlFor="discount-value" className={settingsLabelBase}>
            {type === 'PERCENTAGE' ? 'Percent off' : 'Amount off (cents)'}
          </label>
          <input
            id="discount-value"
            type="number"
            min={type === 'PERCENTAGE' ? 1 : 1}
            max={type === 'PERCENTAGE' ? 100 : undefined}
            className={settingsInputBase}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
          />
          {type === 'FIXED' ? (
            <p className="mt-1.5 font-body text-xs text-ink-muted">
              Enter cents (e.g. 500 for {formatPrice(500)} off).
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="discount-min-cart" className={settingsLabelBase}>
            Minimum cart (optional)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-body text-sm text-ink-faint">
              $
            </span>
            <input
              id="discount-min-cart"
              type="number"
              min="0"
              step="0.01"
              className={cn(settingsInputBase, 'pl-7')}
              value={minCartDollars}
              onChange={(e) => setMinCartDollars(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="discount-max-redemptions"
            className={settingsLabelBase}
          >
            Max redemptions (optional)
          </label>
          <input
            id="discount-max-redemptions"
            type="number"
            min="1"
            step="1"
            className={settingsInputBase}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="discount-valid-from" className={settingsLabelBase}>
            Valid from (optional)
          </label>
          <input
            id="discount-valid-from"
            type="datetime-local"
            className={settingsInputBase}
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="discount-valid-until" className={settingsLabelBase}>
            Valid until (optional)
          </label>
          <input
            id="discount-valid-until"
            type="datetime-local"
            className={settingsInputBase}
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 font-body text-sm text-ink">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        />
        Active on storefront
      </label>

      {error ? (
        <p className="font-body text-sm text-danger-solid" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} className="animate-spin" aria-hidden />
          ) : null}
          {mode === 'create' ? 'Create discount' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex cursor-pointer items-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DiscountDrawer({
  mode,
  discount,
  onClose,
}: {
  mode: 'create' | 'edit';
  discount?: AdminDiscount;
  onClose: () => void;
}) {
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const deleteMutation = useDeleteDiscountMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close discount panel"
        className="fixed inset-0 z-40 bg-scrim"
        onClick={onClose}
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="discount-drawer-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-line bg-paper text-ink shadow-lifted"
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2
            id="discount-drawer-title"
            className="font-display text-2xl tracking-[-0.01em] text-ink"
          >
            {mode === 'create' ? 'New discount' : `Edit ${discount?.code}`}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className={cn(
              NAV_LINK_CLASSES,
              'shrink-0 font-body text-label uppercase text-ink',
            )}
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <DiscountFormFields
            mode={mode}
            discount={discount}
            onCancel={onClose}
            onSaved={onClose}
          />
          {mode === 'edit' && discount?.active ? (
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="font-body text-label uppercase text-ink">
                Deactivate
              </h3>
              <p className="mt-1 font-body text-xs text-ink-muted">
                Soft-deletes the code — redemption history is kept. Customers
                can no longer apply it.
              </p>
              {deleteError ? (
                <p
                  className="mt-2 font-body text-sm text-danger-solid"
                  role="alert"
                >
                  {deleteError}
                </p>
              ) : null}
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={async () => {
                  setDeleteError(null);
                  try {
                    await deleteMutation.mutateAsync(discount.id);
                    onClose();
                  } catch (err) {
                    setDeleteError(adminApiErrorMessage(err));
                  }
                }}
                className="mt-3 inline-flex cursor-pointer items-center rounded-pill border border-danger-solid bg-transparent px-5 py-2 font-body text-micro uppercase text-danger-solid transition-all duration-base ease-soft hover:bg-danger-solid hover:text-danger-on-solid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deactivating…' : 'Deactivate code'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function AdminDiscountsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(
    1,
    Number.parseInt(searchParams.get('page') ?? '1', 10) || 1,
  );
  const activeFilter = (searchParams.get('active') ?? 'all') as ActiveFilter;
  const drawerMode = searchParams.get('drawer') as 'create' | 'edit' | null;
  const selectedId = searchParams.get('selected');

  const { data, isPending, error } = useAdminDiscountsQuery({
    page,
    activeFilter,
  });

  const selectedDiscount =
    drawerMode === 'edit' && selectedId
      ? (data?.data.find((d) => d.id === selectedId) ?? null)
      : null;

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `/admin/discounts?${qs}` : '/admin/discounts', {
      scroll: false,
    });
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setParams({
                  active: filter === 'all' ? null : filter,
                  page: '1',
                })
              }
              className={cn(
                'rounded-pill border px-3 py-1.5 font-body text-micro uppercase transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine',
                activeFilter === filter
                  ? 'border-ink bg-ink text-paper'
                  : 'border-line bg-transparent text-ink-secondary hover:border-ink',
              )}
            >
              {filter}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setParams({ drawer: 'create', selected: null })}
          className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-ink bg-ink px-5 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          <Plus size={14} aria-hidden />
          New discount
        </button>
      </div>

      {isPending ? (
        <p className="font-body text-sm text-ink-muted" aria-busy="true">
          Loading discounts…
        </p>
      ) : error ? (
        <p className="font-body text-sm text-danger-solid" role="alert">
          {adminApiErrorMessage(error)}
        </p>
      ) : !data || data.data.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">
          No discount codes yet. Create one to offer promotions at checkout.
        </p>
      ) : (
        <div className="max-w-full overflow-hidden rounded-card border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Admin discount codes</caption>
              <thead className="border-b border-line">
                <tr className="font-body text-micro uppercase text-ink-muted">
                  <th scope="col" className="px-4 py-3">
                    Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Offer
                  </th>
                  <th scope="col" className="hidden px-4 py-3 sm:table-cell">
                    Used
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((discount) => (
                  <tr
                    key={discount.id}
                    className="border-b border-line font-body text-sm text-ink-secondary transition-colors duration-fast last:border-0 hover:bg-panel"
                  >
                    <td className="px-4 py-3 font-medium text-ink">
                      {discount.code}
                    </td>
                    <td className="px-4 py-3">
                      {formatDiscountValue(discount.type, discount.value)}
                      {discount.minCartCents ? (
                        <span className="mt-0.5 block text-xs text-ink-faint">
                          Min {formatPrice(discount.minCartCents)}
                        </span>
                      ) : null}
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      {discount.usedCount}
                      {discount.maxRedemptions !== null
                        ? ` / ${discount.maxRedemptions}`
                        : ''}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge discount={discount} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          setParams({
                            drawer: 'edit',
                            selected: discount.id,
                          })
                        }
                        className="font-body text-micro uppercase text-ink opacity-75 transition-opacity duration-fast hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data && data.totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between font-body text-sm text-ink-muted">
          <span>
            Page {data.page} of {data.totalPages} ({data.total} total)
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setParams({ page: String(page - 1) })}
              className="rounded-pill border border-line px-4 py-1.5 font-body text-micro uppercase text-ink-secondary transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => setParams({ page: String(page + 1) })}
              className="rounded-pill border border-line px-4 py-1.5 font-body text-micro uppercase text-ink-secondary transition-colors duration-fast hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {drawerMode === 'create' ? (
        <DiscountDrawer
          mode="create"
          onClose={() => setParams({ drawer: null })}
        />
      ) : null}
      {drawerMode === 'edit' && selectedDiscount ? (
        <DiscountDrawer
          mode="edit"
          discount={selectedDiscount}
          onClose={() => setParams({ drawer: null, selected: null })}
        />
      ) : null}
    </>
  );
}
