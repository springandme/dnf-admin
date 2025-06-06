-- 物品表搜索性能优化索引
-- 为物品名称添加索引，支持模糊搜索
CREATE INDEX idx_da_item_name ON da_item(name);

-- 为物品ID添加索引（如果还没有的话）
CREATE INDEX idx_da_item_id ON da_item(id);

-- 复合索引，同时支持ID和名称搜索
CREATE INDEX idx_da_item_id_name ON da_item(id, name);

-- 如果使用MySQL，可以考虑全文索引（适用于中文搜索）
-- ALTER TABLE da_item ADD FULLTEXT(name);

-- 查看索引使用情况的查询（MySQL）
-- EXPLAIN SELECT * FROM da_item WHERE name LIKE '%关键词%' ORDER BY id LIMIT 50;

-- 统计表信息
-- SELECT COUNT(*) as total_items FROM da_item;
-- SELECT COUNT(DISTINCT name) as unique_names FROM da_item;
