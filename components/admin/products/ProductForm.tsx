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
import {
  CATEGORY_LABEL,
  PET_TYPE_LABEL,
  type Category,
  type PetType,
  type ProductImage,
} from '@/types/product';
import type { AdminProduct } from '@/types/admin';
import { ApiError } from '@/lib/api/client';
import {
  useCreateAdminProductMutation,
  useDeleteAdminProductMutation,
  useUpdateAdminProductMutation,
} from '@/hooks/useAdminProducts';
import { ConfirmDialog } from '@/components/account/addresses/ConfirmDialog';
import { cn } from '@/lib/utils';
import { ImageUploader } from './ImageUploader';
import { AiDescriptionBtn } from './AiDescriptionBtn';

const inputBase =
  'w-full rounded-lg border border-warm-300 bg-white px-3 py-2.5 font-body text-sm text-warm-900 placeholder:text-warm-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400';
const inputError = 'border-red-400 focus:ring-red-400';
const labelBase =
  'mb-1.5 block font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600';

const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server. Try again or check back shortly.";
const SESSION_ERROR_MESSAGE = 'Your session has expired. Please sign in again.';
const GENERIC_ERROR_MESSAGE =
  'Something went wrong saving that product. Please try again.';

const CATEGORY_VALUES: Category[] = [
  'food',
  'treats',
  'accessories',
  'healthcare',
];
const PET_TYPE_VALUES: PetType[] = ['dog', 'cat', 'bird', 'small-animal'];

interface ProductFormProps {
  initialProduct: AdminProduct | null;
}

interface FormShape {
  name: string;
  slug: string;
  description: string;
  priceDollars: string;
  compareAtPriceDollars: string;
  category: Category | '';
  petType: PetType | '';
  stockCount: string;
  tagsRaw: string;
  images: ProductImage[];
  isPublished: boolean;
  ingredients: string;
  feedingGuidelines: string;
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
    compareAtPriceDollars:
      product && product.compareAtPriceCents
        ? (product.compareAtPriceCents / 100).toFixed(2)
        : '',
    category: product?.category ?? '',
    petType: product?.petType ?? '',
    stockCount: product ? String(product.stockCount) : '0',
    tagsRaw: product?.tags.join(', ') ?? '',
    images: product?.images ?? [],
    isPublished: product?.isPublished ?? true,
    ingredients: product?.nutritionalInfo?.ingredients ?? '',
    feedingGuidelines: product?.nutritionalInfo?.feedingGuidelines ?? '',
  };
}

function toApiInput(values: FormShape): ProductInput {
  const priceCents = Math.round(Number(values.priceDollars) * 100);
  const compareDollars = values.compareAtPriceDollars.trim();
  const compareAtPriceCents =
    compareDollars.length > 0
      ? Math.round(Number(compareDollars) * 100)
      : undefined;
  const tags = values.tagsRaw
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

  const isFood = values.category === 'food';
  const ingredients = values.ingredients.trim();
  const feedingGuidelines = values.feedingGuidelines.trim();
  const nutritionalInfo =
    isFood && (ingredients.length > 0 || feedingGuidelines.length > 0)
      ? {
          ingredients,
          guaranteedAnalysis: [],
          feedingGuidelines,
        }
      : undefined;

  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    description: values.description.trim(),
    priceCents,
    ...(compareAtPriceCents !== undefined ? { compareAtPriceCents } : {}),
    category: values.category as Category,
    petType: values.petType as PetType,
    images: values.images,
    ...(nutritionalInfo ? { nutritionalInfo } : {}),
    stockCount: Number(values.stockCount),
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

function errorMessageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.isNetworkError) return NETWORK_ERROR_MESSAGE;
    if (err.status === 401) return SESSION_ERROR_MESSAGE;
    return err.message || GENERIC_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
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
  const watchedPetType = watch('petType');
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
        });
      } else {
        await createMutation.mutateAsync(parsed.data);
      }
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setSubmitError(errorMessageFor(err));
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
      setSubmitError(errorMessageFor(err));
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
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-body text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        {/* Basics */}
        <fieldset className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
          <legend className="px-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
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
            <p className="mt-1 font-body text-xs text-warm-600">
              Lowercase letters, numbers, and dashes only.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                {CATEGORY_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {CATEGORY_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={fieldId('petType')} className={labelBase}>
                Pet type
              </label>
              <select
                id={fieldId('petType')}
                {...register('petType')}
                className={cn(inputBase, errors.petType && inputError)}
              >
                <option value="">Select pet type</option>
                {PET_TYPE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {PET_TYPE_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 font-body text-sm text-warm-900">
            <input
              type="checkbox"
              {...register('isPublished')}
              className="size-4 rounded border-warm-300 text-brand-400 focus:ring-2 focus:ring-brand-400"
            />
            Active — visible on the storefront
          </label>
        </fieldset>

        {/* Pricing & Stock */}
        <fieldset className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
          <legend className="px-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
            Pricing & stock
          </legend>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <label htmlFor={fieldId('compareAt')} className={labelBase}>
                Compare-at price{' '}
                <span className="font-normal normal-case tracking-normal text-warm-400">
                  (optional)
                </span>
              </label>
              <input
                id={fieldId('compareAt')}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                {...register('compareAtPriceDollars')}
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
        <fieldset className="flex flex-col gap-5 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
          <legend className="px-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
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
              />
            )}
          />
        </fieldset>

        {/* Description + AI */}
        <fieldset className="flex flex-col gap-3 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
          <legend className="px-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
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
              watchedCategory === '' ? undefined : (watchedCategory as Category)
            }
            petType={
              watchedPetType === '' ? undefined : (watchedPetType as PetType)
            }
            ingredients={getValues('ingredients')}
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
        <fieldset className="flex flex-col gap-3 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
          <legend className="px-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
            Tags
          </legend>
          <input
            type="text"
            {...register('tagsRaw')}
            className={inputBase}
            placeholder="grain-free, salmon, omega-3"
          />
          <p className="font-body text-xs text-warm-600">
            Comma-separated. Used for search and related-product suggestions.
          </p>
        </fieldset>

        {/* Nutritional info — only when category === 'food' */}
        {watchedCategory === 'food' && (
          <fieldset className="flex flex-col gap-4 rounded-2xl border border-warm-200 bg-white p-5 md:p-6">
            <legend className="px-2 font-body text-xs font-medium uppercase tracking-[0.08em] text-warm-600">
              Nutritional information
            </legend>
            <div>
              <label htmlFor={fieldId('ingredients')} className={labelBase}>
                Ingredients
              </label>
              <textarea
                id={fieldId('ingredients')}
                rows={3}
                {...register('ingredients')}
                className={cn(inputBase, 'resize-y')}
              />
            </div>
            <div>
              <label
                htmlFor={fieldId('feedingGuidelines')}
                className={labelBase}
              >
                Feeding guidelines
              </label>
              <textarea
                id={fieldId('feedingGuidelines')}
                rows={3}
                {...register('feedingGuidelines')}
                className={cn(inputBase, 'resize-y')}
              />
            </div>
          </fieldset>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center justify-center rounded-lg border border-warm-300 bg-transparent px-5 py-2.5 font-body text-sm text-warm-900 transition-colors hover:bg-warm-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-400 px-5 py-2.5 font-body text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 size={14} aria-hidden className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </form>

      {isEdit && initialProduct && (
        <section className="mt-10 rounded-2xl border border-red-200 bg-red-50/50 p-5 md:p-6">
          <h2 className="font-display text-lg tracking-[-0.02em] text-warm-900">
            Delete product
          </h2>
          <p className="mt-1 font-body text-sm text-warm-600">
            Permanently removes the product from the catalogue. This cannot be
            undone.
          </p>
          <button
            type="button"
            onClick={() => setPendingDelete(true)}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 font-body text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
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
