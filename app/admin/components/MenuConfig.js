import { MenuIcons } from './MenuIcons';

export const getMenuItems = (adminLevel, pendingCounts) => {
  // เมนูสำหรับแอดมินทุกระดับ
  const commonMenuItems = [
    {
      name: 'แดชบอร์ด',
      path: '/admin/dashboard',
      icon: MenuIcons.dashboard,
    },
    {
      name: 'จัดการคำขอสมาชิกใหม่',
      path: '/admin/dashboard/membership-requests',
      icon: MenuIcons.manageAdmins,
    },
    {
      name: 'เชื่อมต่อฐานข้อมูล',
      path: '/admin/dashboard/connect-database',
      icon: MenuIcons.database,
    },
    {
      name: 'ยืนยันตัวตนสมาชิกเดิม',
      path: '/admin/dashboard/verify',
      icon: MenuIcons.verify,
      badge: pendingCounts.verifications > 0 ? pendingCounts.verifications : null,
    },
    {
      name: 'แจ้งเปลี่ยนข้อมูลส่วนตัว',
      path: '/admin/dashboard/profile-updates',
      icon: MenuIcons.edit,
      badge: pendingCounts.profileUpdates > 0 ? pendingCounts.profileUpdates : null,
    },
    {
      name: 'จัดการคำขอแก้ไขที่อยู่',
      path: '/admin/address-updates',
      icon: MenuIcons.location,
      badge: pendingCounts.addressUpdates > 0 ? pendingCounts.addressUpdates : null,
    },
    {
      name: 'แจ้งเปลี่ยนข้อมูลสินค้า',
      path: '/admin/product-updates',
      icon: MenuIcons.product,
      badge: pendingCounts.productUpdates > 0 ? pendingCounts.productUpdates : null,
    },
    {
      name: 'เปลี่ยนอีเมลผู้ใช้',
      path: '/admin/dashboard/email-change',
      icon: MenuIcons.email,
    },
    {
      name: 'ข้อความติดต่อ (สมาชิก)',
      path: '/admin/dashboard/contact-messages',
      icon: MenuIcons.message,
    },
    {
      name: 'ข้อความติดต่อ (บุคคลทั่วไป)',
      path: '/admin/dashboard/guest-messages',
      icon: MenuIcons.email,
      badge: pendingCounts.guestMessages > 0 ? pendingCounts.guestMessages : null,
    },
  ];
  
  // เมนูสำหรับแอดมินทั่วไป (admin_level < 5)
  const regularMenuItems = [
    // เมนูสำหรับแอดมินทั่วไป
  ];
  
  // เมนูสำหรับ Super Admin (admin_level 5) เท่านั้น
  const superAdminMenuItems = [
    {
      name: 'กิจกรรมของแอดมิน',
      path: '/admin/dashboard/recent-activities',
      icon: MenuIcons.activity,
    },
    {
      name: 'จัดการแอดมิน',
      path: '/admin/dashboard/manage-admins',
      icon: MenuIcons.manageAdmins,
    },
    {
      name: 'จัดการสิทธิ์แอดมิน',
      path: '/admin/dashboard/admin-permissions',
      icon: MenuIcons.permissions,
    },
    {
      name: 'การตั้งค่า',
      path: '/admin/dashboard/settings',
      icon: MenuIcons.settings,
    },
    {
      name: 'รีเซ็ตรหัสผ่าน Super Admin',
      path: '/admin/reset-password',
      icon: MenuIcons.resetPassword,
    },
  ];
  
  // แสดงค่า adminLevel ในคอนโซล
  console.log('MenuConfig - adminLevel:', adminLevel);
  console.log('MenuConfig - superAdminMenuItems:', superAdminMenuItems);
  
  // รวมเมนูตามระดับสิทธิ์
  // ถ้าเป็น superadmin (ตรวจสอบจากชื่อผู้ใช้หรือค่า adminLevel)
  const isSuperAdmin = adminLevel >= 5 || (typeof window !== 'undefined' && window.localStorage.getItem('is_super_admin') === 'true');
  
  // เพิ่มโค้ดบันทึกค่า superadmin ลงใน localStorage
  if (adminLevel >= 5 && typeof window !== 'undefined') {
    window.localStorage.setItem('is_super_admin', 'true');
  }
  
  return [
    ...commonMenuItems,
    ...regularMenuItems,
    ...(isSuperAdmin ? superAdminMenuItems : [])
  ];
};