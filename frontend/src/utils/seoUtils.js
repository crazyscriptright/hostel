// 🎯 SEO Utilities for GovtHostelCare
export const seoUtils = {
  // 📊 Generate structured data for different content types
  generateStructuredData: {
    organization: (data = {}) => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": data.name || "GovtHostelCare",
      "url": data.url || "https://govthostelcare.me/",
      "logo": data.logo || "https://govthostelcare.me/images/logo.png",
      "description": data.description || "Comprehensive digital hostel management platform",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi"]
      },
      ...data
    }),

    educationalOrg: (data = {}) => ({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": data.name || "GovtHostelCare Educational Platform",
      "description": data.description || "Digital platform for managing government hostel operations",
      "url": data.url || "https://govthostelcare.me/",
      "educationalLevel": "Higher Education",
      ...data
    }),

    service: (data = {}) => ({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": data.name || "Hostel Management Service",
      "description": data.description || "Complete digital hostel management solution",
      "provider": {
        "@type": "Organization",
        "name": "GovtHostelCare"
      },
      "serviceType": "Educational Technology",
      "areaServed": {
        "@type": "Country",
        "name": "India"
      },
      ...data
    }),

    breadcrumb: (items = []) => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    }),

    faq: (faqs = []) => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    })
  },

  // 🔗 Generate canonical URLs
  getCanonicalUrl: (path = '') => {
    const baseUrl = "https://govthostelcare.me";
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  },

  // 🖼️ Generate optimized image URLs
  getOptimizedImageUrl: (imagePath, options = {}) => {
    const baseUrl = "https://govthostelcare.me";
    const { width, height, quality = 80, format = 'webp' } = options;
    
    let imageUrl = `${baseUrl}${imagePath}`;
    
    // Add optimization parameters if provided
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality) params.append('q', quality);
    if (format) params.append('f', format);
    
    const paramString = params.toString();
    return paramString ? `${imageUrl}?${paramString}` : imageUrl;
  },

  // 📱 Generate social media meta tags
  generateSocialMeta: (data = {}) => ({
    // Open Graph
    'og:title': data.title || 'GovtHostelCare - Complete Hostel Management System',
    'og:description': data.description || 'Comprehensive digital hostel management platform',
    'og:image': data.image || 'https://govthostelcare.me/images/og-image.jpg',
    'og:url': data.url || 'https://govthostelcare.me/',
    'og:type': data.type || 'website',
    'og:site_name': 'GovtHostelCare',
    'og:locale': 'en_IN',

    // Twitter
    'twitter:card': 'summary_large_image',
    'twitter:title': data.title || 'GovtHostelCare - Complete Hostel Management System',
    'twitter:description': data.description || 'Comprehensive digital hostel management platform',
    'twitter:image': data.image || 'https://govthostelcare.me/images/twitter-image.jpg',
    'twitter:site': '@govthostelcare',
    'twitter:creator': '@govthostelcare'
  }),

  // 🔍 SEO validation helpers
  validateSEO: {
    titleLength: (title) => title && title.length >= 30 && title.length <= 60,
    descriptionLength: (desc) => desc && desc.length >= 120 && desc.length <= 160,
    keywordCount: (keywords) => {
      if (!keywords) return false;
      const keywordArray = keywords.split(',').map(k => k.trim());
      return keywordArray.length >= 3 && keywordArray.length <= 10;
    },
    hasImage: (image) => image && image.startsWith('http'),
    hasCanonical: (url) => url && url.startsWith('https://govthostelcare.me/')
  },

  // 🏷️ Generate meta tags array for dynamic insertion
  generateMetaTags: (seoData) => {
    const tags = [];
    
    // Basic meta tags
    if (seoData.title) tags.push({ name: 'title', content: seoData.title });
    if (seoData.description) tags.push({ name: 'description', content: seoData.description });
    if (seoData.keywords) tags.push({ name: 'keywords', content: seoData.keywords });
    
    // Open Graph tags
    const socialMeta = seoUtils.generateSocialMeta(seoData);
    Object.entries(socialMeta).forEach(([property, content]) => {
      tags.push({ property, content });
    });
    
    // Additional SEO tags
    tags.push(
      { name: 'robots', content: seoData.robots || 'index, follow' },
      { name: 'author', content: 'GovtHostelCare Team' },
      { name: 'category', content: 'Education, Technology, Student Services' },
      { name: 'revisit-after', content: '3 days' },
      { name: 'language', content: 'English' },
      { name: 'geo.region', content: 'IN' },
      { name: 'geo.country', content: 'India' }
    );
    
    return tags;
  },

  // 📈 Performance optimization helpers
  performance: {
    preloadCriticalResources: () => [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'preconnect', href: 'https://www.google-analytics.com' },
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' }
    ],
    
    generatePreloadTags: (resources = []) => {
      return resources.map(resource => ({
        rel: 'preload',
        href: resource.href,
        as: resource.as || 'fetch',
        crossorigin: resource.crossorigin || false
      }));
    }
  },

  // 🌐 Internationalization helpers
  i18n: {
    generateHrefLang: (languages = []) => {
      return languages.map(lang => ({
        rel: 'alternate',
        hreflang: lang.code,
        href: `https://govthostelcare.me${lang.path || '/'}`
      }));
    },
    
    generateLanguageMeta: (currentLang = 'en') => ({
      'http-equiv': 'content-language',
      content: currentLang
    })
  }
};

// 🎯 Common SEO patterns for the application
export const commonSEOPatterns = {
  // Homepage SEO
  homepage: {
    title: "GovtHostelCare - Complete Digital Hostel Management System | Student Accommodation",
    description: "Transform government hostel operations with our comprehensive digital platform. Manage students, handle complaints, track maintenance, and streamline administration efficiently.",
    keywords: "government hostel management, digital hostel platform, student accommodation system, complaint management, hostel administration software, educational technology",
    structuredData: seoUtils.generateStructuredData.organization()
  },

  // Login pages SEO (with noindex)
  loginPage: {
    title: "Login - GovtHostelCare Portal Access",
    description: "Secure login access to GovtHostelCare management system. Access your dashboard, manage operations, and handle hostel-related activities.",
    robots: "noindex, nofollow"
  },

  // Dashboard SEO (with noindex)
  dashboardPage: {
    title: "Dashboard - GovtHostelCare Management Portal",
    description: "Access your personalized hostel management dashboard. View analytics, manage operations, and handle day-to-day hostel activities efficiently.",
    robots: "noindex, nofollow"
  }
};

export default seoUtils;
