package plus.easydo.dnf.service.impl;


import cn.hutool.core.text.CharSequenceUtil;
import cn.hutool.json.JSONObject;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.spring.service.impl.ServiceImpl;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import plus.easydo.dnf.config.CacheConfig;
import plus.easydo.dnf.entity.DaItemEntity;
import plus.easydo.dnf.enums.RarityEnum;
import plus.easydo.dnf.manager.CacheManager;
import plus.easydo.dnf.manager.EnhancedCacheManager;
import plus.easydo.dnf.mapper.DaItemMapper;
import plus.easydo.dnf.qo.DaItemQo;
import plus.easydo.dnf.service.IDaItemService;
import plus.easydo.dnf.util.FToJUtil;
import plus.easydo.dnf.util.ItemReaderUtil;

import java.util.stream.Collectors;

import java.io.Serializable;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static plus.easydo.dnf.entity.table.DaItemEntityTableDef.DA_ITEM_ENTITY;

/**
 * 物品缓存 服务层实现。
 *
 * @author mybatis-flex-helper automatic generation
 * @since 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DaItemServiceImpl extends ServiceImpl<DaItemMapper, DaItemEntity> implements IDaItemService {

    private final EnhancedCacheManager enhancedCacheManager;


    @Override
    public Page<DaItemEntity> itemPage(DaItemQo daItemQo) {
        Page<DaItemEntity> page = new Page<>(daItemQo.getCurrent(), daItemQo.getPageSize());
        QueryWrapper query = query()
                .and(DA_ITEM_ENTITY.ID.eq(daItemQo.getId()))
                .and(DA_ITEM_ENTITY.NAME.like(daItemQo.getName()))
                .and(DA_ITEM_ENTITY.TYPE.like(daItemQo.getType()))
                .and(DA_ITEM_ENTITY.RARITY.like(daItemQo.getRarity()));
        return page(page, query);
    }

    @Override
    public List<DaItemEntity> listByName(String name) {
        // 构建缓存键
        String cacheKey = EnhancedCacheManager.buildItemListByNameKey(name);

        // 尝试从缓存获取
        List<DaItemEntity> cachedResult = enhancedCacheManager.getItemList(cacheKey);
        if (cachedResult != null) {
            log.debug("从缓存获取物品列表: name={}, count={}", name, cachedResult.size());
            return cachedResult;
        }

        // 缓存未命中，从数据库查询
        QueryWrapper query = query();
        if (CharSequenceUtil.isNotBlank(name)) {
            query.and(DA_ITEM_ENTITY.NAME.like(name));
        }
        // 限制查询结果数量，避免返回过多数据
        List<DaItemEntity> result = list(query.limit(50));

        // 缓存查询结果
        enhancedCacheManager.putItemList(cacheKey, result);
        log.debug("从数据库查询物品列表并缓存: name={}, count={}", name, result.size());

        return result;
    }

    @Override
    public Long importItemForJson(List<JSONObject> res) {
        log.info("开始批量导入物品信息=================》");
        res.forEach(this::importItemForJson);
        log.info("批量导入物品信息结束=================》");
        return null;
    }

    public void importItemForJson(JSONObject json) {
        Long itemId = null;
        String name = null;
        try {
            itemId = json.getLong("itemId");
            name = json.getStr("name");
            if (CharSequenceUtil.isNotBlank(name)) {
                DaItemEntity entity = new DaItemEntity();
                entity.setId(itemId);
                entity.setName(FToJUtil.FtoJ(name));
                entity.setType("自动导入");
                String rarity = json.getStr("rarity");
                if (CharSequenceUtil.isNotBlank(rarity)) {
                    entity.setRarity(RarityEnum.getByCode(Integer.valueOf(rarity)));
                }
                boolean updated = updateById(entity);
                if (!updated) {
                    save(entity);
                }
                // 更新缓存
                enhancedCacheManager.putItem(itemId, entity);
                // 清除相关列表缓存
                enhancedCacheManager.clearItemListCache();
            }
        } catch (Exception e) {
            log.warn("导入物品{},{}失败,继续导入", itemId, name);
        }
    }

    @Override
    public void importItemForMap(Map<Integer, String> itemMap) {
        log.info("开始批量导入物品信息=================》");
        itemMap.forEach((key, value) -> {
            if (key <= 2023889026) {
                return;
            }
            JSONObject res = ItemReaderUtil.readerForStr(value);
            res.set("itemId", key);
            importItemForJson(res);
        });
        log.info("批量导入物品信息结束=================》");
    }

    @PostConstruct
    @Override
    public void initItemCache() {
        log.info("开始初始化物品缓存...");
        try {
            // 分批加载数据，避免内存溢出
            long totalCount = count();
            log.info("物品总数: {}", totalCount);

            if (totalCount > 0) {
                int batchSize = 5000;
                int totalBatches = (int) Math.ceil((double) totalCount / batchSize);

                for (int i = 0; i < totalBatches; i++) {
                    int offset = i * batchSize;
                    List<DaItemEntity> batch = list(query().limit(offset, batchSize));

                    Map<Long, DaItemEntity> batchMap = batch.stream()
                            .collect(Collectors.toMap(DaItemEntity::getId, item -> item));

                    // 使用新的缓存管理器
                    enhancedCacheManager.putItems(batchMap);

                    // 同时保持旧的缓存兼容性
                    CacheManager.ITEM_INFO_CACHE.putAll(batchMap);

                    log.debug("已缓存第 {}/{} 批物品数据，本批数量: {}", i + 1, totalBatches, batch.size());
                }

                log.info("物品缓存初始化完成，总计缓存 {} 个物品", totalCount);
            }
        } catch (Exception e) {
            log.error("初始化物品缓存失败", e);
        }
    }

    @Override
    public DaItemEntity getItemInfoCache(Long itemId) {
        if (itemId == null) {
            return null;
        }

        // 优先从新缓存获取
        DaItemEntity item = enhancedCacheManager.getItem(itemId);
        if (item != null) {
            return item;
        }

        // 回退到旧缓存
        item = CacheManager.ITEM_INFO_CACHE.get(itemId);
        if (item != null) {
            // 同步到新缓存
            enhancedCacheManager.putItem(itemId, item);
        }

        return item;
    }

    /**
     * 重写保存方法，添加缓存逻辑
     */
    @Override
    public boolean save(DaItemEntity entity) {
        boolean result = super.save(entity);
        if (result && entity.getId() != null) {
            // 更新缓存
            enhancedCacheManager.putItem(entity.getId(), entity);
            CacheManager.ITEM_INFO_CACHE.put(entity.getId(), entity);
            // 清除列表缓存
            enhancedCacheManager.clearItemListCache();
            log.debug("保存物品并更新缓存: id={}, name={}", entity.getId(), entity.getName());
        }
        return result;
    }

    /**
     * 重写更新方法，添加缓存逻辑
     */
    @Override
    public boolean updateById(DaItemEntity entity) {
        boolean result = super.updateById(entity);
        if (result && entity.getId() != null) {
            // 更新缓存
            enhancedCacheManager.putItem(entity.getId(), entity);
            CacheManager.ITEM_INFO_CACHE.put(entity.getId(), entity);
            // 清除列表缓存
            enhancedCacheManager.clearItemListCache();
            log.debug("更新物品并更新缓存: id={}, name={}", entity.getId(), entity.getName());
        }
        return result;
    }

    /**
     * 重写批量删除方法，添加缓存逻辑
     */
    @Override
    public boolean removeByIds(Collection<? extends Serializable> ids) {
        boolean result = super.removeByIds(ids);
        if (result && ids != null && !ids.isEmpty()) {
            // 移除缓存
            List<Long> itemIds = ids.stream()
                    .filter(id -> id instanceof Long || id instanceof String)
                    .map(id -> id instanceof Long ? (Long) id : Long.valueOf(id.toString()))
                    .collect(Collectors.toList());

            enhancedCacheManager.removeItems(itemIds);
            itemIds.forEach(CacheManager.ITEM_INFO_CACHE::remove);
            // 清除列表缓存
            enhancedCacheManager.clearItemListCache();
            log.debug("删除物品并清除缓存: ids={}", itemIds);
        }
        return result;
    }

    /**
     * 获取所有物品（带缓存）
     */
    public List<DaItemEntity> listAll() {
        // 尝试从缓存获取
        List<DaItemEntity> cachedResult = enhancedCacheManager.getItemList(EnhancedCacheManager.ITEM_LIST_ALL_KEY);
        if (cachedResult != null) {
            log.debug("从缓存获取所有物品列表: count={}", cachedResult.size());
            return cachedResult;
        }

        // 缓存未命中，从数据库查询
        List<DaItemEntity> result = list();

        // 缓存查询结果
        enhancedCacheManager.putItemList(EnhancedCacheManager.ITEM_LIST_ALL_KEY, result);
        log.debug("从数据库查询所有物品并缓存: count={}", result.size());

        return result;
    }

    /**
     * 分页搜索物品（带缓存优化）
     */
    @Override
    public Page<DaItemEntity> searchItems(String keyword, Integer current, Integer pageSize) {
        long startTime = System.currentTimeMillis();

        // 构建缓存键
        String cacheKey = EnhancedCacheManager.buildItemSearchKey(keyword, current, pageSize);

        // 尝试从缓存获取
        Page<DaItemEntity> cachedResult = enhancedCacheManager.getItemSearchResult(cacheKey);
        if (cachedResult != null) {
            long duration = System.currentTimeMillis() - startTime;
            log.info("从缓存获取搜索结果: keyword={}, current={}, pageSize={}, total={}, duration={}ms",
                     keyword, current, pageSize, cachedResult.getTotalRow(), duration);
            return cachedResult;
        }

        // 缓存未命中，从数据库查询
        Page<DaItemEntity> page = new Page<>(current, pageSize);
        QueryWrapper query = query();

        if (CharSequenceUtil.isNotBlank(keyword)) {
            // 使用模糊搜索，支持物品名称和ID搜索
            String trimmedKeyword = keyword.trim();
            // 优先精确匹配，然后模糊匹配
            query.and(DA_ITEM_ENTITY.NAME.eq(trimmedKeyword)
                     .or(DA_ITEM_ENTITY.ID.eq(trimmedKeyword))
                     .or(DA_ITEM_ENTITY.NAME.like(trimmedKeyword))
                     .or(DA_ITEM_ENTITY.ID.like(trimmedKeyword)));
        }

        // 按相关性排序：精确匹配优先，然后按ID排序
        query.orderBy(DA_ITEM_ENTITY.ID.asc());

        long queryStartTime = System.currentTimeMillis();
        Page<DaItemEntity> result = page(page, query);
        long queryDuration = System.currentTimeMillis() - queryStartTime;

        // 缓存查询结果（只缓存前几页的结果，避免缓存过多数据）
        if (current <= 5) {
            enhancedCacheManager.putItemSearchResult(cacheKey, result);
        }

        long totalDuration = System.currentTimeMillis() - startTime;
        log.info("从数据库搜索物品: keyword={}, current={}, pageSize={}, total={}, queryTime={}ms, totalTime={}ms",
                 keyword, current, pageSize, result.getTotalRow(), queryDuration, totalDuration);

        return result;
    }
}
