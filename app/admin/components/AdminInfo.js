'use client';

function AdminInfo({ collapsed, adminData }) {
  if (!adminData) return null;
  
  return (
    <div className={`mt-2 mb-4 px-2 py-2 rounded ${collapsed ? 'hidden' : 'block'} bg-gray-900/70`}> 
      <div className="text-sm text-blue-100 font-semibold">{adminData.name || 'Admin'}</div>
      <div className="text-xs text-gray-400 font-mono">{adminData.username}</div>
      {adminData.adminLevel === 5 && (
        <div className="text-xs mt-1 bg-red-600 text-white px-1 py-0.5 rounded">Super Admin</div>
      )}
    </div>
  );
}

export default AdminInfo;