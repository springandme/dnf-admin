import React, { useState } from 'react';
import { Card, Form, Button, message, Space, Typography } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import ItemSelector from '@/components/ItemSelector';

const { Title, Text } = Typography;

const ItemSelectorTest: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState<string | number>();

  const handleSubmit = (values: any) => {
    console.log('表单值:', values);
    message.success(`选择的物品ID: ${values.itemId}`);
  };

  const handleItemChange = (value: string | number, option?: any) => {
    setSelectedItem(value);
    console.log('选择的物品:', { value, option });
  };

  return (
    <PageContainer>
      <Card title="物品选择器测试页面">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>功能说明</Title>
            <ul>
              <li>输入至少2个字符开始搜索</li>
              <li>支持物品名称和ID搜索</li>
              <li>搜索结果会被缓存5分钟</li>
              <li>支持防抖搜索，300ms延迟</li>
              <li>每次最多返回50个结果</li>
            </ul>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              label="选择物品"
              name="itemId"
              rules={[{ required: true, message: '请选择物品' }]}
            >
              <ItemSelector
                placeholder="请输入物品名称搜索..."
                onChange={handleItemChange}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  提交测试
                </Button>
                <Button onClick={() => form.resetFields()}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>

          {selectedItem && (
            <Card size="small" title="当前选择">
              <Text>物品ID: {selectedItem}</Text>
            </Card>
          )}

          <Card size="small" title="性能测试">
            <Space direction="vertical">
              <Text>测试步骤：</Text>
              <ol>
                <li>输入常见物品名称（如"剑"、"药水"等）</li>
                <li>观察搜索响应时间</li>
                <li>重复搜索相同关键词，验证缓存效果</li>
                <li>尝试搜索物品ID</li>
                <li>测试防抖功能（快速输入多个字符）</li>
              </ol>
            </Space>
          </Card>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default ItemSelectorTest;
