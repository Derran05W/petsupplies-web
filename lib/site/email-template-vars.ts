/** Mustache-style placeholders allowed per template key (mirrors petsupplies-api). */
export const EMAIL_TEMPLATE_KEYS = [
  'order-confirmation',
  'shipping-notification',
  'delivery-confirmation',
  'back-in-stock-alert',
  'abandoned-cart-reminder',
  'password-reset',
  'subscription-upcoming-delivery',
  'subscription-payment-issue',
] as const;

export type EmailTemplateKey = (typeof EMAIL_TEMPLATE_KEYS)[number];

export const EMAIL_TEMPLATE_ALLOWED_VARS: Record<
  EmailTemplateKey,
  readonly string[]
> = {
  'order-confirmation': [
    'brand.name',
    'greeting',
    'order.number',
    'order.url',
    'order.total',
    'lineItems',
  ],
  'shipping-notification': [
    'brand.name',
    'greeting',
    'order.number',
    'order.url',
    'order.carrier',
    'order.trackingNumber',
  ],
  'delivery-confirmation': [
    'brand.name',
    'greeting',
    'order.number',
    'order.url',
  ],
  'back-in-stock-alert': ['product.name', 'product.url'],
  'abandoned-cart-reminder': [
    'greeting',
    'cart.url',
    'cart.subtotal',
    'lineItems',
  ],
  'password-reset': [
    'brand.name',
    'greeting',
    'reset.url',
    'reset.expiresMinutes',
  ],
  'subscription-upcoming-delivery': [
    'greeting',
    'product.name',
    'product.url',
    'delivery.dateLabel',
    'pet.line',
    'pet.lineText',
  ],
  'subscription-payment-issue': ['greeting'],
};

export const EMAIL_TEMPLATE_LABELS: Record<EmailTemplateKey, string> = {
  'order-confirmation': 'Order confirmation',
  'shipping-notification': 'Shipping notification',
  'delivery-confirmation': 'Delivery confirmation',
  'back-in-stock-alert': 'Back in stock alert',
  'abandoned-cart-reminder': 'Abandoned cart reminder',
  'password-reset': 'Password reset',
  'subscription-upcoming-delivery': 'Subscription upcoming delivery',
  'subscription-payment-issue': 'Subscription payment issue',
};

export function isEmailTemplateKey(key: string): key is EmailTemplateKey {
  return (EMAIL_TEMPLATE_KEYS as readonly string[]).includes(key);
}

export function emailTemplateLabel(key: EmailTemplateKey): string {
  return EMAIL_TEMPLATE_LABELS[key];
}

/** Render allow-list entries as Mustache tokens for the editor sidebar. */
export function allowedVarsForTemplate(key: EmailTemplateKey): string[] {
  return EMAIL_TEMPLATE_ALLOWED_VARS[key].map((v) => `{{${v}}}`);
}
