import React, { useState } from 'react';
import { Card, Space, Typography, Button, message, Row, Col, Statistic, Tag } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { AppstoreOutlined, MailOutlined, EyeOutlined } from '@ant-design/icons';
import CommonItems from '@/components/CommonItems';
import MailSender from '@/components/MailSender';
import { COMMON_ITEM_CATEGORIES, type CommonItem } from '@/data/commonItems';
import { CommonItemsManager } from '@/utils/commonItemsManager';
import { getItemTypeValue } from '@/utils/itemTypeMapping';

const { Title, Text, Paragraph } = Typography;

const CommonItemsTest: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<CommonItem[]>([]);
  const [mailSenderVisible, setMailSenderVisible] = useState(false);
  const [mailTargetItems, setMailTargetItems] = useState<CommonItem[]>([]);

  /**
   * 处理物品选择
   */
  const handleItemSelect = (item: CommonItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });

    // 更新使用统计
    CommonItemsManager.updateUsageStats(item.id, item.category);
  };

  /**
   * 处理发送邮件
   */
  const handleSendMail = (item: CommonItem) => {
    setMailTargetItems([item]);
    setMailSenderVisible(true);
    
    // 更新使用统计
    CommonItemsManager.updateUsageStats(item.id, item.category);
  };

  /**
   * 处理查看详情
   */
  const handleViewItem = (item: CommonItem) => {
    message.info(`查看物品详情: ${item.name} (ID: ${item.id})`);
    
    // 更新使用统计
    CommonItemsManager.updateUsageStats(item.id, item.category);
  };

  /**
   * 邮件发送成功回调
   */
  const handleMailSuccess = () => {
    message.success(`成功发送 ${mailTargetItems.length} 个物品的邮件`);
    setMailTargetItems([]);
  };

  /**
   * 关闭邮件发送弹窗
   */
  const handleMailCancel = () => {
    setMailSenderVisible(false);
    setMailTargetItems([]);
  };

  /**
   * 获取统计数据
   */
  const getStats = () => {
    const totalItems = COMMON_ITEM_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
    const usageStats = CommonItemsManager.getUsageStats();
    const totalUsage = Object.values(usageStats).reduce((sum, stat) => sum + stat.count, 0);
    const usedItems = Object.keys(usageStats).length;

    return { totalItems, totalUsage, usedItems };
  };

  const stats = getStats();

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 功能介绍 */}
        <Card title="常用物品功能测试">
          <Paragraph>
            本页面用于测试常用物品快捷访问功能，包括：
          </Paragraph>
          <ul>
            <li>按分类浏览常用物品（8个分类，共{stats.totalItems}个物品）</li>
            <li>快速搜索物品名称、ID或分类</li>
            <li>网格视图和列表视图切换</li>
            <li>物品选择和批量操作</li>
            <li>集成邮件发送功能</li>
            <li>使用统计和偏好设置</li>
          </ul>
        </Card>

        {/* 统计信息 */}
        <Card title="统计信息">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic title="总物品数量" value={stats.totalItems} />
            </Col>
            <Col span={6}>
              <Statistic title="分类数量" value={COMMON_ITEM_CATEGORIES.length} />
            </Col>
            <Col span={6}>
              <Statistic title="使用过的物品" value={stats.usedItems} />
            </Col>
            <Col span={6}>
              <Statistic title="总使用次数" value={stats.totalUsage} />
            </Col>
          </Row>
        </Card>

        {/* 分类概览 */}
        <Card title="分类概览">
          <Space wrap>
            {COMMON_ITEM_CATEGORIES.map(category => (
              <Tag key={category.key} color={category.color}>
                <span style={{ marginRight: 4 }}>{category.icon}</span>
                {category.name} ({category.items.length})
              </Tag>
            ))}
          </Space>
        </Card>

        {/* 当前选择状态 */}
        {selectedItems.length > 0 && (
          <Card title="当前选择" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>已选择 {selectedItems.length} 个物品：</Text>
              <Space wrap>
                {selectedItems.map(item => (
                  <Tag key={item.id} color="blue">
                    {item.name}
                  </Tag>
                ))}
              </Space>
              <Button
                type="primary"
                icon={<MailOutlined />}
                onClick={() => {
                  setMailTargetItems(selectedItems);
                  setMailSenderVisible(true);
                }}
              >
                批量发送邮件
              </Button>
            </Space>
          </Card>
        )}

        {/* 常用物品组件 */}
        <Card title="常用物品" extra={<AppstoreOutlined />}>
          <CommonItems
            onItemSelect={handleItemSelect}
            onItemSendMail={handleSendMail}
            onItemView={handleViewItem}
            selectedItems={selectedItems}
            showActions={true}
          />
        </Card>

        {/* 测试说明 */}
        <Card title="测试说明">
          <Title level={5}>测试步骤：</Title>
          <ol>
            <li>点击分类按钮浏览不同类型的物品</li>
            <li>使用搜索框查找特定物品</li>
            <li>切换网格视图和列表视图</li>
            <li>点击物品进行选择（支持多选）</li>
            <li>使用物品操作按钮（查看详情、发送邮件）</li>
            <li>测试批量发送邮件功能</li>
            <li>点击设置按钮配置偏好</li>
          </ol>

          <Title level={5}>验证要点：</Title>
          <ul>
            <li>分类切换是否正常</li>
            <li>搜索功能是否准确</li>
            <li>视图切换是否流畅</li>
            <li>物品选择状态是否正确</li>
            <li>邮件发送是否成功</li>
            <li>使用统计是否更新</li>
            <li>设置保存是否生效</li>
          </ul>

          <Title level={5}>性能测试：</Title>
          <ul>
            <li>大量物品渲染性能</li>
            <li>搜索响应速度</li>
            <li>分类切换速度</li>
            <li>本地存储读写性能</li>
          </ul>
        </Card>
      </Space>

      {/* 邮件发送组件 */}
      <MailSender
        visible={mailSenderVisible}
        onCancel={handleMailCancel}
        onSuccess={handleMailSuccess}
        prefilledItems={mailTargetItems.map(item => ({
          itemId: item.id,
          itemName: item.name,
          itemType: getItemTypeValue(item.type),
          count: 1,
        }))}
        title={`测试邮件发送 - ${mailTargetItems.length === 1 ? mailTargetItems[0]?.name : `${mailTargetItems.length}个物品`}`}
      />
    </PageContainer>
  );
};

export default CommonItemsTest;
