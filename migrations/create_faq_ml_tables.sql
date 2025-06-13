-- Create tables for FAQ Machine Learning
-- This will store data for the AI to learn from user interactions

-- Table for storing question embeddings and vectors
CREATE TABLE IF NOT EXISTS faq_embeddings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faq_id INT NOT NULL,
  embedding_vector TEXT NOT NULL, -- Stored as JSON array of numbers
  embedding_model VARCHAR(100) NOT NULL DEFAULT 'thai-word2vec',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faq_id) REFERENCES faqs(id) ON DELETE CASCADE
);

-- Table for tracking question patterns and variations
CREATE TABLE IF NOT EXISTS faq_patterns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  faq_id INT NOT NULL,
  pattern_text TEXT NOT NULL,
  pattern_type VARCHAR(50) NOT NULL, -- 'synonym', 'variation', 'learned'
  confidence FLOAT DEFAULT 1.0,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (faq_id) REFERENCES faqs(id) ON DELETE CASCADE
);

-- Table for tracking query performance and learning
CREATE TABLE IF NOT EXISTS faq_query_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL,
  query_text TEXT NOT NULL,
  matched_faq_id INT,
  confidence_score FLOAT,
  was_helpful BOOLEAN DEFAULT NULL, -- Feedback if available
  processing_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (matched_faq_id) REFERENCES faqs(id) ON DELETE SET NULL
);

-- Table for storing learned optimizations
CREATE TABLE IF NOT EXISTS faq_optimizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  optimization_type VARCHAR(50) NOT NULL, -- 'keyword', 'pattern', 'threshold'
  parameter_name VARCHAR(100) NOT NULL,
  parameter_value TEXT NOT NULL,
  performance_impact FLOAT DEFAULT 0, -- Measured impact on accuracy
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for storing n-gram statistics for better matching
CREATE TABLE IF NOT EXISTS faq_ngrams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ngram VARCHAR(255) NOT NULL,
  faq_id INT NOT NULL,
  frequency INT DEFAULT 1,
  importance_score FLOAT DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY (ngram, faq_id),
  FOREIGN KEY (faq_id) REFERENCES faqs(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_faq_patterns_faq_id ON faq_patterns(faq_id);
CREATE INDEX idx_faq_query_logs_session_id ON faq_query_logs(session_id);
CREATE INDEX idx_faq_query_logs_matched_faq_id ON faq_query_logs(matched_faq_id);
CREATE INDEX idx_faq_ngrams_ngram ON faq_ngrams(ngram);
CREATE INDEX idx_faq_ngrams_faq_id ON faq_ngrams(faq_id);
