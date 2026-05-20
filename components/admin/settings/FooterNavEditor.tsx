'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useReplaceFooterNavMutation,
  useSiteNavQuery,
} from '@/hooks/useSiteNav';
import { siteHrefError } from '@/lib/site/nav-validation';
import type { FooterColumn, NavLink } from '@/types/site';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from './admin-settings-form-styles';
import { cn } from '@/lib/utils';

const MAX_COLUMNS = 4;

function slugifyKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32);
}

function emptyColumn(position: number): FooterColumn {
  const key = `column-${position + 1}`;
  return {
    column: { key, label: '', position },
    links: [],
  };
}

function emptyFooterLink(): NavLink {
  return { label: '', href: '', position: 0 };
}

export function FooterNavEditor() {
  const { data, isPending, error: loadError } = useSiteNavQuery();
  const mutation = useReplaceFooterNavMutation();
  const [columns, setColumns] = useState<FooterColumn[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!data || initialized) return;
    setColumns(data.footer);
    setInitialized(true);
  }, [data, initialized]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading footer navigation…
      </p>
    );
  }

  if (loadError) {
    return (
      <p className="font-body text-sm text-red-700" role="alert">
        {adminApiErrorMessage(loadError)}
      </p>
    );
  }

  function updateColumn(index: number, patch: Partial<FooterColumn['column']>) {
    setSuccess(null);
    setColumns((current) =>
      current.map((col, i) =>
        i === index ? { ...col, column: { ...col.column, ...patch } } : col,
      ),
    );
  }

  function updateColumnLinks(
    columnIndex: number,
    updater: (links: NavLink[]) => NavLink[],
  ) {
    setSuccess(null);
    setColumns((current) =>
      current.map((col, i) =>
        i === columnIndex ? { ...col, links: updater(col.links) } : col,
      ),
    );
  }

  function moveColumn(index: number, direction: -1 | 1) {
    setSuccess(null);
    setColumns((current) => {
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
      <div className="flex items-center justify-between gap-4">
        <p className="font-body text-sm text-warm-600">
          Up to {MAX_COLUMNS} footer columns, each with ordered links.
        </p>
        <button
          type="button"
          disabled={columns.length >= MAX_COLUMNS}
          onClick={() => {
            setSuccess(null);
            setColumns((current) => [...current, emptyColumn(current.length)]);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-warm-300 px-3 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={14} aria-hidden />
          Add column
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {columns.map((col, columnIndex) => (
          <div
            key={col.column.key || `col-${columnIndex}`}
            className="bg-warm-50/40 rounded-xl border border-warm-200 p-5"
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor={`footer-col-label-${columnIndex}`}
                    className={settingsLabelBase}
                  >
                    Column title
                  </label>
                  <input
                    id={`footer-col-label-${columnIndex}`}
                    value={col.column.label}
                    onChange={(event) => {
                      const label = event.target.value;
                      updateColumn(columnIndex, {
                        label,
                        ...(col.column.key.startsWith('column-')
                          ? { key: slugifyKey(label) || col.column.key }
                          : {}),
                      });
                    }}
                    className={settingsInputBase}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`footer-col-key-${columnIndex}`}
                    className={settingsLabelBase}
                  >
                    Column key
                  </label>
                  <input
                    id={`footer-col-key-${columnIndex}`}
                    value={col.column.key}
                    onChange={(event) =>
                      updateColumn(columnIndex, { key: event.target.value })
                    }
                    className={settingsInputBase}
                  />
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Move column up"
                  disabled={columnIndex === 0}
                  onClick={() => moveColumn(columnIndex, -1)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-40"
                >
                  <ArrowUp size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Move column down"
                  disabled={columnIndex === columns.length - 1}
                  onClick={() => moveColumn(columnIndex, 1)}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-40"
                >
                  <ArrowDown size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Remove column"
                  onClick={() => {
                    setSuccess(null);
                    setColumns((current) =>
                      current.filter((_, i) => i !== columnIndex),
                    );
                  }}
                  className="inline-flex size-9 items-center justify-center rounded-lg text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {col.links.map((link, linkIndex) => (
                <li
                  key={`${col.column.key}-link-${linkIndex}`}
                  className="grid gap-2 rounded-lg border border-warm-200 bg-surface-card p-3 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <input
                    aria-label={`Link label in ${col.column.label}`}
                    value={link.label}
                    onChange={(event) =>
                      updateColumnLinks(columnIndex, (links) =>
                        links.map((item, i) =>
                          i === linkIndex
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Label"
                    className={settingsInputBase}
                  />
                  <input
                    aria-label={`Link URL in ${col.column.label}`}
                    value={link.href}
                    onChange={(event) =>
                      updateColumnLinks(columnIndex, (links) =>
                        links.map((item, i) =>
                          i === linkIndex
                            ? { ...item, href: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="/about"
                    className={settingsInputBase}
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move link up"
                      disabled={linkIndex === 0}
                      onClick={() =>
                        updateColumnLinks(columnIndex, (links) => {
                          const copy = [...links];
                          const temp = copy[linkIndex]!;
                          copy[linkIndex] = copy[linkIndex - 1]!;
                          copy[linkIndex - 1] = temp;
                          return copy;
                        })
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-40"
                    >
                      <ArrowUp size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Move link down"
                      disabled={linkIndex === col.links.length - 1}
                      onClick={() =>
                        updateColumnLinks(columnIndex, (links) => {
                          const copy = [...links];
                          const temp = copy[linkIndex]!;
                          copy[linkIndex] = copy[linkIndex + 1]!;
                          copy[linkIndex + 1] = temp;
                          return copy;
                        })
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-40"
                    >
                      <ArrowDown size={14} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove link"
                      onClick={() =>
                        updateColumnLinks(columnIndex, (links) =>
                          links.filter((_, i) => i !== linkIndex),
                        )
                      }
                      className="inline-flex size-8 items-center justify-center rounded-lg text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                updateColumnLinks(columnIndex, (links) => [
                  ...links,
                  emptyFooterLink(),
                ])
              }
              className={cn(
                'mt-3 inline-flex items-center gap-1.5 font-body text-sm text-brand-600 hover:text-brand-700',
              )}
            >
              <Plus size={14} aria-hidden />
              Add link
            </button>
          </div>
        ))}
      </div>

      {submitError ? (
        <p className="font-body text-sm text-red-700" role="alert">
          {submitError}
        </p>
      ) : null}

      {success ? (
        <p className="font-body text-sm text-brand-700" role="status">
          {success}
        </p>
      ) : null}

      <button
        type="button"
        disabled={mutation.isPending}
        onClick={async () => {
          setSubmitError(null);
          setSuccess(null);

          const keys = columns.map((col) => col.column.key.trim());
          if (new Set(keys).size !== keys.length) {
            setSubmitError('Footer column keys must be unique.');
            return;
          }

          for (const col of columns) {
            if (col.column.label.trim().length === 0) {
              setSubmitError('Every footer column needs a title.');
              return;
            }
            if (col.column.key.trim().length === 0) {
              setSubmitError('Every footer column needs a key.');
              return;
            }
            for (const link of col.links) {
              if (link.label.trim().length === 0) {
                setSubmitError('Every footer link needs a label.');
                return;
              }
              const hrefErr = siteHrefError(link.href);
              if (hrefErr) {
                setSubmitError(hrefErr);
                return;
              }
            }
          }

          try {
            const payload: FooterColumn[] = columns.map((col, columnIndex) => ({
              column: {
                key: col.column.key.trim(),
                label: col.column.label.trim(),
                position: columnIndex,
              },
              links: col.links.map((link, linkIndex) => ({
                label: link.label.trim(),
                href: link.href.trim(),
                position: linkIndex,
              })),
            }));
            const updated = await mutation.mutateAsync(payload);
            setColumns(updated.footer);
            setSuccess(settingsSuccessMessage);
          } catch (err) {
            setSubmitError(adminApiErrorMessage(err));
          }
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : null}
        Save footer navigation
      </button>
    </div>
  );
}
