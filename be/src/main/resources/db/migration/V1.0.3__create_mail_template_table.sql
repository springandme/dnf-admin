-- 创建邮件模板表
CREATE TABLE IF NOT EXISTS `da_mail_template` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `title` varchar(200) NOT NULL COMMENT '邮件标题',
  `content` text COMMENT '邮件内容',
  `gold` bigint(20) DEFAULT 0 COMMENT '金币数量',
  `item_config` text COMMENT '物品配置JSON',
  `creator` varchar(50) COMMENT '创建人',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `use_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `remark` varchar(500) COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_name` (`template_name`),
  KEY `idx_creator` (`creator`),
  KEY `idx_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件发送模板表';

-- 插入默认模板
INSERT INTO `da_mail_template` (`template_name`, `title`, `content`, `gold`, `item_config`, `creator`, `enabled`, `remark`) VALUES
('默认物品邮件', 'DNF Admin - 物品邮件', '这是来自DNF Admin的物品邮件，请查收。', 0, '[]', 'system', 1, '系统默认物品邮件模板'),
('金币邮件', 'DNF Admin - 金币邮件', '这是来自DNF Admin的金币邮件，请查收。', 1000000, '[]', 'system', 1, '系统默认金币邮件模板'),
('活动奖励', 'DNF Admin - 活动奖励', '恭喜您获得活动奖励，请及时查收！', 0, '[]', 'system', 1, '活动奖励邮件模板');
