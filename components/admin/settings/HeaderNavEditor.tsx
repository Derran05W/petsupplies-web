'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { adminApiErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useReplaceHeaderNavMutation,
  useSiteNavQuery,
} from '@/hooks/useSiteNav';
import { withSequentialPositions } from '@/lib/site/nav-utils';
import { siteHrefError } from '@/lib/site/nav-validation';
import type { NavLink } from '@/types/site';
import {
  settingsInputBase,
  settingsLabelBase,
  settingsSuccessMessage,
} from './admin-settings-form-styles';

function emptyLink(): NavLink {
  return { label: '', href: '', position: 0 };
}

export function HeaderNavEditor() {
  const { data, isPending, error: loadError } = useSiteNavQuery();
  const mutation = useReplaceHeaderNavMutation();
  const [links, setLinks] = useState<NavLink[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!data || initialized) return;
    setLinks(data.header);
    setInitialized(true);
  }, [data, initialized]);

  if (isPending) {
    return (
      <p className="font-body text-sm text-warm-600" aria-busy="true">
        Loading header navigation…
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

  function updateLink(index: number, patch: Partial<NavLink>) {
    setSuccess(null);
    setLinks((current) =>
      current.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  }

  function moveLink(index: number, direction: -1 | 1) {
    setSuccess(null);
    setLinks((current) => {
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
          Links shown in the desktop navbar and mobile menu.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(null);
            setLinks((current) => [...current, emptyLink()]);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-warm-300 px-3 py-2 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
        >
          <Plus size={14} aria-hidden />
          Add link
        </button>
      </div>

      <ul className="flex flex-col gap-3">
        {links.map((link, index) => (
          <li
            key={`header-${index}`}
            className="bg-warm-50/50 grid gap-3 rounded-lg border border-warm-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label
                htmlFor={`header-label-${index}`}
                className={settingsLabelBase}
              >
                Label
              </label>
              <input
                id={`header-label-${index}`}
                value={link.label}
                onChange={(event) =>
                  updateLink(index, { label: event.target.value })
                }
                className={settingsInputBase}
              />
            </div>
            <div>
              <label
                htmlFor={`header-href-${index}`}
                className={settingsLabelBase}
              >
                URL
              </label>
              <input
                id={`header-href-${index}`}
                value={link.href}
                onChange={(event) =>
                  updateLink(index, { href: event.target.value })
                }
                placeholder="/products"
                className={settingsInputBase}
              />
            </div>
            <div className="flex items-end gap-1">
              <button
                type="button"
                aria-label="Move link up"
                disabled={index === 0}
                onClick={() => moveLink(index, -1)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-40"
              >
                <ArrowUp size={14} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Move link down"
                disabled={index === links.length - 1}
                onClick={() => moveLink(index, 1)}
                className="inline-flex size-9 items-center justify-center rounded-lg text-warm-600 hover:bg-warm-100 disabled:opacity-40"
              >
                <ArrowDown size={14} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Remove link"
                onClick={() => {
                  setSuccess(null);
                  setLinks((current) => current.filter((_, i) => i !== index));
                }}
                className="inline-flex size-9 items-center justify-center rounded-lg text-red-700 hover:bg-red-50"
              >
                <Trash2 size={14} aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>

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

          for (const link of links) {
            if (link.label.trim().length === 0) {
              setSubmitError('Every header link needs a label.');
              return;
            }
            const hrefErr = siteHrefError(link.href);
            if (hrefErr) {
              setSubmitError(hrefErr);
              return;
            }
          }

          try {
            const payload = withSequentialPositions(
              links.map((link) => ({
                label: link.label.trim(),
                href: link.href.trim(),
                position: link.position,
              })),
            );
            await mutation.mutateAsync(payload);
            setLinks(payload);
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
        Save header links
      </button>
    </div>
  );
}
