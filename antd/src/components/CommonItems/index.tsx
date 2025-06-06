import React, { useState, useMemo } from 'react';
import { 
  Card, 
  Input, 
  List, 
  Tag, 
  Button, 
  Space, 
  Tooltip, 
  Empty, 
  Badge,
  Row,
  Col,
  Typography 
} from 'antd';
import {
  SearchOutlined,
  MailOutlined,
  EyeOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { COMMON_ITEM_CATEGORIES, searchCommonItems, type CommonItem, type CommonItemCategory } from '@/data/commonItems';
import CommonItemsSettings from '@/components/CommonItemsSettings';

const { Search } = Input;
const { Text } = Typography;

interface CommonItemsProps {
  onItemSelect?: (item: CommonItem) => void;
  onItemSendMail?: (item: CommonItem) => void;
  onItemView?: (item: CommonItem) => void;
  selectedItems?: CommonItem[];
  showActions?: boolean;
  compact?: boolean;
}

const CommonItems: React.FC<CommonItemsProps> = ({
  onItemSelect,
  onItemSendMail,
  onItemView,
  selectedItems = [],
  showActions = true,
  compact = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);

  // 当前显示的物品列表
  const currentItems = useMemo(() => {
    if (searchKeyword.trim()) {
      return searchCommonItems(searchKeyword);
    }
    
    if (selectedCategory) {
      const category = COMMON_ITEM_CATEGORIES.find(cat => cat.key === selectedCategory);
      return category ? category.items : [];
    }
    
    return [];
  }, [selectedCategory, searchKeyword]);

  // 检查物品是否被选中
  const isItemSelected = (item: CommonItem) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  // 渲染分类按钮
  const renderCategoryButtons = () => (
    <Space wrap style={{ marginBottom: 16 }}>
      <Button
        type={selectedCategory === '' ? 'primary' : 'default'}
        onClick={() => {
          setSelectedCategory('');
          setSearchKeyword('');
        }}
      >
        全部分类
      </Button>
      {COMMON_ITEM_CATEGORIES.map(category => (
        <Badge key={category.key} count={category.items.length} size="small">
          <Button
            type={selectedCategory === category.key ? 'primary' : 'default'}
            onClick={() => {
              setSelectedCategory(category.key);
              setSearchKeyword('');
            }}
            style={{ borderColor: category.color }}
          >
            <span style={{ marginRight: 4 }}>{category.icon}</span>
            {category.name}
          </Button>
        </Badge>
      ))}
    </Space>
  );

  // 渲染搜索栏
  const renderSearchBar = () => (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col flex="auto">
        <Search
          placeholder="搜索物品名称、ID或分类..."
          allowClear
          enterButton={<SearchOutlined />}
          value={searchKeyword}
          onChange={(e) => {
            setSearchKeyword(e.target.value);
            if (e.target.value.trim()) {
              setSelectedCategory('');
            }
          }}
          onSearch={(value) => {
            setSearchKeyword(value);
            if (value.trim()) {
              setSelectedCategory('');
            }
          }}
        />
      </Col>
      <Col>
        <Space>
          <Button.Group>
            <Button
              type={viewMode === 'grid' ? 'primary' : 'default'}
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode('grid')}
            />
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setViewMode('list')}
            />
          </Button.Group>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setSettingsVisible(true)}
            title="设置"
          />
        </Space>
      </Col>
    </Row>
  );

  // 渲染物品操作按钮
  const renderItemActions = (item: CommonItem) => {
    if (!showActions) return [];

    const actions = [];

    if (onItemView) {
      actions.push(
        <Tooltip key="view" title="查看详情">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onItemView(item)}
          />
        </Tooltip>
      );
    }

    if (onItemSendMail) {
      actions.push(
        <Tooltip key="mail" title="发送邮件">
          <Button
            type="link"
            size="small"
            icon={<MailOutlined />}
            onClick={() => onItemSendMail(item)}
          />
        </Tooltip>
      );
    }

    return actions;
  };

  // 渲染网格视图
  const renderGridView = () => (
    <Row gutter={[16, 16]}>
      {currentItems.map(item => (
        <Col key={item.id} xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            size="small"
            hoverable
            className={isItemSelected(item) ? 'selected-item' : ''}
            onClick={() => onItemSelect?.(item)}
            actions={renderItemActions(item)}
            style={{
              borderColor: isItemSelected(item) ? '#1890ff' : undefined,
              backgroundColor: isItemSelected(item) ? '#f0f8ff' : undefined,
            }}
          >
            <Card.Meta
              title={
                <Tooltip title={item.name}>
                  <Text ellipsis style={{ fontSize: 12 }}>
                    {item.name}
                  </Text>
                </Tooltip>
              }
              description={
                <Space direction="vertical" size={4}>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    ID: {item.id}
                  </Text>
                  <Tag size="small" color="blue">
                    {item.rarity}
                  </Tag>
                </Space>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );

  // 渲染列表视图
  const renderListView = () => (
    <List
      dataSource={currentItems}
      renderItem={item => (
        <List.Item
          className={isItemSelected(item) ? 'selected-item' : ''}
          onClick={() => onItemSelect?.(item)}
          actions={renderItemActions(item)}
          style={{
            cursor: onItemSelect ? 'pointer' : 'default',
            backgroundColor: isItemSelected(item) ? '#f0f8ff' : undefined,
            borderLeft: isItemSelected(item) ? '3px solid #1890ff' : '3px solid transparent',
          }}
        >
          <List.Item.Meta
            title={item.name}
            description={
              <Space>
                <Text type="secondary">ID: {item.id}</Text>
                <Tag size="small" color="blue">{item.rarity}</Tag>
                <Tag size="small" color="green">{item.category}</Tag>
              </Space>
            }
          />
        </List.Item>
      )}
    />
  );

  // 渲染结果统计
  const renderResultStats = () => {
    if (currentItems.length === 0) return null;

    return (
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <Text type="secondary">
          {searchKeyword ? `搜索到 ${currentItems.length} 个物品` : 
           selectedCategory ? `${COMMON_ITEM_CATEGORIES.find(cat => cat.key === selectedCategory)?.name} - ${currentItems.length} 个物品` :
           '请选择分类或搜索物品'}
        </Text>
      </div>
    );
  };

  return (
    <div className="common-items-container">
      {/* 分类按钮 */}
      {renderCategoryButtons()}
      
      {/* 搜索栏 */}
      {renderSearchBar()}
      
      {/* 结果统计 */}
      {renderResultStats()}
      
      {/* 物品列表 */}
      {currentItems.length > 0 ? (
        viewMode === 'grid' ? renderGridView() : renderListView()
      ) : (
        <Empty
          description={
            searchKeyword ? '未找到匹配的物品' :
            selectedCategory ? '该分类暂无物品' :
            '请选择分类或搜索物品'
          }
        />
      )}

      {/* 设置弹窗 */}
      <CommonItemsSettings
        visible={settingsVisible}
        onCancel={() => setSettingsVisible(false)}
      />

      <style jsx>{`
        .common-items-container .selected-item {
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default CommonItems;
