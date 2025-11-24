// 🎯 Comprehensive SEO Configuration for GovtHostelCare
export const seoConfig = {
  default: {
    title: "GovtHostelCare - Modern Hostel Management for Students",
    description: "Comprehensive digital hostel management platform for government hostels. Streamline student accommodation, complaint handling, and administrative tasks.",
    keywords: "hostel management system, student accommodation, government hostel, complaint management, educational technology, student services, hostel administration",
    image: "https://govthostelcare.me/images/og-image.jpg",
    url: "https://govthostelcare.me/",
    type: "website"
  },
  
  home: {
    title: "GovtHostelCare - Digital Hostel Management Platform",
    description: "Transform your government hostel operations with our comprehensive digital platform. Manage students, handle complaints, track maintenance, and streamline administration.",
    keywords: "government hostel management, digital hostel platform, student accommodation system, hostel administration software, complaint management system",
    image: "https://govthostelcare.me/images/hero.png",
    url: "https://govthostelcare.me/",
    type: "website",
    structuredData: {
      "@type": "Organization",
      "name": "GovtHostelCare",
      "description": "Leading digital hostel management platform for government institutions",
      "url": "https://govthostelcare.me/",
      "logo": "https://govthostelcare.me/images/logo.png"
    }
  },
  
  about: {
    title: "About GovtHostelCare - Hostel Management Solutions",
    description: "Learn about GovtHostelCare's mission to digitize and modernize government hostel operations across India. Discover our features, team, and impact.",
    keywords: "about govthostelcare, hostel management company, educational technology, government digital solutions, hostel software provider",
    image: "https://govthostelcare.me/images/about-image.jpg",
    url: "https://govthostelcare.me/about",
    type: "website"
  },
  
  register: {
    title: "Student Registration - GovtHostelCare Portal",
    description: "Register to access your hostel account. Manage your accommodation, raise complaints, view notices, and track your hostel-related activities.",
    keywords: "student registration, hostel account, accommodation booking, student portal, hostel services",
    image: "https://govthostelcare.me/images/student-portal.jpg",
    url: "https://govthostelcare.me/register",
    type: "website"
  },
  
  complaints: {
    title: "Raise Complaint - GovtHostelCare Support",
    description: "Submit and track hostel-related complaints efficiently. Our digital complaint management system ensures quick resolution and transparent communication.",
    keywords: "hostel complaints, raise complaint, complaint management, student support, hostel issues, maintenance requests",
    image: "https://govthostelcare.me/images/complaints.jpg",
    url: "https://govthostelcare.me/raise-complaint",
    type: "website"
  },
  
  adminLogin: {
    title: "Admin Login - GovtHostelCare Administrative Portal",
    description: "Administrative access to GovtHostelCare management system. Monitor operations, manage users, view analytics, and oversee hostel activities.",
    keywords: "admin login, hostel administration, management portal, admin dashboard, hostel oversight, administrative access",
    image: "https://govthostelcare.me/images/admin-portal.jpg",
    url: "https://govthostelcare.me/admin/login",
    type: "website",
    robots: "noindex, nofollow" // Private admin area
  },
  
  wardenLogin: {
    title: "Warden Login - GovtHostelCare Staff Portal",
    description: "Warden access to manage daily hostel operations, handle complaints, monitor students, and coordinate with administration.",
    keywords: "warden login, hostel warden, staff portal, complaint handling, student monitoring, hostel operations",
    image: "https://govthostelcare.me/images/warden-portal.jpg",
    url: "https://govthostelcare.me/warden/login",
    type: "website",
    robots: "noindex, nofollow" // Private staff area
  },
  
  dashboard: {
    title: "Student Dashboard - GovtHostelCare Personal Portal",
    description: "Access your personalized hostel dashboard. View accommodation details, complaint status, notices, payments, and manage your hostel experience.",
    keywords: "student dashboard, hostel account, accommodation details, complaint status, hostel services, personal portal",
    image: "https://govthostelcare.me/images/student-dashboard.jpg",
    url: "https://govthostelcare.me/dashboard",
    type: "website",
    robots: "noindex, nofollow" // Private student area
  }
};

// 🌐 Site-wide SEO settings
export const siteSEO = {
  siteName: "GovtHostelCare",
  siteUrl: "https://govthostelcare.me",
  defaultImage: "https://govthostelcare.me/images/og-image.jpg",
  twitterHandle: "@govthostelcare",
  facebookAppId: "YOUR_FACEBOOK_APP_ID",
  locale: "en_IN",
  themeColor: "#3B82F6",
  backgroundColor: "#ffffff"
};

// 📊 Structured Data Templates
export const structuredDataTemplates = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://govthostelcare.me/#organization",
    "name": "GovtHostelCare",
    "url": "https://govthostelcare.me/",
    "logo": "https://govthostelcare.me/images/logo.png",
    "description": "Comprehensive digital hostel management platform for government hostels",
    "foundingDate": "2024",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  },
  
  website: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://govthostelcare.me/#website",
    "url": "https://govthostelcare.me/",
    "name": "GovtHostelCare",
    "description": "Modern Hostel Management for Students",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://govthostelcare.me/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
};

// 🎯 Dynamic SEO function
export const getDynamicSEO = (page, customData = {}) => {
  const baseSEO = seoConfig[page] || seoConfig.default;
  return {
    ...baseSEO,
    ...customData,
    title: customData.title || baseSEO.title,
    description: customData.description || baseSEO.description,
    url: `${siteSEO.siteUrl}${customData.path || ''}`,
    image: customData.image || baseSEO.image || siteSEO.defaultImage
  };
};
