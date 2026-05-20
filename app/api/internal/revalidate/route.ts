import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';

interface RevalidateBody {
  tags?: unknown;
}

export async function POST(request: NextRequest) {
  const expected = process.env.INTERNAL_REVALIDATE_TOKEN;
  const auth = request.headers.get('authorization');

  if (
    typeof expected !== 'string' ||
    expected.length === 0 ||
    auth !== `Bearer ${expected}`
  ) {
    return new NextResponse(null, { status: 401 });
  }

  let body: RevalidateBody;
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!Array.isArray(body.tags)) {
    return new NextResponse(null, { status: 400 });
  }

  for (const tag of body.tags) {
    if (typeof tag === 'string' && tag.length > 0) {
      revalidateTag(tag);
    }
  }

  return new NextResponse(null, { status: 204 });
}
