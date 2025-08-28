-- Create table for admin invitation tokens
CREATE TABLE IF NOT EXISTS admin_invitation_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  inviter_id INT NULL,
  admin_level TINYINT NOT NULL DEFAULT 1,
  can_create TINYINT(1) NOT NULL DEFAULT 0,
  can_update TINYINT(1) NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_inviter FOREIGN KEY (inviter_id) REFERENCES admin_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_admin_invitation_email ON admin_invitation_tokens(email);
CREATE INDEX idx_admin_invitation_expires_used ON admin_invitation_tokens(expires_at, used);
