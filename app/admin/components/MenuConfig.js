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
      name: 'จัดการสมาชิก',
      path: '/admin/dashboard/members',
      icon: MenuIcons.members,
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
      name: 'แจ้งเปลี่ยนสินค้า/บริการสมาชิก',
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
      name: 'กิจกรรมล่าสุด',
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
      name: 'กิจกรรม',
      path: '/admin/dashboard/activities',
      icon: MenuIcons.list,
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
  
  // รวมเมนูตามระดับสิทธิ์
  return [
    ...commonMenuItems,
    ...regularMenuItems,
    ...(adminLevel >= 5 ? superAdminMenuItems : [])
  ];
};