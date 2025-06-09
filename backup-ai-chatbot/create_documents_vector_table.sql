-- MySQL alternative for vector storage and similarity search
-- Note: This requires MySQL 8.0+ for JSON functions

-- สร้างตาราง ai_documents สำหรับ MySQL
CREATE TABLE IF NOT EXISTS ai_documents (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  content TEXT NOT NULL,
  metadata JSON,
  embedding JSON NOT NULL, -- Store vector as JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ไม่ต้องสร้าง index เพิ่มเติม

-- สร้าง stored procedure สำหรับการคำนวณ cosine similarity
DELIMITER //

CREATE FUNCTION cosine_similarity(vec1 JSON, vec2 JSON)
RETURNS DECIMAL(10,8)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE dot_product DECIMAL(20,8) DEFAULT 0;
    DECLARE magnitude1 DECIMAL(20,8) DEFAULT 0;
    DECLARE magnitude2 DECIMAL(20,8) DEFAULT 0;
    DECLARE i INT DEFAULT 0;
    DECLARE len INT;
    DECLARE val1, val2 DECIMAL(10,8);
    
    SET len = JSON_LENGTH(vec1);
    
    -- คำนวณ dot product และ magnitudes
    WHILE i < len DO
        SET val1 = JSON_EXTRACT(vec1, CONCAT('$[', i, ']'));
        SET val2 = JSON_EXTRACT(vec2, CONCAT('$[', i, ']'));
        
        SET dot_product = dot_product + (val1 * val2);
        SET magnitude1 = magnitude1 + (val1 * val1);
        SET magnitude2 = magnitude2 + (val2 * val2);
        
        SET i = i + 1;
    END WHILE;
    
    -- คำนวณ cosine similarity
    IF magnitude1 = 0 OR magnitude2 = 0 THEN
        RETURN 0;
    END IF;
    
    RETURN dot_product / (SQRT(magnitude1) * SQRT(magnitude2));
END//

-- สร้าง stored procedure สำหรับการค้นหาเอกสารที่คล้ายกัน
CREATE PROCEDURE match_ai_documents(
    IN query_embedding JSON,
    IN match_threshold DECIMAL(10,8),
    IN match_count INT
)
BEGIN
    SELECT 
        id,
        content,
        metadata,
        cosine_similarity(embedding, query_embedding) AS similarity
    FROM ai_documents
    WHERE cosine_similarity(embedding, query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END//

DELIMITER ;
