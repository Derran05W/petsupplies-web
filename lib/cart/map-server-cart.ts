import type { ApiCartItem, CartViewLine, ServerCart } from '@/types/cart';

export function mapApiCartItemToViewLine(item: ApiCartItem): CartViewLine {
  return {
    cartItemId: item.id,
    productId: item.productId,
    slug: item.product.slug,
    name: item.product.name,
    priceCents: item.product.price,
    imageUrl: item.product.imageUrl ?? '',
    stockCount: item.product.stock,
    quantity: item.quantity,
  };
}

export function mapServerCartToViewLines(cart: ServerCart): CartViewLine[] {
  return cart.items.map(mapApiCartItemToViewLine);
}
