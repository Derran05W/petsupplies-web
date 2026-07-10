/**
 * Homepage copy that does not yet have a home in the admin console.
 *
 * The hero (eyebrow / headline / subhead / image / CTAs), brand values,
 * featured products, and category rows all stay admin-driven via
 * `GET /site/settings` and friends — this module only holds the copy the
 * boutique redesign introduced on top of those. Everything is a plain
 * string (wrap a word in `*asterisks*` for the italic display emphasis),
 * so wiring a section to a future settings field means swapping one input.
 *
 * Source design: design-references/aileens-boutique-mockup.html
 */
export const HOME_CONTENT = {
  /** Phrases scrolled in the marquee band; a live free-shipping label is prepended. */
  marqueeItems: [
    'Honest food',
    'Small-batch treats',
    'Toys that last',
    'For dogs & cats',
    'Picked by hand',
  ],

  story: {
    kicker: 'Why we started',
    heading:
      'Dinner is a love language — *theirs* just happens to involve a lot of tail-wagging.',
    body: "Aileen's began the way most good pet stores do: with one demanding pet, a lot of returned kibble, and a growing list of “okay, THIS one's actually good.” This shop is that list.",
  },

  featured: {
    kicker: 'Customer favourites',
    heading: 'The current *obsessions.*',
    viewAllLabel: 'View all products',
  },

  film: {
    kicker: 'Behind the shop',
    heading: 'Thirty seconds of extremely serious quality control.',
    body: 'Every product is field-tested by the resident inspector before it earns a spot on the shelf.',
    /** Brand-film footage — autoplays muted on loop when set; the still placeholder renders until then. */
    videoSrc: '/videos/milo-jump.mp4' as string | undefined,
    poster: '/images/milo-jump-poster.jpg' as string | undefined,
    /** object-position for the footage — the action sits low in the portrait frame. */
    videoPosition: '50% 72%',
    /** Still shown full-bleed behind the copy until `videoSrc` points at real footage. */
    imageSrc: '/images/milo-with-treats.jpg' as string | undefined,
    imageAlt:
      'Milo the cocker spaniel surveying a large pile of treats and snacks awaiting inspection',
    /** object-position keeping the inspector in frame across viewport crops. */
    imagePosition: '50% 30%',
  },

  categories: {
    kicker: 'Shop by',
    heading: "Everything they've been *hinting* at.",
    /** Right-hand label on each row (the mockup showed live product counts). */
    rowCta: 'Shop now',
  },

  mascot: {
    kicker: 'Meet the boss',
    heading: 'Every product is approved by our *Chief Eating Officer.*',
    paragraphs: [
      'Nothing makes it onto these shelves without surviving a rigorous taste, sniff, and zoomies inspection. Rejected items are never spoken of again.',
      'Standards are high. Attention spans are not.',
    ],
    signature: '— Management (the four-legged one)',
    /** Portrait footage (vertical 4:5, loops muted) — the portrait still renders until set. */
    videoSrc: undefined as string | undefined,
    /** Official portrait shown in the stage until `videoSrc` points at footage. */
    imageSrc: '/images/milo-sit.jpg' as string | undefined,
    imageAlt: 'Milo the cocker spaniel sitting at attention among his toys',
    stageCaption:
      'Awaiting an official portrait. The inspector is busy inspecting.',
  },

  footerCta: {
    kicker: 'One more thing',
    heading: 'Your pet already knows what it wants.',
    ctaLabel: 'Start shopping',
    /** Rotating one-liners under the CTA; decorative, cycles every 5s. */
    jokes: [
      'Delivered by very fast squirrels.',
      'Returns policy: the cat decides.',
      'Free belly rubs with every order.* *rubs not included',
      'Now hiring: professional stick throwers.',
    ],
  },
} as const;
