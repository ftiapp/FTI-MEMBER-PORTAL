'use client';

import React from 'react';
import ProductsTabContent from './components/ProductsTabContent';

/**
 * Products page component that serves as a wrapper for the ProductsTabContent
 * This component replaces the original ProductTabContent.js
 * @param {Object} props Component properties
 */
export default function ProductsPage(props) {
  return (
    <div className="w-full">
      <ProductsTabContent 
        companyInfo={props.companyInfo}
        memberType={props.memberType}
        memberGroupCode={props.memberGroupCode}
        typeCode={props.typeCode}
      />
    </div>
  );
}
