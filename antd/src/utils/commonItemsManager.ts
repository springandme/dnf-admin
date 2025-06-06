/**
 * 常用物品管理工具
 * 提供本地存储、自定义分类、使用统计等功能
 */

import { CommonItem, CommonItemCategory } from '@/data/commonItems';

const STORAGE_KEYS = {
  CUSTOM_ITEMS: 'dnf_admin_custom_common_items',
  USAGE_STATS: 'dnf_admin_item_usage_stats',
  USER_PREFERENCES: 'dnf_admin_common_items_preferences',
};

export interface ItemUsageStats {
  [itemId: string]: {
    count: number;
    lastUsed: number;
    category: string;
  };
}

export interface UserPreferences {
  favoriteCategories: string[];
  defaultViewMode: 'grid' | 'list';
  itemsPerPage: number;
  showUsageStats: boolean;
}

/**
 * 常用物品管理器
 */
export class CommonItemsManager {
  /**
   * 获取自定义常用物品
   */
  static getCustomItems(): CommonItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ITEMS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('获取自定义常用物品失败:', error);
      return [];
    }
  }

  /**
   * 保存自定义常用物品
   */
  static saveCustomItems(items: CommonItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('保存自定义常用物品失败:', error);
    }
  }

  /**
   * 添加自定义常用物品
   */
  static addCustomItem(item: CommonItem): void {
    const customItems = this.getCustomItems();
    const exists = customItems.some(existing => existing.id === item.id);
    
    if (!exists) {
      customItems.push({
        ...item,
        category: '自定义',
      });
      this.saveCustomItems(customItems);
    }
  }

  /**
   * 移除自定义常用物品
   */
  static removeCustomItem(itemId: string): void {
    const customItems = this.getCustomItems();
    const filtered = customItems.filter(item => item.id !== itemId);
    this.saveCustomItems(filtered);
  }

  /**
   * 获取物品使用统计
   */
  static getUsageStats(): ItemUsageStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USAGE_STATS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('获取使用统计失败:', error);
      return {};
    }
  }

  /**
   * 更新物品使用统计
   */
  static updateUsageStats(itemId: string, category: string): void {
    try {
      const stats = this.getUsageStats();
      const now = Date.now();
      
      if (stats[itemId]) {
        stats[itemId].count += 1;
        stats[itemId].lastUsed = now;
      } else {
        stats[itemId] = {
          count: 1,
          lastUsed: now,
          category,
        };
      }
      
      localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(stats));
    } catch (error) {
      console.error('更新使用统计失败:', error);
    }
  }

  /**
   * 获取最常用的物品
   */
  static getMostUsedItems(limit: number = 10): CommonItem[] {
    const stats = this.getUsageStats();
    const customItems = this.getCustomItems();
    
    // 按使用次数排序
    const sortedStats = Object.entries(stats)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, limit);
    
    // 查找对应的物品信息
    const mostUsedItems: CommonItem[] = [];
    
    for (const [itemId, stat] of sortedStats) {
      const customItem = customItems.find(item => item.id === itemId);
      if (customItem) {
        mostUsedItems.push({
          ...customItem,
          subCategory: `使用${stat.count}次`,
        });
      }
    }
    
    return mostUsedItems;
  }

  /**
   * 获取最近使用的物品
   */
  static getRecentlyUsedItems(limit: number = 10): CommonItem[] {
    const stats = this.getUsageStats();
    const customItems = this.getCustomItems();
    
    // 按最后使用时间排序
    const sortedStats = Object.entries(stats)
      .sort(([, a], [, b]) => b.lastUsed - a.lastUsed)
      .slice(0, limit);
    
    // 查找对应的物品信息
    const recentItems: CommonItem[] = [];
    
    for (const [itemId, stat] of sortedStats) {
      const customItem = customItems.find(item => item.id === itemId);
      if (customItem) {
        recentItems.push({
          ...customItem,
          subCategory: this.formatLastUsed(stat.lastUsed),
        });
      }
    }
    
    return recentItems;
  }

  /**
   * 格式化最后使用时间
   */
  private static formatLastUsed(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚使用';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  }

  /**
   * 获取用户偏好设置
   */
  static getUserPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      const defaultPreferences: UserPreferences = {
        favoriteCategories: [],
        defaultViewMode: 'grid',
        itemsPerPage: 20,
        showUsageStats: true,
      };
      
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch (error) {
      console.error('获取用户偏好失败:', error);
      return {
        favoriteCategories: [],
        defaultViewMode: 'grid',
        itemsPerPage: 20,
        showUsageStats: true,
      };
    }
  }

  /**
   * 保存用户偏好设置
   */
  static saveUserPreferences(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.getUserPreferences();
      const updated = { ...current, ...preferences };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
    } catch (error) {
      console.error('保存用户偏好失败:', error);
    }
  }

  /**
   * 清空所有数据
   */
  static clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  }

  /**
   * 导出数据
   */
  static exportData(): string {
    const data = {
      customItems: this.getCustomItems(),
      usageStats: this.getUsageStats(),
      userPreferences: this.getUserPreferences(),
      exportTime: new Date().toISOString(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * 导入数据
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.customItems) {
        this.saveCustomItems(data.customItems);
      }
      
      if (data.usageStats) {
        localStorage.setItem(STORAGE_KEYS.USAGE_STATS, JSON.stringify(data.usageStats));
      }
      
      if (data.userPreferences) {
        this.saveUserPreferences(data.userPreferences);
      }
      
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}
