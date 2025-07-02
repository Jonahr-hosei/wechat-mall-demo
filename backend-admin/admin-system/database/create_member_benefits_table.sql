CREATE TABLE member_benefits (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  desc TEXT,
  min_level INT NOT NULL DEFAULT 0,
  icon VARCHAR(255),
  tag VARCHAR(32),
  status INT NOT NULL DEFAULT 1, -- 1有效，0无效
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
); 