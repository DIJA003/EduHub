/**
 * SEO and Meta tag utilities
 */

/**
 * Update document title and meta tags
 */
export function setPageMeta({ title, description, image, url, type = 'website' }) {
  // Update title
  if (title) {
    document.title = title;
    
    // Open Graph
    setMetaTag('og:title', title);
    setMetaTag('twitter:title', title);
  }

  // Update description
  if (description) {
    setMetaTag('description', description);
    setMetaTag('og:description', description);
    setMetaTag('twitter:description', description);
  }

  // Update image
  if (image) {
    setMetaTag('og:image', image);
    setMetaTag('twitter:image', image);
  }

  // Update URL
  if (url) {
    setMetaTag('og:url', url);
  }

  // Type
  setMetaTag('og:type', type);
  setMetaTag('twitter:card', 'summary_large_image');
}

/**
 * Helper to set meta tags
 */
function setMetaTag(property, content) {
  let element = document.querySelector(`meta[property="${property}"]`);
  
  if (!element) {
    element = document.querySelector(`meta[name="${property}"]`);
  }

  if (!element) {
    element = document.createElement('meta');
    if (property.startsWith('og:') || property.startsWith('twitter:')) {
      element.setAttribute('property', property);
    } else {
      element.setAttribute('name', property);
    }
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Structured data helpers (JSON-LD)
 */
export function addStructuredData(data) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  return script;
}

/**
 * Organization schema
 */
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EduHub',
  url: 'https://eduhub.example.com',
  logo: 'https://eduhub.example.com/logo.png',
  sameAs: [
    'https://twitter.com/eduhub',
    'https://linkedin.com/company/eduhub',
    'https://github.com/eduhub',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-xxx-xxx-xxxx',
    contactType: 'Customer Service',
  },
};

/**
 * Course schema for SEO
 */
export function createCourseSchema(course) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    url: course.url,
    image: course.image,
    provider: {
      '@type': 'Organization',
      name: 'EduHub',
      sameAs: 'https://eduhub.example.com',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      name: course.name,
      url: course.url,
      startDate: course.startDate,
      endDate: course.endDate,
      instructorName: course.instructor,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating || 0,
      ratingCount: course.ratingCount || 0,
    },
  };
}

/**
 * Breadcrumb schema
 */
export function createBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Person schema (for mentor/instructor profiles)
 */
export function createPersonSchema(person) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    description: person.bio,
    image: person.avatar,
    url: person.profileUrl,
    jobTitle: person.title,
    email: person.email,
    sameAs: person.socialLinks || [],
  };
}

/**
 * Check if page is properly optimized for SEO
 */
export function validateSEO() {
  const checks = {
    hasTitle: !!document.title && document.title.length > 0 && document.title.length <= 60,
    hasDescription: !!document.querySelector('meta[name="description"]'),
    hasOpenGraphTitle: !!document.querySelector('meta[property="og:title"]'),
    hasOpenGraphImage: !!document.querySelector('meta[property="og:image"]'),
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
    hasViewport: !!document.querySelector('meta[name="viewport"]'),
  };

  if (process.env.NODE_ENV === 'development') {
    const failed = Object.entries(checks)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (failed.length > 0) {
      console.warn('[SEO] Missing optimizations:', failed);
    }
  }

  return checks;
}

/**
 * Generate sitemap entries for a route
 */
export function createSitemapEntry(url, lastmod = new Date().toISOString(), priority = 0.8) {
  return {
    loc: url,
    lastmod: lastmod.split('T')[0], // YYYY-MM-DD format
    priority: Math.max(0, Math.min(1, priority)), // 0.0 - 1.0
    changefreq: 'weekly',
  };
}

/**
 * Add canonical link to prevent duplicate content
 */
export function setCanonical(url) {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = url;
}

/**
 * Set robots meta tag
 */
export function setRobots(directive = 'index, follow') {
  setMetaTag('robots', directive);
}
