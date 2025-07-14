-- โครงสร้างฐานข้อมูลสำหรับการสมัครสมาชิกประเภท OC (สามัญ-โรงงาน)
-- ใช้ prefix: MemberRegist_OC_

-- ตารางหลักเก็บข้อมูลการสมัครสมาชิก OC
CREATE TABLE MemberRegist_OC_Main (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT 'รหัสผู้ใช้งานที่ทำการสมัคร',
    member_code VARCHAR(20) DEFAULT NULL COMMENT 'รหัสสมาชิก (เช่น สน1)',
    company_name_th VARCHAR(255) NOT NULL COMMENT 'ชื่อบริษัทภาษาไทย',
    company_name_en VARCHAR(255) NOT NULL COMMENT 'ชื่อบริษัทภาษาอังกฤษ',
    tax_id VARCHAR(13) NOT NULL COMMENT 'เลขประจำตัวผู้เสียภาษี',
    company_email VARCHAR(255) NOT NULL COMMENT 'อีเมลบริษัท',
    company_phone VARCHAR(20) NOT NULL COMMENT 'เบอร์โทรศัพท์บริษัท',
    status TINYINT DEFAULT 0 COMMENT '0=รอพิจารณา, 1=อนุมัติ, 2=ปฏิเสธ',
    factory_type VARCHAR(20) COMMENT 'ประเภทโรงงาน (type1, type2)',
    number_of_employees INT COMMENT 'จำนวนพนักงาน',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL COMMENT 'วันที่อนุมัติ',
    approved_by INT NULL COMMENT 'รหัสแอดมินที่อนุมัติ',
    rejected_at TIMESTAMP NULL COMMENT 'วันที่ปฏิเสธ',
    rejected_by INT NULL COMMENT 'รหัสแอดมินที่ปฏิเสธ',
    rejection_reason TEXT NULL COMMENT 'เหตุผลที่ปฏิเสธ',
    UNIQUE KEY (tax_id),
    INDEX (member_code),
    INDEX (status),
    INDEX (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลที่อยู่บริษัท
CREATE TABLE MemberRegist_OC_Address (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    address_number VARCHAR(50) NOT NULL COMMENT 'เลขที่',
    moo VARCHAR(10) COMMENT 'หมู่',
    soi VARCHAR(255) COMMENT 'ซอย',
    street VARCHAR(255) COMMENT 'ถนน',
    sub_district VARCHAR(255) NOT NULL COMMENT 'ตำบล/แขวง',
    district VARCHAR(255) NOT NULL COMMENT 'อำเภอ/เขต',
    province VARCHAR(255) NOT NULL COMMENT 'จังหวัด',
    postal_code VARCHAR(5) NOT NULL COMMENT 'รหัสไปรษณีย์',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลผู้ให้ข้อมูล (Contact Person)
CREATE TABLE MemberRegist_OC_ContactPerson (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    first_name_th VARCHAR(255) NOT NULL COMMENT 'ชื่อภาษาไทย',
    last_name_th VARCHAR(255) NOT NULL COMMENT 'นามสกุลภาษาไทย',
    first_name_en VARCHAR(255) NOT NULL COMMENT 'ชื่อภาษาอังกฤษ',
    last_name_en VARCHAR(255) NOT NULL COMMENT 'นามสกุลภาษาอังกฤษ',
    position VARCHAR(255) NOT NULL COMMENT 'ตำแหน่ง',
    email VARCHAR(255) NOT NULL COMMENT 'อีเมล',
    phone VARCHAR(20) NOT NULL COMMENT 'เบอร์โทรศัพท์',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลผู้แทนบริษัท
CREATE TABLE MemberRegist_OC_Representatives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    first_name_th VARCHAR(255) NOT NULL COMMENT 'ชื่อภาษาไทย',
    last_name_th VARCHAR(255) NOT NULL COMMENT 'นามสกุลภาษาไทย',
    first_name_en VARCHAR(255) NOT NULL COMMENT 'ชื่อภาษาอังกฤษ',
    last_name_en VARCHAR(255) NOT NULL COMMENT 'นามสกุลภาษาอังกฤษ',
    position VARCHAR(255) NOT NULL COMMENT 'ตำแหน่ง',
    email VARCHAR(255) NOT NULL COMMENT 'อีเมล',
    phone VARCHAR(20) NOT NULL COMMENT 'เบอร์โทรศัพท์',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'เป็นผู้แทนหลักหรือไม่',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลประเภทธุรกิจ
CREATE TABLE MemberRegist_OC_BusinessTypes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    business_type VARCHAR(50) NOT NULL COMMENT 'รหัสประเภทธุรกิจ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE,
    UNIQUE KEY (main_id, business_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลประเภทธุรกิจอื่นๆ (กรณีเลือก "อื่นๆ")
CREATE TABLE MemberRegist_OC_BusinessTypeOther (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    detail TEXT NOT NULL COMMENT 'รายละเอียดประเภทธุรกิจอื่นๆ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลผลิตภัณฑ์/บริการ
CREATE TABLE MemberRegist_OC_Products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    name_th VARCHAR(255) NOT NULL COMMENT 'ชื่อผลิตภัณฑ์/บริการภาษาไทย',
    name_en VARCHAR(255) NOT NULL COMMENT 'ชื่อผลิตภัณฑ์/บริการภาษาอังกฤษ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลกลุ่มอุตสาหกรรม
-- หมายเหตุ: หากผู้ใช้ไม่เลือกกลุ่มใดเลย ให้เพิ่มข้อมูล default ที่ฝั่ง application โดยใช้ค่า '000' (สภาอุตสาหกรรมแห่งประเทศไทย)
-- กลุ่มอุตสาหกรรมปกติจะมีรหัสขึ้นต้นด้วย 1XX
CREATE TABLE MemberRegist_OC_IndustryGroups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    industry_group_id VARCHAR(20) NOT NULL COMMENT 'รหัสกลุ่มอุตสาหกรรม',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE,
    UNIQUE KEY (main_id, industry_group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลสภาอุตสาหกรรมจังหวัด
-- หมายเหตุ: หากผู้ใช้ไม่เลือกสภาจังหวัดใดเลย ให้เพิ่มข้อมูล default ที่ฝั่ง application โดยใช้ค่า '000' (สภาอุตสาหกรรมแห่งประเทศไทย)
-- สภาจังหวัดปกติจะมีรหัสขึ้นต้นด้วย 2XX
CREATE TABLE MemberRegist_OC_ProvinceChapters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    province_chapter_id VARCHAR(20) NOT NULL COMMENT 'รหัสสภาอุตสาหกรรมจังหวัด',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE,
    UNIQUE KEY (main_id, province_chapter_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บข้อมูลเอกสารแนบ
CREATE TABLE MemberRegist_OC_Documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    document_type VARCHAR(50) NOT NULL COMMENT 'ประเภทเอกสาร',
    file_name VARCHAR(255) NOT NULL COMMENT 'ชื่อไฟล์',
    file_path VARCHAR(255) NOT NULL COMMENT 'พาธไฟล์',
    file_size INT NOT NULL COMMENT 'ขนาดไฟล์ (bytes)',
    mime_type VARCHAR(100) NOT NULL COMMENT 'ประเภท MIME',
    cloudinary_id VARCHAR(255) COMMENT 'รหัส Cloudinary (ถ้ามี)',
    cloudinary_url VARCHAR(255) COMMENT 'URL Cloudinary (ถ้ามี)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE,
    INDEX (document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตารางเก็บประวัติการเปลี่ยนแปลงสถานะ
CREATE TABLE MemberRegist_OC_StatusLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    main_id INT NOT NULL COMMENT 'รหัสอ้างอิงตารางหลัก',
    status TINYINT NOT NULL COMMENT '0=รอพิจารณา, 1=อนุมัติ, 2=ปฏิเสธ',
    note TEXT COMMENT 'บันทึกเพิ่มเติม',
    created_by INT NOT NULL COMMENT 'รหัสผู้ใช้งานที่เปลี่ยนสถานะ',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (main_id) REFERENCES MemberRegist_OC_Main(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
