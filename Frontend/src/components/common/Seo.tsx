import React, { useEffect } from 'react';

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string; // absolute or relative path
  noindex?: boolean;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  siteName?: string;
  baseUrl?: string; // e.g., https://devswap.live
};

const ensureTag = (selector: string, create: () => HTMLElement) => {
  let el = document.querySelector(selector) as HTMLElement | null;
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  return el as HTMLElement;
};

const resolveCanonical = (baseUrl: string | undefined, canonical?: string) => {
  if (!canonical) return undefined;
  try {
    // Absolute URL provided
    return new URL(canonical).toString();
  } catch {
    // Relative path provided
    const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return base ? new URL(canonical, base).toString() : canonical;
  }
};

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  canonical,
  noindex,
  ogImage,
  twitterCard = 'summary_large_image',
  siteName = 'DevSwap',
  baseUrl = (typeof window !== 'undefined' ? window.location.origin : undefined) as string | undefined,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (description) {
      const metaDesc = ensureTag("meta[name='description']", () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      });
      metaDesc.setAttribute('content', description);
    }

    const canonicalUrl = resolveCanonical(baseUrl, canonical);
    if (canonicalUrl) {
      const linkCanonical = ensureTag("link[rel='canonical']", () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      });
      linkCanonical.setAttribute('href', canonicalUrl);
    }

    const robots = ensureTag("meta[name='robots']", () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'robots');
      return m;
    });
    robots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    const ogTitle = ensureTag("meta[property='og:title']", () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:title');
      return m;
    });
    ogTitle.setAttribute('content', title || siteName);

    const ogDesc = ensureTag("meta[property='og:description']", () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:description');
      return m;
    });
    ogDesc.setAttribute('content', description || '');

    const ogType = ensureTag("meta[property='og:type']", () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:type');
      return m;
    });
    ogType.setAttribute('content', 'website');

    const ogUrl = ensureTag("meta[property='og:url']", () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:url');
      return m;
    });
    ogUrl.setAttribute('content', canonicalUrl || (typeof window !== 'undefined' ? window.location.href : ''));

    if (ogImage) {
      const ogImg = ensureTag("meta[property='og:image']", () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:image');
        return m;
      });
      ogImg.setAttribute('content', ogImage);
    }

    const ogSite = ensureTag("meta[property='og:site_name']", () => {
      const m = document.createElement('meta');
      m.setAttribute('property', 'og:site_name');
      return m;
    });
    ogSite.setAttribute('content', siteName);

    // Twitter
    const twitterC = ensureTag("meta[name='twitter:card']", () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'twitter:card');
      return m;
    });
    twitterC.setAttribute('content', twitterCard);

    const twitterTitle = ensureTag("meta[name='twitter:title']", () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'twitter:title');
      return m;
    });
    twitterTitle.setAttribute('content', title || siteName);

    const twitterDesc = ensureTag("meta[name='twitter:description']", () => {
      const m = document.createElement('meta');
      m.setAttribute('name', 'twitter:description');
      return m;
    });
    twitterDesc.setAttribute('content', description || '');

    if (ogImage) {
      const twitterImg = ensureTag("meta[name='twitter:image']", () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'twitter:image');
        return m;
      });
      twitterImg.setAttribute('content', ogImage);
    }
  }, [title, description, canonical, noindex, ogImage, twitterCard, siteName, baseUrl]);

  return null;
};

export default Seo;
