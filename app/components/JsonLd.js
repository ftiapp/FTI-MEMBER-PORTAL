'use client';

export default function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "สภาอุตสาหกรรมแห่งประเทศไทย",
          "alternateName": "The Federation of Thai Industries",
          "url": "https://fti.or.th",
          "logo": "https://fti.or.th/images/logo.png",
          "sameAs": [
            "https://www.facebook.com/FTIThailand/",
            "https://twitter.com/FTI_Thailand",
            "https://www.linkedin.com/company/the-federation-of-thai-industries/"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+66-2345-1000",
            "contactType": "customer service",
            "availableLanguage": ["Thai", "English"]
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Queen Sirikit National Convention Center, Zone C, 4th Floor, 60 New Rachadapisek Road, Klongtoey",
            "addressLocality": "Bangkok",
            "addressRegion": "Bangkok",
            "postalCode": "10110",
            "addressCountry": "TH"
          }
        })
      }}
    />
  );
}
