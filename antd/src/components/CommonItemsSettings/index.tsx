import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Card,
  List,
  Button,
  Space,
  Switch,
  Select,
  InputNumber,
  message,
  Upload,
  Typography,
  Divider,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  SettingOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { CommonItemsManager, type UserPreferences } from '@/utils/commonItemsManager';
import { COMMON_ITEM_CATEGORIES } from '@/data/commonItems';

const { TabPane } = Tabs;
const { Text, Title } = Typography;
const { Option } = Select;

interface CommonItemsSettingsProps {
  visible: boolean;
  onCancel: () => void;
}

const CommonItemsSettings: React.FC<CommonItemsSettingsProps> = ({
  visible,
  onCancel,
}) => {
  const [preferences, setPreferences] = useState<UserPreferences>(
    CommonItemsManager.getUserPreferences()
  );

  /**
   * 保存设置
   */
  const handleSave = () => {
    CommonItemsManager.saveUserPreferences(preferences);
    message.success('设置已保存');
    onCancel();
  };

  /**
   * 重置设置
   */
  const handleReset = () => {
    const defaultPreferences: UserPreferences = {
      favoriteCategories: [],
      defaultViewMode: 'grid',
      itemsPerPage: 20,
      showUsageStats: true,
    };
    setPreferences(defaultPreferences);
    message.success('设置已重置');
  };

  /**
   * 导出数据
   */
  const handleExport = () => {
    try {
      const data = CommonItemsManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dnf-admin-common-items-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success('数据导出成功');
    } catch (error) {
      message.error('数据导出失败');
    }
  };

  /**
   * 导入数据
   */
  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = CommonItemsManager.importData(content);
        if (success) {
          message.success('数据导入成功');
          setPreferences(CommonItemsManager.getUserPreferences());
        } else {
          message.error('数据导入失败');
        }
      } catch (error) {
        message.error('文件格式错误');
      }
    };
    reader.readAsText(file);
    return false; // 阻止自动上传
  };

  /**
   * 清空所有数据
   */
  const handleClearAll = () => {
    Modal.confirm({
      title: '确认清空',
      content: '此操作将清空所有自定义数据，包括使用统计和偏好设置，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        CommonItemsManager.clearAllData();
        setPreferences(CommonItemsManager.getUserPreferences());
        message.success('数据已清空');
      },
    });
  };

  /**
   * 渲染基本设置
   */
  const renderBasicSettings = () => (
    <Card title="基本设置">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>默认视图模式</Text>
          <Select
            style={{ width: 200, marginLeft: 16 }}
            value={preferences.defaultViewMode}
            onChange={(value) => setPreferences({ ...preferences, defaultViewMode: value })}
          >
            <Option value="grid">网格视图</Option>
            <Option value="list">列表视图</Option>
          </Select>
        </div>

        <div>
          <Text strong>每页显示数量</Text>
          <InputNumber
            style={{ marginLeft: 16 }}
            min={10}
            max={100}
            step={10}
            value={preferences.itemsPerPage}
            onChange={(value) => setPreferences({ ...preferences, itemsPerPage: value || 20 })}
          />
        </div>

        <div>
          <Text strong>显示使用统计</Text>
          <Switch
            style={{ marginLeft: 16 }}
            checked={preferences.showUsageStats}
            onChange={(checked) => setPreferences({ ...preferences, showUsageStats: checked })}
          />
        </div>
      </Space>
    </Card>
  );

  /**
   * 渲染收藏分类设置
   */
  const renderFavoriteCategories = () => (
    <Card title="收藏分类">
      <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
        选择您常用的物品分类，这些分类将优先显示
      </Text>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="选择常用分类"
        value={preferences.favoriteCategories}
        onChange={(value) => setPreferences({ ...preferences, favoriteCategories: value })}
      >
        {COMMON_ITEM_CATEGORIES.map(category => (
          <Option key={category.key} value={category.key}>
            <span style={{ marginRight: 8 }}>{category.icon}</span>
            {category.name}
          </Option>
        ))}
      </Select>
    </Card>
  );

  /**
   * 渲染使用统计
   */
  const renderUsageStats = () => {
    const stats = CommonItemsManager.getUsageStats();
    const customItems = CommonItemsManager.getCustomItems();
    const mostUsed = CommonItemsManager.getMostUsedItems(5);
    const recentlyUsed = CommonItemsManager.getRecentlyUsedItems(5);

    const totalUsage = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
    const totalItems = Object.keys(stats).length;

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Statistic title="总使用次数" value={totalUsage} />
          </Col>
          <Col span={8}>
            <Statistic title="使用过的物品" value={totalItems} />
          </Col>
          <Col span={8}>
            <Statistic title="自定义物品" value={customItems.length} />
          </Col>
        </Row>

        <Divider />

        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="最常用物品" extra={<BarChartOutlined />}>
              <List
                size="small"
                dataSource={mostUsed}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={item.subCategory}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="最近使用物品">
              <List
                size="small"
                dataSource={recentlyUsed}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.name}
                      description={item.subCategory}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Space>
    );
  };

  /**
   * 渲染数据管理
   */
  const renderDataManagement = () => (
    <Card title="数据管理">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={5}>导出数据</Title>
          <Text type="secondary">导出您的自定义物品、使用统计和偏好设置</Text>
          <br />
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            style={{ marginTop: 8 }}
          >
            导出数据
          </Button>
        </div>

        <Divider />

        <div>
          <Title level={5}>导入数据</Title>
          <Text type="secondary">从之前导出的文件中恢复数据</Text>
          <br />
          <Upload
            accept=".json"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
              导入数据
            </Button>
          </Upload>
        </div>

        <Divider />

        <div>
          <Title level={5}>清空数据</Title>
          <Text type="secondary">清空所有自定义数据，此操作不可恢复</Text>
          <br />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleClearAll}
            style={{ marginTop: 8 }}
          >
            清空所有数据
          </Button>
        </div>
      </Space>
    </Card>
  );

  return (
    <Modal
      title={
        <span>
          <SettingOutlined style={{ marginRight: 8 }} />
          常用物品设置
        </span>
      }
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={
        <Space>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={handleReset}>重置</Button>
          <Button type="primary" onClick={handleSave}>
            保存设置
          </Button>
        </Space>
      }
    >
      <Tabs defaultActiveKey="basic">
        <TabPane tab="基本设置" key="basic">
          <Space direction="vertical" style={{ width: '100%' }}>
            {renderBasicSettings()}
            {renderFavoriteCategories()}
          </Space>
        </TabPane>
        
        <TabPane tab="使用统计" key="stats">
          {renderUsageStats()}
        </TabPane>
        
        <TabPane tab="数据管理" key="data">
          {renderDataManagement()}
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default CommonItemsSettings;
