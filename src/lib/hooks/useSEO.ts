import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
}

/**
 * Custom hook to manage SEO meta tags dynamically for each page
 * @param seoProps - SEO configuration for the current page
 */
export const useSEO = (seoProps: SEOProps) => {
  useEffect(() => {
    const {
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      twitterTitle,
      twitterDescription,
      twitterImage,
      canonical,
      noindex = false,
    } = seoProps;

    // Update title
    if (title) {
      document.title = title;
      updateMetaTag('name', 'title', title);
    }

    // Update description
    if (description) {
      updateMetaTag('name', 'description', description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    }

    // Update robots
    if (noindex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }

    // Update canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Open Graph tags
    if (ogTitle) {
      updateMetaTag('property', 'og:title', ogTitle);
    }
    if (ogDescription) {
      updateMetaTag('property', 'og:description', ogDescription);
    }
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
    }
    if (ogUrl) {
      updateMetaTag('property', 'og:url', ogUrl);
    }

    // Twitter Card tags
    if (twitterTitle) {
      updateMetaTag('property', 'twitter:title', twitterTitle);
    }
    if (twitterDescription) {
      updateMetaTag('property', 'twitter:description', twitterDescription);
    }
    if (twitterImage) {
      updateMetaTag('property', 'twitter:image', twitterImage);
    }

    // Cleanup function to restore defaults if needed
    return () => {
      // Reset to default title when component unmounts
      document.title = 'HirePlan - AI-Powered Recruitment Platform';
    };
  }, [seoProps]);
};

/**
 * Helper function to update or create meta tags
 */
function updateMetaTag(
  attribute: 'name' | 'property',
  attributeValue: string,
  content: string
) {
  let element = document.querySelector(
    `meta[${attribute}="${attributeValue}"]`
  ) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Helper function to update or create link tags
 */
function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(
    `link[rel="${rel}"]`
  ) as HTMLLinkElement;

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
}

/**
 * Helper function to add structured data (JSON-LD)
 */
export function addStructuredData(data: object, id: string) {
  // Remove existing structured data with same ID
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Helper function to remove structured data
 */
export function removeStructuredData(id: string) {
  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}

