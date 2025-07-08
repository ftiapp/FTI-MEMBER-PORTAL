// app/api/address/route.js
import { NextResponse } from 'next/server';

// Cache system to reduce database/memory load
let addressCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache

// Mock data for Thailand addresses
// In a real application, this would come from a database
const thailandAddresses = [
  {
    subdistrict: 'หาดใหญ่',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'คอหงส์',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'ควนลัง',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'คลองแห',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'ทุ่งตำเสา',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'ท่าข้าม',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'น้ำน้อย',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90110'
  },
  {
    subdistrict: 'บ้านพรุ',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90250'
  },
  {
    subdistrict: 'พะตง',
    district: 'หาดใหญ่',
    province: 'สงขลา',
    postalCode: '90230'
  },
  {
    subdistrict: 'ลาดกระบัง',
    district: 'ลาดกระบัง',
    province: 'กรุงเทพมหานคร',
    postalCode: '10520'
  },
  {
    subdistrict: 'คลองสามประเวศ',
    district: 'ลาดกระบัง',
    province: 'กรุงเทพมหานคร',
    postalCode: '10520'
  },
  {
    subdistrict: 'ทับยาว',
    district: 'ลาดกระบัง',
    province: 'กรุงเทพมหานคร',
    postalCode: '10520'
  },
  {
    subdistrict: 'ขุมทอง',
    district: 'ลาดกระบัง',
    province: 'กรุงเทพมหานคร',
    postalCode: '10520'
  },
  {
    subdistrict: 'สีลม',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postalCode: '10500'
  },
  {
    subdistrict: 'บางรัก',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postalCode: '10500'
  },
  {
    subdistrict: 'สุรวงศ์',
    district: 'บางรัก',
    province: 'กรุงเทพมหานคร',
    postalCode: '10500'
  },
  {
    subdistrict: 'สาทร',
    district: 'สาทร',
    province: 'กรุงเทพมหานคร',
    postalCode: '10120'
  },
  {
    subdistrict: 'ทุ่งวัดดอน',
    district: 'สาทร',
    province: 'กรุงเทพมหานคร',
    postalCode: '10120'
  },
  {
    subdistrict: 'ยานนาวา',
    district: 'สาทร',
    province: 'กรุงเทพมหานคร',
    postalCode: '10120'
  },
  {
    subdistrict: 'ทุ่งมหาเมฆ',
    district: 'สาทร',
    province: 'กรุงเทพมหานคร',
    postalCode: '10120'
  }
];

// Function to get addresses with caching
async function getAddresses() {
  // Return cached data if available and not expired
  if (addressCache && lastCacheTime && (Date.now() - lastCacheTime < CACHE_DURATION)) {
    return addressCache;
  }
  
  // In a real application, this would fetch from database
  // For now, we'll use our mock data
  addressCache = thailandAddresses;
  lastCacheTime = Date.now();
  
  return addressCache;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subDistrict = searchParams.get('subDistrict');

    if (!subDistrict) {
      return NextResponse.json([]);
    }

    // Get addresses (from cache if available)
    const addresses = await getAddresses();
    
    // Filter addresses by subdistrict (case-insensitive)
    const searchTerm = subDistrict.toLowerCase();
    
    // Use more efficient filtering with early returns when possible
    const filteredAddresses = addresses.filter(address => {
      const subdistrictLower = address.subdistrict.toLowerCase();
      return subdistrictLower.includes(searchTerm);
    });

    // Sort results - exact matches first, then by alphabetical order
    // Only sort if we have results to sort (performance optimization)
    let sortedAddresses = filteredAddresses;
    if (filteredAddresses.length > 1) {
      sortedAddresses = filteredAddresses.sort((a, b) => {
        const aLower = a.subdistrict.toLowerCase();
        const bLower = b.subdistrict.toLowerCase();
        
        // Exact matches first
        if (aLower === searchTerm) return -1;
        if (bLower === searchTerm) return 1;
        
        // Then matches that start with the search term
        const aStartsWith = aLower.startsWith(searchTerm);
        const bStartsWith = bLower.startsWith(searchTerm);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then alphabetical order
        return a.subdistrict.localeCompare(b.subdistrict, 'th');
      });
    }

    // Limit to 10 results for better performance and UX
    const limitedResults = sortedAddresses.slice(0, 10);

    return NextResponse.json(limitedResults);
  } catch (error) {
    console.error('Error in address API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
