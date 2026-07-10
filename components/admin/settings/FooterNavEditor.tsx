'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus } from 'lucide-react';
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
      <p className="font-body text-sm text-ink-muted" aria-busy="true">
        Loading footer navigation…
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
        <p className="font-body text-sm text-ink-secondary">
          Up to {MAX_COLUMNS} footer columns, each with ordered links.
        </p>
        <button
          type="button"
          disabled={columns.length >= MAX_COLUMNS}
          onClick={() => {
            setSuccess(null);
            setColumns((current) => [...current, emptyColumn(current.length)]);
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-pill border border-ink bg-transparent px-4 py-2 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          <Plus size={14} aria-hidden />
          Add column
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {columns.map((col, columnIndex) => (
          <div
            key={col.column.key || `col-${columnIndex}`}
            className="rounded-card border border-line p-5"
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
                  className="inline-flex size-9 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
                >
                  <ArrowUp size={14} aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Move column down"
                  disabled={columnIndex === columns.length - 1}
                  onClick={() => moveColumn(columnIndex, 1)}
                  className="inline-flex size-9 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
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
                  className="font-body text-micro uppercase text-danger-solid transition-opacity duration-fast hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-solid"
                >
                  Remove
                </button>
              </div>
            </div>

            <ul className="flex flex-col">
              {col.links.map((link, linkIndex) => (
                <li
                  key={`${col.column.key}-link-${linkIndex}`}
                  className="grid gap-2 border-b border-line py-3 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[1fr_1fr_auto]"
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
                      className="inline-flex size-8 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
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
                      className="inline-flex size-8 items-center justify-center rounded-tile text-ink-faint transition-colors duration-fast hover:bg-panel hover:text-ink disabled:opacity-40"
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
                      className="font-body text-micro uppercase text-danger-solid transition-opacity duration-fast hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger-solid"
                    >
                      Remove
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
                'mt-3 inline-flex items-center gap-1.5 rounded-tile border border-dashed border-line px-3 py-2 font-body text-micro uppercase text-ink-muted transition-colors duration-fast hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine',
              )}
            >
              <Plus size={14} aria-hidden />
              Add link
            </button>
          </div>
        ))}
      </div>

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
        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mutation.isPending ? (
          <Loader2 size={14} className="animate-spin" aria-hidden />
        ) : null}
        Save footer navigation
      </button>
    </div>
  );
}
