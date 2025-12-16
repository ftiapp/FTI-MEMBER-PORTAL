"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";

// Loading components for different contexts
const FormSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    <div className="h-10 bg-gray-300 rounded"></div>
    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
    <div className="h-10 bg-gray-300 rounded"></div>
    <div className="h-20 bg-gray-300 rounded"></div>
  </div>
);

const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-10 bg-gray-300 rounded mb-4"></div>
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-8 bg-gray-300 rounded"></div>
      ))}
    </div>
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-300 rounded"></div>
  </div>
);

const ModalSkeleton = () => (
  <div className="animate-pulse p-6">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-300 rounded"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-4/6"></div>
    </div>
    <div className="flex gap-2 mt-6">
      <div className="h-10 bg-gray-300 rounded w-20"></div>
      <div className="h-10 bg-gray-300 rounded w-20"></div>
    </div>
  </div>
);

// Generic loading spinner
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
};

// Dynamic import wrapper with loading states
export function createLazyImport(importFunc, loadingType = "spinner", customLoader = null) {
  const LazyComponent = lazy(importFunc);

  const getLoadingComponent = () => {
    if (customLoader) return customLoader;

    switch (loadingType) {
      case "form":
        return <FormSkeleton />;
      case "table":
        return <TableSkeleton />;
      case "chart":
        return <ChartSkeleton />;
      case "modal":
        return <ModalSkeleton />;
      case "spinner":
      default:
        return <LoadingSpinner size="lg" />;
    }
  };

  const WrappedLazyComponent = (props) => (
    <Suspense fallback={getLoadingComponent()}>
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedLazyComponent.displayName = "LazyImport";
  return WrappedLazyComponent;
}

// Pre-defined lazy components for common use cases
export const LazyPDFViewer = createLazyImport(() => import("./PDFViewer"), "spinner");

export const LazyImageEditor = createLazyImport(() => import("./ImageEditor"), "spinner");

export const LazyChart = createLazyImport(() => import("./Chart"), "chart");

export const LazyDataTable = createLazyImport(() => import("./DataTable"), "table");

export const LazyModal = createLazyImport(() => import("./Modal"), "modal");

export const LazyForm = createLazyImport(() => import("./Form"), "form");

// Admin dashboard components (lazy loaded)
export const LazyAdminDashboard = createLazyImport(
  () => import("../admin/dashboard/page"),
  "spinner",
);

export const LazyMembershipRequests = createLazyImport(
  () => import("../admin/dashboard/membership-requests/page"),
  "table",
);

export const LazyUserManagement = createLazyImport(
  () => import("../admin/dashboard/users/page"),
  "table",
);

// Member dashboard components (lazy loaded)
export const LazyMemberDashboard = createLazyImport(() => import("../dashboard/page"), "spinner");

export const LazyMemberProfile = createLazyImport(() => import("../MemberDetail/page"), "form");

export const LazyDocumentUpload = createLazyImport(
  () => import("../dashboard/components/ManageDocuments"),
  "form",
);

// Membership form components (lazy loaded)
export const LazyICMembershipForm = createLazyImport(
  () => import("../membership/ic/components/ICMembershipForm"),
  "form",
);

export const LazyOCMembershipForm = createLazyImport(
  () => import("../membership/oc/components/OCMembershipForm"),
  "form",
);

export const LazyAMMembershipForm = createLazyImport(
  () => import("../membership/am/components/AMMembershipForm"),
  "form",
);

export const LazyACMembershipForm = createLazyImport(
  () => import("../membership/ac/components/ACMembershipForm"),
  "form",
);

// Hook for preloading components
export function usePreloadComponent(importFunc, trigger = false) {
  const [isPreloaded, setIsPreloaded] = useState(false);

  const preload = async () => {
    if (!isPreloaded) {
      try {
        await importFunc();
        setIsPreloaded(true);
        console.log("Component preloaded successfully");
      } catch (error) {
        console.error("Error preloading component:", error);
      }
    }
  };

  // Preload when trigger changes to true
  if (trigger && !isPreloaded) {
    preload();
  }

  return { isPreloaded, preload };
}

// Intersection Observer for lazy loading components
export function LazyOnIntersection({
  children,
  importFunc,
  fallback = <LoadingSpinner size="lg" />,
  rootMargin = "50px",
  threshold = 0.1,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [Component, setComponent] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible && !Component) {
      importFunc().then((mod) => {
        setComponent(() => mod.default);
      });
    }
  }, [isVisible, Component, importFunc]);

  return <div ref={elementRef}>{Component ? <Component /> : fallback}</div>;
}

// Progressive loading for multiple components
export function ProgressiveLoader({ components, loadingOrder = "sequential" }) {
  const [loadedComponents, setLoadedComponents] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= components.length) return;

    const loadComponent = async () => {
      try {
        const component = await components[currentIndex].importFunc();
        setLoadedComponents((prev) => ({
          ...prev,
          [currentIndex]: component.default,
        }));

        if (loadingOrder === "sequential") {
          setCurrentIndex((prev) => prev + 1);
        }
      } catch (error) {
        console.error(`Error loading component ${currentIndex}:`, error);
        if (loadingOrder === "sequential") {
          setCurrentIndex((prev) => prev + 1);
        }
      }
    };

    loadComponent();
  }, [currentIndex, components, loadingOrder]);

  // Parallel loading
  useEffect(() => {
    if (loadingOrder === "parallel") {
      components.forEach(async (component, index) => {
        try {
          const mod = await component.importFunc();
          setLoadedComponents((prev) => ({
            ...prev,
            [index]: mod.default,
          }));
        } catch (error) {
          console.error(`Error loading component ${index}:`, error);
        }
      });
    }
  }, [components, loadingOrder]);

  return (
    <div>
      {components.map((component, index) => {
        const LoadedComponent = loadedComponents[index];

        if (LoadedComponent) {
          return <LoadedComponent key={index} {...component.props} />;
        }

        return <div key={index}>{component.fallback || <LoadingSpinner size="lg" />}</div>;
      })}
    </div>
  );
}

// Error boundary for lazy loaded components
import { Component } from "react";

class LazyLoadErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Lazy load error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <p className="text-gray-600">Failed to load component</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Wrapper for lazy components with error boundary
export function SafeLazyComponent({ children, fallback }) {
  return <LazyLoadErrorBoundary fallback={fallback}>{children}</LazyLoadErrorBoundary>;
}
