import { Marquee } from '@/components/ui';
import { getFreeShippingThresholdCents } from '@/lib/config/shipping';
import { HOME_CONTENT } from '@/lib/site/home-content';
import { formatFreeShippingLabel } from '@/lib/site/shipping-copy';

/**
 * Marquee band under the hero. The live free-shipping offer (admin
 * shipping settings) leads, followed by the brand phrases — replacing the
 * old hero badge as the home of the shipping promise.
 */
export async function HomeMarquee() {
  const thresholdCents = await getFreeShippingThresholdCents();

  return (
    <Marquee
      items={[
        formatFreeShippingLabel(thresholdCents),
        ...HOME_CONTENT.marqueeItems,
      ]}
    />
  );
}
