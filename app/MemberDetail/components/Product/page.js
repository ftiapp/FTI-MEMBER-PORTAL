'use client';

import React from 'react';
import ProductsTabContent from './components/ProductsTabContent';

/**
 * Products page component that serves as a wrapper for the ProductsTabContent
 * This component replaces the original ProductTabContent.js
 */
export default function ProductsPage({ companyInfo }) {
  return (
    <div className="w-full">
      <ProductsTabContent companyInfo={companyInfo} />
    </div>
  );
}

ProductsPage.defaultProps = {
  companyInfo: {},
};