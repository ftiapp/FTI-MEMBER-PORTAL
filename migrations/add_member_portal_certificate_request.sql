-- Create table to track membership certificate download requests per member_code
-- Table name: MEMBER_PORTAL_Certificate_Request

CREATE TABLE IF NOT EXISTS MEMBER_PORTAL_Certificate_Request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_code VARCHAR(50) NOT NULL,
  `order_no` INT NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  first_requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_member_code (member_code),
  KEY idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
