'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { generateDescriptionStream } from '@/lib/api/admin/ai';
import type { Category, PetType } from '@/types/product';

interface AiDescriptionBtnProps {
  /** Current product name + classification — required for the prompt. */
  name: string;
  category: Category | undefined;
  petType: PetType | undefined;
  /** Optional: prefilled ingredients (food category only). */
  ingredients?: string;
  /** Receives streamed chunks; the parent appends them to the textarea. */
  onChunk: (chunk: string) => void;
  /** Called once before the first chunk so the parent can clear the textarea. */
  onStart: () => void;
  /** Called when streaming completes successfully (or after cancel). */
  onComplete: () => void;
}

async function getBrowserAccessToken(): Promise<string | undefined> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token;
}

export function AiDescriptionBtn({
  name,
  category,
  petType,
  ingredients,
  onChunk,
  onStart,
  onComplete,
}: AiDescriptionBtnProps) {
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const controllerRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream on unmount so navigating away mid-stream
  // doesn't keep the connection open.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const handleClick = async () => {
    setValidationMessage(null);
    if (name.trim().length < 2) {
      setValidationMessage('Add a product name first.');
      return;
    }
    if (!category || !petType) {
      setValidationMessage('Pick a category and pet type first.');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setBusy(true);
    setStatusMessage('Generating description…');
    onStart();

    try {
      const accessToken = await getBrowserAccessToken();
      await generateDescriptionStream(
        {
          name: name.trim(),
          category,
          petType,
          ...(ingredients && ingredients.length > 0 ? { ingredients } : {}),
        },
        accessToken,
        {
          signal: controller.signal,
          onChunk,
        },
      );
      setStatusMessage('Description generated.');
    } finally {
      setBusy(false);
      controllerRef.current = null;
      onComplete();
    }
  };

  const handleCancel = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setBusy(false);
    setStatusMessage('Generation cancelled.');
    onComplete();
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {busy ? (
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 rounded-lg border border-warm-300 bg-white px-3 py-1.5 font-body text-xs font-medium text-warm-900 transition-colors hover:bg-warm-100"
          >
            <X size={12} aria-hidden />
            Cancel
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 font-body text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
          >
            <Sparkles size={12} aria-hidden />
            Generate with AI
          </button>
        )}
        {busy && (
          <span className="inline-flex items-center gap-1.5 font-body text-xs text-warm-600">
            <Loader2 size={12} aria-hidden className="animate-spin" />
            Streaming…
          </span>
        )}
      </div>
      <p
        role="status"
        aria-live="polite"
        className="font-body text-xs text-warm-600"
      >
        {statusMessage}
      </p>
      {validationMessage && (
        <p role="alert" className="font-body text-xs text-red-600">
          {validationMessage}
        </p>
      )}
    </div>
  );
}
