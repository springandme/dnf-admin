import React, { useState } from 'react';
import { Card, Button, Space, Typography, Table, message, Tag } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { MailOutlined, SendOutlined } from '@ant-design/icons';
import MailSender from '@/components/MailSender';
import { getItemTypeValue, getItemTypeLabel, MAIL_ITEM_TYPES } from '@/utils/itemTypeMapping';

const { Title, Text, Paragraph } = Typography;

// 模拟物品数据
const mockItems: API.DaItemEntity[] = [
  { id: '1001', name: '传说武器', type: '装备', rarity: '传说' },
  { id: '1002', name: '生命药水', type: '消耗品', rarity: '普通' },
  { id: '1003', name: '强化石', type: '材料', rarity: '稀有' },
  { id: '1004', name: '任务卷轴', type: '任务材料', rarity: '普通' },
  { id: '1005', name: '可爱宠物', type: '宠物', rarity: '史诗' },
  { id: '1006', name: '时装套装', type: '时装', rarity: '稀有' },
  { id: '1007', name: '副职业工具', type: '副职业', rarity: '普通' },
];

const ItemMailTest: React.FC = () => {
  const [mailSenderVisible, setMailSenderVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<API.DaItemEntity[]>([]);

  const handleSendMail = (items: API.DaItemEntity[]) => {
    setSelectedItems(items);
    setMailSenderVisible(true);
  };

  const handleMailSuccess = () => {
    message.success(`成功发送 ${selectedItems.length} 个物品的邮件`);
    setSelectedItems([]);
  };

  const handleMailCancel = () => {
    setMailSenderVisible(false);
    setSelectedItems([]);
  };

  // 物品类型映射测试数据
  const typeMappingData = mockItems.map(item => ({
    key: item.id,
    itemName: item.name,
    originalType: item.type,
    mappedValue: getItemTypeValue(item.type),
    mappedLabel: getItemTypeLabel(getItemTypeValue(item.type!)),
  }));

  const columns = [
    {
      title: '物品名称',
      dataIndex: 'itemName',
      key: 'itemName',
    },
    {
      title: '原始类型',
      dataIndex: 'originalType',
      key: 'originalType',
      render: (type: string) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '映射值',
      dataIndex: 'mappedValue',
      key: 'mappedValue',
      render: (value: number) => <Tag color="green">{value}</Tag>,
    },
    {
      title: '映射标签',
      dataIndex: 'mappedLabel',
      key: 'mappedLabel',
      render: (label: string) => <Tag color="orange">{label}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => {
        const item = mockItems.find(i => i.id === record.key);
        return (
          <Button
            type="link"
            icon={<MailOutlined />}
            onClick={() => item && handleSendMail([item])}
          >
            发送邮件
          </Button>
        );
      },
    },
  ];

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 功能介绍 */}
        <Card title="物品邮件发送功能测试">
          <Paragraph>
            本页面用于测试物品管理页面集成的邮件发送功能，包括：
          </Paragraph>
          <ul>
            <li>单个物品邮件发送</li>
            <li>批量物品邮件发送</li>
            <li>物品类型自动映射</li>
            <li>邮件内容智能生成</li>
            <li>权限控制验证</li>
          </ul>
        </Card>

        {/* 快速测试按钮 */}
        <Card title="快速测试">
          <Space wrap>
            <Button
              type="primary"
              icon={<MailOutlined />}
              onClick={() => handleSendMail([mockItems[0]])}
            >
              发送单个物品
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSendMail(mockItems.slice(0, 3))}
            >
              发送多个物品
            </Button>
            <Button
              icon={<SendOutlined />}
              onClick={() => handleSendMail(mockItems)}
            >
              发送所有物品
            </Button>
          </Space>
        </Card>

        {/* 物品类型映射测试 */}
        <Card title="物品类型映射测试">
          <Paragraph>
            以下表格展示了物品类型的映射关系，验证类型映射功能是否正确：
          </Paragraph>
          <Table
            columns={columns}
            dataSource={typeMappingData}
            pagination={false}
            size="small"
          />
        </Card>

        {/* 支持的邮件类型 */}
        <Card title="支持的邮件物品类型">
          <Space wrap>
            {MAIL_ITEM_TYPES.map(type => (
              <Tag key={type.value} color="blue">
                {type.label} ({type.value})
              </Tag>
            ))}
          </Space>
        </Card>

        {/* 测试说明 */}
        <Card title="测试说明">
          <Title level={5}>测试步骤：</Title>
          <ol>
            <li>点击上方的快速测试按钮</li>
            <li>在弹出的邮件表单中选择收件角色</li>
            <li>检查物品信息是否正确预填</li>
            <li>检查邮件标题和内容是否智能生成</li>
            <li>验证物品类型映射是否正确</li>
            <li>测试发送功能是否正常</li>
          </ol>

          <Title level={5}>验证要点：</Title>
          <ul>
            <li>物品信息预填是否准确</li>
            <li>物品类型映射是否正确</li>
            <li>邮件内容生成是否合理</li>
            <li>发送成功后的反馈是否及时</li>
            <li>错误处理是否友好</li>
          </ul>
        </Card>
      </Space>

      {/* 邮件发送组件 */}
      <MailSender
        visible={mailSenderVisible}
        onCancel={handleMailCancel}
        onSuccess={handleMailSuccess}
        prefilledItems={selectedItems.map(item => ({
          itemId: item.id!,
          itemName: item.name!,
          itemType: getItemTypeValue(item.type),
          count: 1,
        }))}
        title={`测试邮件发送 - ${selectedItems.length === 1 ? selectedItems[0]?.name : `${selectedItems.length}个物品`}`}
      />
    </PageContainer>
  );
};

export default ItemMailTest;
