# Streaming pages (instant navigation)

When a route waits on backend data, **never block the whole page** on `await`. Ship the shell first, then stream data behind `<Suspense>`.

## Pattern

1. **Sync page component** — render banner, headings, toolbars, and static chrome immediately.
2. **Async server section** — move `getServerAccessToken` + API calls into a child in `components/**/sections/` (or similar).
3. **Suspense + skeleton** — wrap the async child with a fallback that matches the final UI (`AdminTableSkeleton`, `AdminFormSkeleton`, etc.).
4. **`key` on Suspense** — when `searchParams` drive the fetch, set `key={JSON.stringify(filters)}` so filter changes refetch correctly.
5. **Route `loading.tsx`** — optional instant placeholder during client navigations (`app/admin/loading.tsx`).

## Admin helpers

- `getAdminApiOpts()` — deduped bearer token per request (`lib/api/admin/server-opts.ts`).
- `AdminTableSkeleton`, `AdminFormSkeleton`, … — `components/admin/AdminLoadingSkeletons.tsx`.

## Example (list page)

```tsx
export default function AdminOrdersPage({ searchParams }) {
  const filters = parseFilters(searchParams);
  return (
    <>
      <AdminBanner />
      <PageHeader heading="Orders" … />
      <AdminOrdersToolbar />
      <Suspense
        key={JSON.stringify(filters)}
        fallback={<AdminTableSkeleton caption="…" columns={[…]} />}
      >
        <AdminOrdersSection {...filters} />
      </Suspense>
    </>
  );
}
```

Client-only data (React Query) should still show the same table chrome with `AdminTableSkeleton` while `isPending`.
