package plus.easydo.dnf.manager;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import com.mybatisflex.core.paginate.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import plus.easydo.dnf.entity.DaItemEntity;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * 增强的缓存管理器
 * 基于 Caffeine 实现，提供 TTL、统计、监控等功能
 * 
 * @author hliushi
 * @since 1.0.3
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EnhancedCacheManager {

    private final Cache<Long, DaItemEntity> itemCache;
    private final Cache<String, Object> itemNameCache;
    private final Cache<String, Object> itemListCache;

    // 缓存键常量
    public static final String ITEM_LIST_ALL_KEY = "item:list:all";
    public static final String ITEM_LIST_BY_NAME_PREFIX = "item:list:name:";

    /**
     * 获取物品缓存
     */
    public DaItemEntity getItem(Long itemId) {
        return itemCache.getIfPresent(itemId);
    }

    /**
     * 获取物品缓存，如果不存在则通过 loader 加载
     */
    public DaItemEntity getItem(Long itemId, Function<Long, DaItemEntity> loader) {
        return itemCache.get(itemId, loader);
    }

    /**
     * 批量获取物品缓存
     */
    public Map<Long, DaItemEntity> getItems(Iterable<Long> itemIds) {
        return itemCache.getAllPresent(itemIds);
    }

    /**
     * 批量获取物品缓存，如果不存在则通过 loader 加载
     */
    public Map<Long, DaItemEntity> getItems(Iterable<Long> itemIds, Function<Iterable<? extends Long>, Map<Long, DaItemEntity>> loader) {
        return itemCache.getAll(itemIds, loader);
    }

    /**
     * 缓存单个物品
     */
    public void putItem(Long itemId, DaItemEntity item) {
        if (itemId != null && item != null) {
            itemCache.put(itemId, item);
            log.debug("缓存物品: id={}, name={}", itemId, item.getName());
        }
    }

    /**
     * 批量缓存物品
     */
    public void putItems(Map<Long, DaItemEntity> items) {
        if (items != null && !items.isEmpty()) {
            itemCache.putAll(items);
            log.info("批量缓存物品: count={}", items.size());
        }
    }

    /**
     * 移除物品缓存
     */
    public void removeItem(Long itemId) {
        if (itemId != null) {
            itemCache.invalidate(itemId);
            log.debug("移除物品缓存: id={}", itemId);
        }
    }

    /**
     * 批量移除物品缓存
     */
    public void removeItems(Iterable<Long> itemIds) {
        if (itemIds != null) {
            itemCache.invalidateAll(itemIds);
            log.debug("批量移除物品缓存: ids={}", itemIds);
        }
    }

    /**
     * 清空物品缓存
     */
    public void clearItemCache() {
        itemCache.invalidateAll();
        log.info("清空物品缓存");
    }

    /**
     * 获取物品列表缓存
     */
    @SuppressWarnings("unchecked")
    public List<DaItemEntity> getItemList(String key) {
        Object value = itemListCache.getIfPresent(key);
        return value instanceof List ? (List<DaItemEntity>) value : null;
    }

    /**
     * 获取物品列表缓存，如果不存在则通过 loader 加载
     */
    @SuppressWarnings("unchecked")
    public List<DaItemEntity> getItemList(String key, Function<String, List<DaItemEntity>> loader) {
        Object value = itemListCache.get(key, loader);
        return value instanceof List ? (List<DaItemEntity>) value : null;
    }

    /**
     * 缓存物品列表
     */
    public void putItemList(String key, List<DaItemEntity> items) {
        if (key != null && items != null) {
            itemListCache.put(key, items);
            log.debug("缓存物品列表: key={}, count={}", key, items.size());
        }
    }

    /**
     * 移除物品列表缓存
     */
    public void removeItemList(String key) {
        if (key != null) {
            itemListCache.invalidate(key);
            log.debug("移除物品列表缓存: key={}", key);
        }
    }

    /**
     * 清空物品列表缓存
     */
    public void clearItemListCache() {
        itemListCache.invalidateAll();
        log.info("清空物品列表缓存");
    }

    /**
     * 构建物品搜索缓存键
     */
    public static String buildItemSearchKey(String keyword, Integer current, Integer pageSize) {
        return String.format("item_search_%s_%d_%d",
                           keyword == null ? "all" : keyword.trim(), current, pageSize);
    }

    /**
     * 获取物品搜索结果缓存
     */
    @SuppressWarnings("unchecked")
    public Page<DaItemEntity> getItemSearchResult(String key) {
        Object value = itemListCache.getIfPresent(key);
        return value instanceof Page ? (Page<DaItemEntity>) value : null;
    }

    /**
     * 缓存物品搜索结果
     */
    public void putItemSearchResult(String key, Page<DaItemEntity> result) {
        if (key != null && result != null) {
            itemListCache.put(key, result);
            log.debug("缓存物品搜索结果: key={}, total={}", key, result.getTotalRow());
        }
    }

    /**
     * 清空所有与物品相关的缓存
     */
    public void clearAllItemCaches() {
        clearItemCache();
        clearItemListCache();
        itemNameCache.invalidateAll();
        log.info("清空所有物品相关缓存");
    }

    /**
     * 获取物品缓存统计信息
     */
    public CacheStats getItemCacheStats() {
        return itemCache.stats();
    }

    /**
     * 获取物品列表缓存统计信息
     */
    public CacheStats getItemListCacheStats() {
        return itemListCache.stats();
    }

    /**
     * 获取物品名称缓存统计信息
     */
    public CacheStats getItemNameCacheStats() {
        return itemNameCache.stats();
    }

    /**
     * 获取所有缓存统计信息
     */
    public Map<String, CacheStats> getAllCacheStats() {
        Map<String, CacheStats> stats = new ConcurrentHashMap<>();
        stats.put("itemCache", getItemCacheStats());
        stats.put("itemListCache", getItemListCacheStats());
        stats.put("itemNameCache", getItemNameCacheStats());
        return stats;
    }

    /**
     * 获取缓存大小信息
     */
    public Map<String, Long> getCacheSizes() {
        Map<String, Long> sizes = new ConcurrentHashMap<>();
        sizes.put("itemCache", itemCache.estimatedSize());
        sizes.put("itemListCache", itemListCache.estimatedSize());
        sizes.put("itemNameCache", itemNameCache.estimatedSize());
        return sizes;
    }

    /**
     * 手动触发缓存清理
     */
    public void cleanUp() {
        itemCache.cleanUp();
        itemListCache.cleanUp();
        itemNameCache.cleanUp();
        log.info("手动触发缓存清理完成");
    }

    /**
     * 预热物品缓存
     */
    public void warmupItemCache(Map<Long, DaItemEntity> items) {
        if (items != null && !items.isEmpty()) {
            putItems(items);
            log.info("物品缓存预热完成: count={}", items.size());
        }
    }

    /**
     * 构建按名称查询的缓存键
     */
    public static String buildItemListByNameKey(String name) {
        return ITEM_LIST_BY_NAME_PREFIX + (name != null ? name : "null");
    }
}
