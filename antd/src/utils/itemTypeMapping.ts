/**
 * 物品类型映射工具
 * 将物品的type字符串映射为邮件系统需要的数字类型
 */

export interface ItemTypeMapping {
  label: string;
  value: number;
}

// 邮件系统支持的物品类型
export const MAIL_ITEM_TYPES: ItemTypeMapping[] = [
  { label: '装备', value: 1 },
  { label: '消耗品', value: 2 },
  { label: '材料', value: 3 },
  { label: '任务材料', value: 4 },
  { label: '宠物', value: 5 },
  { label: '宠物装备', value: 6 },
  { label: '宠物消耗品', value: 7 },
  { label: '时装', value: 8 },
  { label: '副职业', value: 10 },
];

/**
 * 根据物品类型字符串获取对应的数字类型
 * @param typeString 物品类型字符串
 * @returns 对应的数字类型，默认返回1（装备）
 */
export const getItemTypeValue = (typeString?: string): number => {
  if (!typeString) return 1;

  // 创建映射表
  const typeMap: { [key: string]: number } = {
    // 装备相关
    '装备': 1,
    '武器': 1,
    '防具': 1,
    '首饰': 1,
    '特殊装备': 1,
    
    // 消耗品相关
    '消耗品': 2,
    '药水': 2,
    '食物': 2,
    '卷轴': 2,
    
    // 材料相关
    '材料': 3,
    '制作材料': 3,
    '强化材料': 3,
    '合成材料': 3,
    
    // 任务材料
    '任务材料': 4,
    '任务物品': 4,
    
    // 宠物相关
    '宠物': 5,
    '宠物装备': 6,
    '宠物消耗品': 7,
    
    // 时装相关
    '时装': 8,
    '外观': 8,
    '装扮': 8,
    
    // 副职业相关
    '副职业': 10,
    '生活技能': 10,
  };

  // 精确匹配
  if (typeMap[typeString]) {
    return typeMap[typeString];
  }

  // 模糊匹配
  const lowerTypeString = typeString.toLowerCase();
  for (const [key, value] of Object.entries(typeMap)) {
    if (lowerTypeString.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerTypeString)) {
      return value;
    }
  }

  // 默认返回装备类型
  return 1;
};

/**
 * 根据数字类型获取对应的标签
 * @param typeValue 数字类型
 * @returns 对应的标签
 */
export const getItemTypeLabel = (typeValue: number): string => {
  const type = MAIL_ITEM_TYPES.find(t => t.value === typeValue);
  return type?.label || '装备';
};

/**
 * 验证物品类型是否有效
 * @param typeValue 数字类型
 * @returns 是否有效
 */
export const isValidItemType = (typeValue: number): boolean => {
  return MAIL_ITEM_TYPES.some(t => t.value === typeValue);
};
