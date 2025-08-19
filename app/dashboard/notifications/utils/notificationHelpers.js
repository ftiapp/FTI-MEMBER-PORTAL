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
  
  // Format notification message: shorten, clean, and emphasize key fields
  export const formatNotificationMessage = (message) => {
    if (!message) return '';

    let text = String(message);

    // 1) Remove the specific sentence about checking status in dashboard
    //    "ท่านสามารถตรวจสอบสถานะการสมัครได้ที่เมนู แดชบอร์ด > เอกสารสมัครสมาชิก"
    text = text.replace(
      /ท่านสามารถตรวจสอบสถานะการสมัครได้ที่เมนู\s*แดชบอร์ด\s*>\s*เอกสารสมัครสมาชิก/g,
      ''
    );

    // 2) Remove English-only parenthetical short names (e.g., company EN name in parentheses)
    //    Only remove parentheses that contain NO Thai letters but do contain Latin letters
    text = text.replace(/\s*\((?=[^ก-๙]*[A-Za-z])[^ก-๙]*\)\s*/g, ' ');

    // 3) Remove applicant name pieces like "ผู้สมัคร: ..." or "ชื่อผู้สมัคร: ..."
    text = text
      .replace(/ชื่อผู้สมัคร[:：]?\s*[^\n,，]+/g, '')
      .replace(/ผู้สมัคร[:：]?\s*[^\n,，]+/g, '');

    // Trim extra spaces created by removals
    text = text.replace(/\s{2,}/g, ' ').trim();

    // 4) Emphasize key fields (Tax ID, ID Card, Company Name)
    //    We wrap only the values to keep labels intact
    const emphasize = (labelRegex, valueGroupIndex) => {
      let changed = false;
      text = text.replace(labelRegex, (m, ...groups) => {
        const value = groups[valueGroupIndex - 1];
        changed = true;
        return m.replace(value, `<span class=\"text-blue-600 font-medium\">${value}</span>`);
      });
      return changed;
    };

    // Tax ID
    emphasize(/(เลข(?:ประจำตัว)?ผู้เสียภาษี|Tax\s*ID)[:：]?\s*([0-9\-\s]{10,})/g, 2);
    // ID Card
    emphasize(/(เลขบัตรประชาชน|ID\s*Card)[:：]?\s*([0-9\-\s]{10,})/g, 2);
    // Company name (ชื่อบริษัท ...)
    emphasize(/(ชื่อบริษัท)[:：]?\s*([^\n,，]+)/g, 2);

    // Preserve approval/rejection highlighting by injecting colored keywords
    if (text.includes('ได้รับการอนุมัติแล้ว')) {
      const parts = text.split('ได้รับการอนุมัติแล้ว');
      return (
        <span>
          {parts[0]}
          <span className="font-bold text-green-600">ได้รับการอนุมัติแล้ว</span>
          {parts[1] || ''}
        </span>
      );
    }

    if (text.includes('ถูกปฏิเสธ')) {
      const parts = text.split('ถูกปฏิเสธ');
      return (
        <span>
          {parts[0]}
          <span className="font-bold text-red-600">ถูกปฏิเสธ</span>
          {parts[1] || ''}
        </span>
      );
    }

    // For other messages, dangerouslySetInnerHTML-style content is not used; return as plain text or simple JSX span
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
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
  
    // จัดการกับการแจ้งเตือนประเภทแบบร่าง (draft)
    if (notification.type === 'draft_saved') {
      // ใช้ URL ที่มีอยู่แล้วซึ่งควรมี query parameter draftId
      console.log('Draft saved notification, using link with query params:', targetLink);
      // ไม่ต้องแก้ไข targetLink เพราะมันควรมี ?draftId=xxx อยู่แล้ว
    }
    // จัดการกับการแจ้งเตือนประเภทการอัปเดตที่อยู่
    else if (notification.type === 'address_update') {
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
    } else {
      // สำหรับประเภทการแจ้งเตือนอื่นๆ ที่ไม่ได้ระบุเฉพาะ
      console.log('Other notification type, using original link:', targetLink);
    }

    console.log('Final target link:', targetLink);

    // Normalize membership summary links
    try {
      if (targetLink) {
        // 1) Old pattern with ID: /dashboard/membership-summary/{type}/{id}
        const oldWithId = targetLink.match(/\/dashboard\/membership-summary\/(ic|am|ac|oc)\/(.+)$/i);
        if (oldWithId) {
          const t = oldWithId[1].toLowerCase();
          const id = (oldWithId[2] || '').replace(/\/$/, '');
          if (id && id.toLowerCase() !== 'undefined') {
            targetLink = `/membership/${t}/summary?id=${encodeURIComponent(id)}`;
            console.log('Rewrote old membership-summary link to new format:', targetLink);
          } else {
            const fallbackId = notification.member_code;
            targetLink = fallbackId
              ? `/membership/${t}/summary?id=${encodeURIComponent(fallbackId)}`
              : `/membership/${t}/summary`;
            console.log('Rewrote undefined ID to fallback new format:', targetLink);
          }
        }

        // 2) Old pattern without ID or with undefined explicitly captured by previous rule
        const oldBase = targetLink.match(/\/dashboard\/membership-summary\/(ic|am|ac|oc)\/?$/i);
        if (oldBase) {
          const t = oldBase[1].toLowerCase();
          const fallbackId = notification.member_code;
          targetLink = fallbackId
            ? `/membership/${t}/summary?id=${encodeURIComponent(fallbackId)}`
            : `/membership/${t}/summary`;
          console.log('Rewrote base membership-summary link to new format:', targetLink);
        }
      }
    } catch (e) {
      console.warn('Error normalizing membership-summary link:', e);
    }

    // ป้องกันการนำทางผิดพลาดโดยตรวจสอบว่า URL ไม่ว่าง
    if (!targetLink) {
      console.error('Target link is empty, defaulting to dashboard');
      targetLink = '/dashboard';
    }

    console.log('Final target link:', targetLink);
  
    // ใช้วิธีการนำทางที่แน่นอนกว่า
    try {
      // ใช้ setTimeout เพื่อให้แน่ใจว่าการนำทางเกิดขึ้นหลังจากการทำงานอื่นๆ เสร็จสิ้น
      setTimeout(() => {
        console.log('Navigating to:', targetLink);
        // ใช้ window.location.href แทน replace เพื่อให้แน่ใจว่า query parameters ไม่หายไป
        window.location.href = targetLink;
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      // กรณีเกิดข้อผิดพลาด ให้ใช้วิธีการนำทางแบบดั้งเดิม
      window.location.href = targetLink;
    }
  };