import React, { useState, useCallback, useMemo } from 'react';
import { Select, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import { searchItems } from '@/services/dnf-admin/daItemController';

interface ItemSelectorProps {
  value?: string | number;
  onChange?: (value: string | number, option?: any) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  allowClear?: boolean;
}

const ItemSelector: React.FC<ItemSelectorProps> = ({
  value,
  onChange,
  placeholder = "请输入物品名称搜索（至少2个字符）",
  disabled = false,
  style,
  allowClear = true,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<any[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState<string>('');

  /**
   * 搜索物品（无缓存，直接调用API）
   */
  const searchItemsDirectly = useCallback(async (keyword: string) => {
    console.log('ItemSelector - 开始搜索:', keyword);

    try {
      setLoading(true);
      console.log('ItemSelector - 发起API请求:', {
        keyword: keyword.trim(),
        current: 1,
        pageSize: 50,
      });

      const response = await searchItems({
        keyword: keyword.trim(),
        current: 1,
        pageSize: 50,
      });

      console.log('ItemSelector - API响应:', response);

      if (response.success && response.data) {
        // 修复：后端返回的是直接的数组，不是分页对象
        const items = Array.isArray(response.data) ? response.data : [];
        console.log('ItemSelector - 解析到的物品数据:', items);

        // 格式化选项
        const formattedOptions = items.map(item => ({
          label: `${item.name || '未知物品'} (ID: ${item.id})`,
          value: String(item.id),
          key: String(item.id),
          item: {
            ...item,
            itemId: item.id,
            itemName: item.name,
            itemType: item.type || 1,
          },
        }));

        console.log('ItemSelector - 格式化后的选项:', formattedOptions);
        setOptions(formattedOptions);
      } else {
        console.warn('ItemSelector - API响应异常:', response);
        setOptions([]);
      }
    } catch (error) {
      console.error('ItemSelector - 搜索物品失败:', error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 防抖搜索函数 - 调整为500毫秒
   */
  const debouncedSearch = useMemo(
    () => debounce(async (keyword: string) => {
      console.log('ItemSelector - 防抖搜索触发:', keyword);
      if (keyword && keyword.length >= 2) {
        setCurrentKeyword(keyword);
        await searchItemsDirectly(keyword);
      } else {
        console.log('ItemSelector - 关键词太短，清空选项');
        setOptions([]);
        setCurrentKeyword('');
      }
    }, 500),
    [searchItemsDirectly]
  );

  /**
   * 处理搜索
   */
  const handleSearch = (value: string) => {
    console.log('ItemSelector - 搜索输入:', value);
    debouncedSearch(value);
  };

  /**
   * 处理选择
   */
  const handleChange = (selectedValue: string | number, option?: any) => {
    onChange?.(selectedValue, option);
  };

  // 组件卸载时清理防抖函数
  React.useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <Select
      value={value}
      onChange={handleChange}
      onSearch={handleSearch}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      allowClear={allowClear}
      showSearch
      filterOption={false}
      suffixIcon={loading ? <LoadingOutlined /> : undefined}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      optionLabelProp="label"
      listHeight={400}
      virtual={false}
      notFoundContent={
        loading ? (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <Spin size="small" />
            <span style={{ marginLeft: 8 }}>搜索中...</span>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px', color: '#999' }}>
            {currentKeyword ? `未找到包含"${currentKeyword}"的物品` : '请输入至少2个字符开始搜索'}
          </div>
        )
      }
      options={options}
      onDropdownVisibleChange={(open) => {
        console.log('ItemSelector - 下拉框状态变化:', open, '当前选项数量:', options.length);
        if (open && options.length > 0) {
          console.log('ItemSelector - 下拉框打开，选项详情:', options);
        }
      }}
      onFocus={() => {
        console.log('ItemSelector - 获得焦点，当前选项:', options);
      }}
    />
  );
};

export default ItemSelector;
