'use client';

import React from 'react';
import ProductsTabContent from './components/ProductsTabContent';

/**
 * Products page component that serves as a wrapper for the ProductsTabContent
 * This component replaces the original ProductTabContent.js
 * @param {Object} props Component properties
 * @param {Object} props.companyInfo The company information object
 * @param {string} props.memberType The member type code (e.g., '000', '100', '200')
 * @param {string} props.memberGroupCode The member group code
 * @param {string} props.typeCode The type code
 */
export default function ProductsPage({ companyInfo, memberType, memberGroupCode, typeCode }) {
  return (
    <div className="w-full">
      <ProductsTabContent 
        companyInfo={companyInfo}
        memberType={memberType}
        memberGroupCode={memberGroupCode}
        typeCode={typeCode}
      />
    </div>
  );
}

ProductsPage.defaultProps = {
  companyInfo: {},
  memberType: '',
  memberGroupCode: '',
  typeCode: ''
};