'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Controller,
  useForm,
  useFormState,
  type FieldError,
} from 'react-hook-form';
import { Loader2, Trash2 } from 'lucide-react';
import { productSchema, slugify, type ProductInput } from '@/lib/admin/schemas';
import type { ProductImage } from '@/types/product';
import {
  ADMIN_PRODUCT_CATEGORIES,
  ADMIN_PRODUCT_CATEGORY_LABEL,
  type AdminProductCategory,
} from '@/types/admin-product-api';
import type { AdminProduct } from '@/types/admin';
import { productFormErrorMessage } from '@/lib/api/admin/error-messages';
import {
  useCreateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUpdateAdminProductMutation,
} from '@/hooks/useAdminProducts';
import { ConfirmDialog } from '@/components/account/ConfirmDialog';
import { cn } from '@/lib/utils';
import { ImageUploader } from './ImageUploader';
import { AiDescriptionBtn } from './AiDescriptionBtn';

const inputBase =
  'w-full rounded-tile border border-line bg-paper px-3 py-2.5 font-body text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none';
const inputError = 'border-danger-solid focus:border-danger-solid';
const labelBase = 'mb-1.5 block font-body text-micro uppercase text-ink';

interface ProductFormProps {
  initialProduct: AdminProduct | null;
}

interface FormShape {
  name: string;
  slug: string;
  description: string;
  priceDollars: string;
  category: AdminProductCategory | '';
  stockCount: string;
  tagsRaw: string;
  images: ProductImage[];
  isPublished: boolean;
}

function fromAdminProduct(product: AdminProduct | null): FormShape {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    priceDollars:
      product && product.priceCents > 0
        ? (product.priceCents / 100).toFixed(2)
        : '',
    category: product?.category ?? '',
    stockCount: product ? String(product.stockCount) : '0',
    tagsRaw: product?.tags.join(', ') ?? '',
    images: product?.images ?? [],
    isPublished: product?.isPublished ?? true,
  };
}

function toApiInput(values: FormShape): ProductInput {
  const priceRaw = Math.round(Number(values.priceDollars) * 100);
  const priceCents = Number.isFinite(priceRaw) ? priceRaw : 0;
  const stockRaw = Number(values.stockCount);
  const stockCount = Number.isFinite(stockRaw) ? Math.trunc(stockRaw) : 0;
  const tags = values.tagsRaw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    priceCents,
    category: values.category as AdminProductCategory,
    images: values.images,
    stockCount,
    tags,
    isPublished: values.isPublished,
  };
}

function fieldErrorProps(name: string, error: FieldError | undefined) {
  if (!error) return { 'aria-invalid': false as const };
  return {
    'aria-invalid': true as const,
    'aria-describedby': `${name}-error`,
  };
}

export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idPrefix = useId();
  const fieldId = (name: string) => `${idPrefix}-${name}`;
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const aiAccumulator = useRef<string>('');

  const isEdit = initialProduct !== null;
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const createMutation = useCreateAdminProductMutation();
  const updateMutation = useUpdateAdminProductMutation();
  const deleteMutation = useDeleteAdminProductMutation();

  const { register, handleSubmit, setValue, getValues, watch, control } =
    useForm<FormShape>({
      defaultValues: fromAdminProduct(initialProduct),
    });
  const { errors } = useFormState({ control });

  const watchedCategory = watch('category');
  const watchedName = watch('name');

  // Auto-focus the description textarea when the AI shortcut links here
  // with `?focus=description`.
  useEffect(() => {
    if (searchParams.get('focus') === 'description') {
      descriptionRef.current?.focus();
    }
  }, [searchParams]);

  const onNameBlur = () => {
    if (slugTouched) return;
    const name = getValues('name');
    if (name.trim().length === 0) return;
    setValue('slug', slugify(name), { shouldDirty: true });
  };

  const submit = handleSubmit(async (values) => {
    setSubmitError(undefined);

    // Run the schema manually here so we can map our string-based form
    // shape into the API shape first.
    const apiInput = toApiInput(values);
    const parsed = productSchema.safeParse(apiInput);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setSubmitError(
        first?.message ?? 'Please correct the highlighted fields.',
      );
      return;
    }

    try {
      if (isEdit && initialProduct) {
        await updateMutation.mutateAsync({
          id: initialProduct.id,
          input: parsed.data,
          existingImages: initialProduct.images,
        });
      } else {
        await createMutation.mutateAsync(parsed.data);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setSubmitError(productFormErrorMessage(err));
    }
  });

  const handleDeleteConfirm = async () => {
    if (!initialProduct) return;
    setSubmitError(undefined);
    try {
      await deleteMutation.mutateAsync(initialProduct.id);
      setPendingDelete(false);
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setSubmitError(productFormErrorMessage(err));
      setPendingDelete(false);
    }
  };

  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <>
      <form onSubmit={submit} noValidate className="flex flex-col gap-6">
        {submitError && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-tile border border-danger-border bg-danger-surface px-4 py-3 font-body text-sm text-danger-solid"
          >
            {submitError}
          </div>
        )}

        {/* Basics */}
        <fieldset className="flex flex-col gap-5 rounded-card border border-line bg-paper p-5 md:p-6">
          <legend className="px-2 font-body text-kicker uppercase text-pine">
            Basics
          </legend>

          <div>
            <label htmlFor={fieldId('name')} className={labelBase}>
              Product name
            </label>
            <input
              id={fieldId('name')}
              type="text"
              {...register('name', {
                onBlur: onNameBlur,
              })}
              {...fieldErrorProps(fieldId('name'), errors.name)}
              className={cn(inputBase, errors.name && inputError)}
            />
          </div>

          <div>
            <label htmlFor={fieldId('slug')} className={labelBase}>
              URL slug
            </label>
            <input
              id={fieldId('slug')}
              type="text"
              {...register('slug', {
                onChange: () => setSlugTouched(true),
              })}
              {...fieldErrorProps(fieldId('slug'), errors.slug)}
              className={cn(inputBase, errors.slug && inputError)}
            />
            <p className="mt-1 font-body text-xs text-ink-muted">
              Lowercase letters, numbers, and dashes only.
            </p>
          </div>

          <div>
            <label htmlFor={fieldId('category')} className={labelBase}>
              Category
            </label>
            <select
              id={fieldId('category')}
              {...register('category')}
              className={cn(inputBase, errors.category && inputError)}
            >
              <option value="">Select category</option>
              {ADMIN_PRODUCT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {ADMIN_PRODUCT_CATEGORY_LABEL[value]}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 font-body text-sm text-ink">
            <input
              type="checkbox"
              {...register('isPublished')}
              className="size-4 rounded-sm border-line accent-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            />
            Active — visible on the storefront
          </label>
        </fieldset>

        {/* Pricing & Stock */}
        <fieldset className="flex flex-col gap-5 rounded-card border border-line bg-paper p-5 md:p-6">
          <legend className="px-2 font-body text-kicker uppercase text-pine">
            Pricing & stock
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={fieldId('price')} className={labelBase}>
                Price (USD)
              </label>
              <input
                id={fieldId('price')}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register('priceDollars')}
                className={inputBase}
              />
            </div>
            <div>
              <label htmlFor={fieldId('stock')} className={labelBase}>
                Stock count
              </label>
              <input
                id={fieldId('stock')}
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                {...register('stockCount')}
                className={inputBase}
              />
            </div>
          </div>
        </fieldset>

        {/* Images */}
        <fieldset className="flex flex-col gap-5 rounded-card border border-line bg-paper p-5 md:p-6">
          <legend className="px-2 font-body text-kicker uppercase text-pine">
            Images
          </legend>
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                disabled={busy}
                productId={initialProduct?.id ?? null}
              />
            )}
          />
        </fieldset>

        {/* Description + AI */}
        <fieldset className="flex flex-col gap-3 rounded-card border border-line bg-paper p-5 md:p-6">
          <legend className="px-2 font-body text-kicker uppercase text-pine">
            Description
          </legend>
          {(() => {
            const { ref: registerRef, ...rest } = register('description');
            return (
              <textarea
                id={fieldId('description')}
                rows={8}
                ref={(el) => {
                  registerRef(el);
                  descriptionRef.current = el;
                }}
                {...rest}
                className={cn(inputBase, 'min-h-32 resize-y')}
                placeholder="Tell shoppers what makes this product great…"
              />
            );
          })()}
          <AiDescriptionBtn
            name={watchedName}
            category={
              watchedCategory === ''
                ? undefined
                : (watchedCategory as AdminProductCategory)
            }
            onStart={() => {
              aiAccumulator.current = '';
              setValue('description', '', { shouldDirty: true });
            }}
            onChunk={(chunk) => {
              aiAccumulator.current += chunk;
              setValue('description', aiAccumulator.current, {
                shouldDirty: true,
              });
            }}
            onComplete={() => {
              aiAccumulator.current = '';
            }}
          />
        </fieldset>

        {/* Tags */}
        <fieldset className="flex flex-col gap-3 rounded-card border border-line bg-paper p-5 md:p-6">
          <legend className="px-2 font-body text-kicker uppercase text-pine">
            Tags
          </legend>
          <input
            type="text"
            {...register('tagsRaw')}
            className={inputBase}
            placeholder="grain-free, salmon, omega-3"
          />
          <p className="font-body text-xs text-ink-muted">
            Comma-separated. Used for search and related-product suggestions.
          </p>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="inline-flex cursor-pointer items-center justify-center rounded-pill border border-ink bg-transparent px-6 py-2.5 font-body text-micro uppercase text-ink transition-all duration-base ease-soft hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-pill border border-ink bg-ink px-6 py-2.5 font-body text-micro uppercase text-paper transition-all duration-base ease-soft hover:border-pine hover:bg-pine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy && <Loader2 size={14} aria-hidden className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>

      {isEdit && initialProduct && (
        <section className="mt-10 rounded-card border border-danger-border bg-danger-surface p-5 md:p-6">
          <h2 className="font-display text-xl tracking-[-0.01em] text-ink">
            Delete product
          </h2>
          <p className="mt-1 font-body text-sm text-ink-secondary">
            Permanently removes the product from the catalogue. This cannot be
            undone.
          </p>
          <button
            type="button"
            onClick={() => setPendingDelete(true)}
            disabled={busy}
            className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-pill border border-danger-solid bg-transparent px-5 py-2 font-body text-micro uppercase text-danger-solid transition-all duration-base ease-soft hover:bg-danger-solid hover:text-danger-on-solid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-danger-solid disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={14} aria-hidden />
            Delete product
          </button>
        </section>
      )}

      <ConfirmDialog
        open={pendingDelete}
        title="Delete this product?"
        description={
          initialProduct
            ? `“${initialProduct.name}” will be permanently removed.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={deleteMutation.isPending}
        onConfirm={() => {
          void handleDeleteConfirm();
        }}
        onClose={() => {
          if (!deleteMutation.isPending) setPendingDelete(false);
        }}
      />
    </>
  );
}
