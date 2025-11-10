# Performance Optimization Guide for FTI Portal

## 1. Database Connection Optimization ✅

### Current Status

- **MySQL Pool**: Connection limit 20, maxIdle 10, idleTimeout 30s
- **MSSQL Pool**: max 10, min 0, idleTimeout 30s
- **Retry Logic**: 3-5 retries with exponential backoff
- **Connection Health Checks**: Implemented

### Optimizations Applied

```javascript
// MySQL Pool Settings (db.js)
connectionLimit: 20,
maxIdle: 10,
idleTimeout: 30000,
queueLimit: 0,
enableKeepAlive: true,
keepAliveInitialDelay: 10000,
connectTimeout: 60000

// MSSQL Pool Settings (mssql.js)
pool: {
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000,
}
```

## 2. Bundle Size Optimization

### Current Issues Identified

- Large dependency list (56 packages)
- Heavy libraries: `puppeteer`, `pdf-lib`, `@react-pdf/renderer`
- Multiple UI libraries: `lucide-react`, `react-icons`, `@heroicons/react`

### Optimization Strategies

#### A. Dynamic Imports for Heavy Components

```javascript
// Replace static imports with dynamic imports
const PDFDownloadButton = dynamic(() => import("./PDFDownloadButton"), {
  loading: () => <div>Loading PDF...</div>,
  ssr: false,
});

const ImageEditor = dynamic(() => import("./ImageEditor"), {
  loading: () => <div>Loading editor...</div>,
  ssr: false,
});
```

#### B. Route-based Code Splitting

```javascript
// Already implemented by Next.js, but ensure proper loading states
export default function MembershipPage() {
  return (
    <Suspense fallback={<MembershipSkeleton />}>
      <MembershipContent />
    </Suspense>
  );
}
```

#### C. Optimize Imports

```javascript
// Instead of importing entire library
import { User, Lock, Mail } from "lucide-react";

// Tree-shaking will only include used icons
```

## 3. Memory Management

### Current Issues

- Large form state objects (500+ lines)
- Multiple useEffect hooks without cleanup
- File uploads stored in memory

### Solutions

#### A. Form State Optimization

```javascript
// Split large form state into smaller chunks
const [personalInfo, setPersonalInfo] = useState(PERSONAL_INITIAL);
const [businessInfo, setBusinessInfo] = useState(BUSINESS_INITIAL);
const [documents, setDocuments] = useState(DOCUMENTS_INITIAL);

// Use useCallback for expensive operations
const validateForm = useCallback(() => {
  // Validation logic
}, [personalInfo, businessInfo]);
```

#### B. Cleanup Effects

```javascript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      // Process response
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    }
  };

  fetchData();

  return () => controller.abort();
}, [dependencies]);
```

## 4. Caching Strategy

### A. API Response Caching

```javascript
// Implement simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function fetchWithCache(url, options = {}) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url, options);
  const data = await response.json();

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

### B. Static Asset Caching

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};
```

## 5. Performance Monitoring

### A. Core Web Vitals Tracking

```javascript
// Add to app/layout.js
export function reportWebVitals(metric) {
  // Send to analytics service
  if (process.env.NODE_ENV === "production") {
    gtag("event", metric.name, {
      value: Math.round(metric.value),
      event_category: "Web Vitals",
    });
  }
}
```

### B. Custom Performance Metrics

```javascript
// Track component render times
function usePerformanceTracking(componentName) {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  });
}
```

## 6. Image Optimization

### Current Setup

- Using Cloudinary for image uploads
- Sharp for image processing

### Optimizations

```javascript
// Optimize image loading
import Image from "next/image";

// Use blur placeholder for better UX
<Image
  src={imageUrl}
  alt={altText}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>;
```

## 7. Server-Side Optimizations

### A. API Route Optimization

```javascript
// Implement response compression
import compression from "compression";

// Rate limiting to prevent abuse
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests
});
```

### B. Database Query Optimization

```javascript
// Use indexes for frequently queried columns
// Implement pagination for large datasets
const getMembers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT * FROM members 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `;
  return await query(query, [limit, offset]);
};
```

## 8. Client-Side Optimizations

### A. Virtual Scrolling for Large Lists

```javascript
import { FixedSizeList as List } from "react-window";

const Row = ({ index, style }) => <div style={style}>{/* Row content */}</div>;

<List height={600} itemCount={1000} itemSize={50}>
  {Row}
</List>;
```

### B. Debounce Search Inputs

```javascript
import { useDebouncedCallback } from "use-debounce";

const debouncedSearch = useDebouncedCallback((value) => {
  // Perform search
  searchAPI(value);
}, 300);

<input onChange={(e) => debouncedSearch(e.target.value)} />;
```

## 9. Monitoring & Alerting

### A. Error Tracking

```javascript
// Implement global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Send error to monitoring service
    console.error("Application error:", error, errorInfo);
  }
}
```

### B. Performance Budget

```javascript
// Set performance budgets in next.config.js
const nextConfig = {
  webpack: (config) => {
    config.performance = {
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
    };
    return config;
  },
};
```

## 10. Deployment Optimizations

### A. Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Enable production optimizations
NODE_ENV=production npm run build
```

### B. CDN Configuration

```javascript
// Configure CDN for static assets
const CDN_URL = process.env.CDN_URL || "";

const nextConfig = {
  assetPrefix: CDN_URL,
  publicRuntimeConfig: {
    cdnUrl: CDN_URL,
  },
};
```

## Implementation Priority

1. **High Priority** (Immediate)
   - Database connection optimization ✅
   - Add cleanup to useEffect hooks
   - Implement dynamic imports for heavy components

2. **Medium Priority** (Next Sprint)
   - Bundle size analysis and optimization
   - Add performance monitoring
   - Implement caching strategies

3. **Low Priority** (Future)
   - Virtual scrolling implementation
   - Advanced monitoring setup
   - CDN optimization

## Monitoring Checklist

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Bundle size < 500KB (gzipped)
- [ ] Database query time < 100ms (average)
- [ ] API response time < 200ms (95th percentile)
