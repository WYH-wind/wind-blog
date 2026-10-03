-- 中文子串搜索依赖 pg_trgm（GIN gin_trgm_ops 索引在随后的迁移中创建）
CREATE EXTENSION IF NOT EXISTS pg_trgm;
