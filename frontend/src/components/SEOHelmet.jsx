import React from "react";
import { Helmet } from "react-helmet-async";
import { seoConfig, siteSEO, getDynamicSEO } from "../config/seoConfig";

const SEOHelmet = ({ 
  page = "default", 
  customMeta = {},
  structuredData = null,
  breadcrumbs = [],
  noIndex = false 
}) => {
  const seoData = getDynamicSEO(page, customMeta);
  
  // Generate breadcrumb structured data
  const breadcrumbStructuredData = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  } : null;

  return (
    <Helmet>
      {/* 🎯 Primary Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="author" content="GovtHostelCare Team" />
      
      {/* 🤖 Robots */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : seoData.robots || "index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large"} />
      
      {/* 🔗 Canonical URL */}
      <link rel="canonical" href={seoData.url} />
      
      {/* 🌍 Open Graph / Facebook */}
      <meta property="og:type" content={seoData.type || "website"} />
      <meta property="og:url" content={seoData.url} />
      <meta property="og:title" content={seoData.title} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seoData.title} />
      <meta property="og:site_name" content={siteSEO.siteName} />
      <meta property="og:locale" content={siteSEO.locale} />
      
      {/* 🐦 Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteSEO.twitterHandle} />
      <meta name="twitter:creator" content={siteSEO.twitterHandle} />
      <meta name="twitter:url" content={seoData.url} />
      <meta name="twitter:title" content={seoData.title} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />
      <meta name="twitter:image:alt" content={seoData.title} />
      
      {/* 📱 Mobile & App */}
      <meta name="theme-color" content={siteSEO.themeColor} />
      <meta name="msapplication-TileColor" content={siteSEO.themeColor} />
      <meta name="apple-mobile-web-app-title" content={siteSEO.siteName} />
      
      {/* 🌐 Additional Meta */}
      <meta name="category" content="Education, Technology, Student Services" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="3 days" />
      <meta name="language" content="English" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      
      {/* 📊 Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* 🍞 Breadcrumb Structured Data */}
      {breadcrumbStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      )}
      
      {/* 🔍 Page-specific Structured Data */}
      {seoData.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      )}
      
      {/* ⚡ Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      
      {/* 🔒 Security */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
};

// 🎯 Pre-configured SEO components for common pages
export const HomeSEO = (props) => <SEOHelmet page="home" {...props} />;
export const AboutSEO = (props) => <SEOHelmet page="about" {...props} />;
export const RegisterSEO = (props) => <SEOHelmet page="register" {...props} />;
export const ComplaintsSEO = (props) => <SEOHelmet page="complaints" {...props} />;
export const AdminSEO = (props) => <SEOHelmet page="adminLogin" noIndex={true} {...props} />;
export const WardenSEO = (props) => <SEOHelmet page="wardenLogin" noIndex={true} {...props} />;
export const DashboardSEO = (props) => <SEOHelmet page="dashboard" noIndex={true} {...props} />;

export default SEOHelmet;
