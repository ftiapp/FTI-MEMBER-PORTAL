// Utility functions for notifications

// Format date to Thai format
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Format notification message to highlight approval/rejection status
  export const formatNotificationMessage = (message) => {
    if (!message) return '';
    
    // Check if message contains approval keywords
    if (message.includes('ได้รับการอนุมัติแล้ว')) {
      return (
        <span>
          {message.split('ได้รับการอนุมัติแล้ว')[0]}
          <span className="font-bold text-green-600">ได้รับการอนุมัติแล้ว</span>
        </span>
      );
    }
    
    // Check if message contains rejection keywords
    if (message.includes('ถูกปฏิเสธ')) {
      const parts = message.split('ถูกปฏิเสธ');
      return (
        <span>
          {parts[0]}
          <span className="font-bold text-red-600">ถูกปฏิเสธ</span>
        </span>
      );
    }
    
    return message;
  };
  
  // Get notification status badge
  export const getNotificationStatus = (message) => {
    if (!message) return null;
    
    if (message.includes('ได้รับการอนุมัติแล้ว')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          อนุมัติ
        </span>
      );
    }
    
    if (message.includes('ถูกปฏิเสธ')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ปฏิเสธ
        </span>
      );
    }
    
    return null;
  };
  
  // Get notification type text in Thai
  export const getNotificationTypeText = (type) => {
    switch (type) {
      case 'member_verification':
        return 'การยืนยันสมาชิก';
      case 'contact_reply':
        return 'การตอบกลับข้อความ';
      case 'address_update':
        return 'การอัปเดตที่อยู่';
      case 'profile_update':
        return 'การอัปเดตโปรไฟล์';
      case 'member_connection':
        return 'การเชื่อมต่อสมาชิก';
      default:
        return 'การแจ้งเตือน';
    }
  };
  
  // Handle notification click navigation
  export const handleNotificationClick = (notification) => {
    console.log('Notification data:', notification);
  
    // สร้างตัวแปรเพื่อเก็บ URL ที่จะนำทางไป
    let targetLink = notification.link;
    console.log('Initial target link:', targetLink);
  
    // จัดการกับการแจ้งเตือนประเภทการอัปเดตที่อยู่
    if (notification.type === 'address_update') {
      // ดึงข้อมูลจากฟิลด์ใหม่ที่เพิ่มในตาราง notifications
      let addrCode = notification.addr_code;
      let memberCode = notification.member_code;
      let memberType = notification.member_type;
      let memberGroupCode = notification.member_group_code;
      // ใช้ค่า '000' สำหรับ typeCode เสมอ แทนที่จะใช้ notification.type_code
      let typeCode = '000';
      let addrLang = notification.addr_lang || 'TH';
      
      console.log('Address notification raw params:', notification);
      console.log('Address notification extracted params:', { 
        addrCode, memberCode, memberType, memberGroupCode, typeCode, addrLang 
      });
      
      // ถ้าไม่มีข้อมูลในฟิลด์ใหม่ ให้พยายามดึงจากข้อความ
      if (!addrCode) {
        const addrCodeMatch = notification.message.match(/[0-9]{3}/);
        if (addrCodeMatch) addrCode = addrCodeMatch[0];
        console.log('Extracted addrCode from message:', addrCode);
      }
      
      if (!memberCode || memberCode === '000') {
        const memberCodeMatch = notification.message.match(/\[รหัสสมาชิก: ([^\]]+)\]/);
        if (memberCodeMatch && memberCodeMatch[1]) {
          memberCode = memberCodeMatch[1];
          console.log('Extracted memberCode from message:', memberCode);
        }
      }
      
      // ตั้งค่าเริ่มต้นถ้าไม่มีค่า
      if (!addrCode) addrCode = '001';
      if (!memberType) memberType = '000';
      if (!memberGroupCode) memberGroupCode = '000';
      // typeCode จะเป็น '000' เสมอ ไม่ว่าจะมีค่าหรือไม่ก็ตาม
      typeCode = '000';
      // ตั้งค่า addrLang เป็นตัวพิมพ์ใหญ่ (TH หรือ EN)
      addrLang = addrLang ? addrLang.toUpperCase() : 'TH';
      
      // ตรวจสอบสถานะของการแจ้งเตือน
      if (notification.message.includes('ถูกปฏิเสธ')) {
        // กรณีที่คำขอถูกปฏิเสธ ให้นำทางไปที่หน้า status
        targetLink = '/dashboard?tab=status';
        console.log('Rejected notification, redirecting to:', targetLink);
      } else {
        // กรณีที่คำขอได้รับการอนุมัติหรือกำลังรอการอนุมัติ
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
        if (memberCode) {
          // สร้าง URL ที่ถูกต้องโดยใช้ template string
          // เพิ่มพารามิเตอร์ lang=TH เสมอเพื่อให้แน่ใจว่าภาษาถูกต้อง
          targetLink = `/MemberDetail?memberCode=${memberCode}&memberType=${memberType}&member_group_code=${memberGroupCode}&typeCode=${typeCode}&tab=addresses&address=${addrCode}&lang=${addrLang}`;
          
          console.log('Address update notification, redirecting to:', targetLink);
        } else {
          console.warn('Missing memberCode for address update notification');
          // ถ้าไม่มี memberCode ให้ใช้ลิงก์เริ่มต้น (ถ้ามี) หรือไปที่หน้า dashboard
          targetLink = notification.link || '/dashboard';
        }
      }
    } else if (notification.type === 'member_verification') {
      // จัดการกับการแจ้งเตือนประเภทการยืนยันสมาชิก
      // ใช้ลิงก์ที่มีอยู่แล้ว หรือสร้างลิงก์ใหม่ถ้าจำเป็น
      console.log('Member verification notification, using link:', targetLink);
    }
  
    console.log('Final target link:', targetLink);
  
    // ป้องกันการนำทางผิดพลาดโดยตรวจสอบว่า URL ไม่ว่าง
    if (!targetLink) {
      console.error('Target link is empty, defaulting to dashboard');
      targetLink = '/dashboard';
    }
  
    // ใช้วิธีการนำทางที่แน่นอนกว่า
    try {
      // ใช้ setTimeout เพื่อให้แน่ใจว่าการนำทางเกิดขึ้นหลังจากการทำงานอื่นๆ เสร็จสิ้น
      setTimeout(() => {
        console.log('Navigating to:', targetLink);
        window.location.replace(targetLink);
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      // กรณีเกิดข้อผิดพลาด ให้ใช้วิธีการนำทางแบบดั้งเดิม
      window.location.href = targetLink;
    }
  };