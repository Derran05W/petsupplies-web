'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useCategoryStripQuery,
  useReplaceCategoryStripMutation,
} from '@/hooks/useSiteCategoryStrip';
import { siteHrefError } from '@/lib/site/nav-validation';
import {
  CATEGORY_STRIP_ICON_OPTIONS,
  categoryStripIconKeyFromStorage,
  categoryStripIconStorageKey,
  inferCategoryStripIconKey,
  type CategoryStripIconKey,
} from '@/lib/site/category-strip-icons';
import type { CategoryStripItemInput } from '@/types/site';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from './admin-settings-form-styles';

interface EditableStripItem extends CategoryStripItemInput {
  clientKey: string;
  iconKey: CategoryStripIconKey;
}

const selectBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';

function emptyItem(position: number): EditableStripItem {
  return {
    clientKey: crypto.randomUUID(),
    label: '',
    href: '',
    imageUrl: null,
    iconKey: 'paw-print',
    position,
    isActive: true,
  };
}

export function CategoryStripEditor() {
  const { data, isPending, error: loadError } = useCategoryStripQuery();
  const mutation = useReplaceCategoryStripMutation();
  const [items, setItems] = useState<EditableStripItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!data || initialized) return;
    setItems(
      data.map((item) => ({
        clientKey: item.id,
        label: item.label,
        href: item.href,
        imageUrl: item.imageUrl,
        iconKey:
          categoryStripIconKeyFromStorage(item.imageUrl) ??
          inferCategoryStripIconKey(item),
        position: item.position,
        isActive: item.isActive,
      })),
    );
    setInitialized(true);
  }, [data, initialized]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading category strip…
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="font-body text-sm text-danger-solid" role="alert">
        {adminApiErrorMessage(loadError)}
      </p>
    );
  }

  function updateItem(index: number, patch: Partial<EditableStripItem>) {
    setSuccess(null);
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    setSuccess(null);
    setItems((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const copy = [...current];
      const temp = copy[index]!;
      copy[index] = copy[nextIndex]!;
      copy[nextIndex] = temp;
      return copy;
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="font-display text-xl tracking-[-0.01em] text-ink">
          Category strip
        </h3>
        <p className="mt-1 font-body text-sm text-ink-secondary">
          Horizontal chips below the hero on the homepage — each uses a Lucide
          icon instead of a photo. Inactive items are hidden on the storefront.
        </p>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setItems((current) => [...current, emptyItem(current.length)]);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-ink bg-transparent px-4 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
        >
          <Plus size={14} aria-hidden />
          Add category
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {items.map((item, index) => (
          <li
            key={item.clientKey}
            className="border-b border-line pb-4 last:border-0 last:pb-0"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="font-body text-micro uppercase text-ink">
                Item {index + 1}
              </p>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-2 font-body text-xs text-ink-muted">
                  <input
                    type="checkbox"
                    checked={item.isActive ?? true}
                    onChange={(event) =>
                      updateItem(index, { isActive: event.target.checked })
                    }
                    className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                  />
                  Active
                </label>
                <button
                  type="button"
                  aria-label="Move item up"
                  disabled={index === 0}
                  onClick={() => moveItem(index, -1)}
                  className="inline-flex size-8 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
                >
                  <ArrowUp size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Move item down"
                  disabled={index === items.length - 1}
                  onClick={() => moveItem(index, 1)}
                  className="inline-flex size-8 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
                >
                  <ArrowDown size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => {
                    setSuccess(null);
                    setItems((current) =>
                      current.filter((_, i) => i !== index),
                    );
                  }}
                  className="font-body text-micro uppercase text-danger-solid transition-opacity duration-fast hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-solid"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`strip-label-${index}`}
                  className={settingsLabelBase}
                >
                  Label
                </label>
                <input
                  id={`strip-label-${index}`}
                  value={item.label}
                  onChange={(event) =>
                    updateItem(index, { label: event.target.value })
                  }
                  className={settingsInputBase}
                />
              </div>
              <div>
                <label
                  htmlFor={`strip-href-${index}`}
                  className={settingsLabelBase}
                >
                  Link
                </label>
                <input
                  id={`strip-href-${index}`}
                  value={item.href}
                  onChange={(event) =>
                    updateItem(index, { href: event.target.value })
                  }
                  placeholder="/products?petType=dog"
                  className={settingsInputBase}
                />
              </div>
              <div>
                <label
                  htmlFor={`strip-icon-${index}`}
                  className={settingsLabelBase}
                >
                  Icon
                </label>
                <select
                  id={`strip-icon-${index}`}
                  value={item.iconKey}
                  disabled={mutation.isPending}
                  onChange={(event) =>
                    updateItem(index, {
                      iconKey: event.target.value as CategoryStripIconKey,
                    })
                  }
                  className={selectBase}
                >
                  {CATEGORY_STRIP_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {items.length === 0 ? (
        <p className="font-body text-sm text-ink-muted">
          No categories yet. Add items or save an empty list to hide the strip.
        </p>
      ) : null}

      {submitError ? (
        <p className="font-body text-sm text-danger-solid" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="font-body text-sm text-pine" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="button"
        disabled={mutation.isPending}
        onClick={async () => {
          setSubmitError(null);
          setSuccess(null);

          for (const item of items) {
            if (item.label.trim().length === 0) {
              setSubmitError('Every category needs a label.');
              return;
            }
            const hrefErr = siteHrefError(item.href);
            if (hrefErr) {
              setSubmitError(hrefErr);
              return;
            }
          }

          try {
            const payload: CategoryStripItemInput[] = items.map(
              (item, index) => ({
                label: item.label.trim(),
                href: item.href.trim(),
                imageUrl: categoryStripIconStorageKey(item.iconKey),
                position: index,
                isActive: item.isActive ?? true,
              }),
            );
            const updated = await mutation.mutateAsync(payload);
            setItems(
              updated.map((row) => ({
                clientKey: row.id,
                label: row.label,
                href: row.href,
                imageUrl: row.imageUrl,
                iconKey:
                  categoryStripIconKeyFromStorage(row.imageUrl) ??
                  inferCategoryStripIconKey(row),
                position: row.position,
                isActive: row.isActive,
              })),
            );
            setSuccess(settingsSuccessMessage);
          } catch (err) {
            setSubmitError(adminApiErrorMessage(err));
          }
        }}
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : null}
        Save category strip
      </button>
    </div>
  );
}
