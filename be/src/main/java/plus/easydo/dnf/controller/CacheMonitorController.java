package plus.easydo.dnf.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import com.github.benmanes.caffeine.cache.stats.CacheStats;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import plus.easydo.dnf.manager.EnhancedCacheManager;
import plus.easydo.dnf.service.IDaItemService;
import plus.easydo.dnf.util.CachePerformanceUtil;
import plus.easydo.dnf.vo.DataResult;
import plus.easydo.dnf.vo.R;

import java.util.HashMap;
import java.util.Map;

/**
 * 缓存监控控制器
 * 提供缓存统计、管理和监控功能
 *
 * @author hliushi
 * @since 1.0.3
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cache")
@Tag(name = "缓存监控", description = "缓存统计和管理接口")
public class CacheMonitorController {

    private final EnhancedCacheManager enhancedCacheManager;
    private final IDaItemService daItemService;

    /**
     * 获取缓存统计信息
     */
    @Operation(summary = "获取缓存统计信息")
    @SaCheckPermission("cache.stats")
    @GetMapping("/stats")
    public R<Map<String, Object>> getCacheStats() {
        Map<String, Object> result = new HashMap<>();

        // 获取各个缓存的统计信息
        Map<String, CacheStats> allStats = enhancedCacheManager.getAllCacheStats();
        result.put("cacheStats", allStats);

        // 获取缓存大小信息
        Map<String, Long> sizes = enhancedCacheManager.getCacheSizes();
        result.put("cacheSizes", sizes);

        // 计算总体统计
        Map<String, Object> summary = calculateSummary(allStats);
        result.put("summary", summary);

        return DataResult.ok(result);
    }

    /**
     * 获取详细的缓存统计信息
     */
    @Operation(summary = "获取详细缓存统计")
    @SaCheckPermission("cache.stats")
    @GetMapping("/stats/detail")
    public R<Map<String, Object>> getDetailedCacheStats() {
        Map<String, Object> result = new HashMap<>();

        // 物品缓存统计
        CacheStats itemStats = enhancedCacheManager.getItemCacheStats();
        result.put("itemCache", buildDetailedStats("物品缓存", itemStats));

        // 物品列表缓存统计
        CacheStats listStats = enhancedCacheManager.getItemListCacheStats();
        result.put("itemListCache", buildDetailedStats("物品列表缓存", listStats));

        // 物品名称缓存统计
        CacheStats nameStats = enhancedCacheManager.getItemNameCacheStats();
        result.put("itemNameCache", buildDetailedStats("物品名称缓存", nameStats));

        return DataResult.ok(result);
    }

    /**
     * 清除指定缓存
     */
    @Operation(summary = "清除指定缓存")
    @SaCheckPermission("cache.clear")
    @PostMapping("/clear/{cacheType}")
    public R<String> clearCache(@PathVariable String cacheType) {
        try {
            switch (cacheType.toLowerCase()) {
                case "item":
                    enhancedCacheManager.clearItemCache();
                    log.info("手动清除物品缓存");
                    return DataResult.ok("物品缓存已清除");

                case "itemlist":
                    enhancedCacheManager.clearItemListCache();
                    log.info("手动清除物品列表缓存");
                    return DataResult.ok("物品列表缓存已清除");

                case "all":
                    enhancedCacheManager.clearAllItemCaches();
                    log.info("手动清除所有物品相关缓存");
                    return DataResult.ok("所有物品相关缓存已清除");

                default:
                    return DataResult.fail("不支持的缓存类型: " + cacheType);
            }
        } catch (Exception e) {
            log.error("清除缓存失败: cacheType={}", cacheType, e);
            return DataResult.fail("清除缓存失败: " + e.getMessage());
        }
    }

    /**
     * 手动触发缓存预热
     */
    @Operation(summary = "手动触发缓存预热")
    @SaCheckPermission("cache.warmup")
    @PostMapping("/warmup")
    public R<String> warmupCache() {
        try {
            log.info("开始手动缓存预热...");
            daItemService.initItemCache();
            log.info("缓存预热完成");
            return DataResult.ok("缓存预热完成");
        } catch (Exception e) {
            log.error("缓存预热失败", e);
            return DataResult.fail("缓存预热失败: " + e.getMessage());
        }
    }

    /**
     * 手动触发缓存清理
     */
    @Operation(summary = "手动触发缓存清理")
    @SaCheckPermission("cache.cleanup")
    @PostMapping("/cleanup")
    public R<String> cleanupCache() {
        try {
            enhancedCacheManager.cleanUp();
            return DataResult.ok("缓存清理完成");
        } catch (Exception e) {
            log.error("缓存清理失败", e);
            return DataResult.fail("缓存清理失败: " + e.getMessage());
        }
    }

    /**
     * 获取缓存健康状态
     */
    @Operation(summary = "获取缓存健康状态")
    @SaCheckPermission("cache.health")
    @GetMapping("/health")
    public R<Map<String, Object>> getCacheHealth() {
        Map<String, Object> health = new HashMap<>();

        try {
            Map<String, CacheStats> allStats = enhancedCacheManager.getAllCacheStats();
            Map<String, Long> sizes = enhancedCacheManager.getCacheSizes();

            // 计算健康指标
            boolean isHealthy = true;
            StringBuilder issues = new StringBuilder();

            // 检查命中率
            for (Map.Entry<String, CacheStats> entry : allStats.entrySet()) {
                CacheStats stats = entry.getValue();
                double hitRate = stats.hitRate();

                if (hitRate < 0.5) { // 命中率低于50%认为不健康
                    isHealthy = false;
                    issues.append(String.format("%s命中率过低(%.2f%%), ", entry.getKey(), hitRate * 100));
                }
            }

            health.put("healthy", isHealthy);
            health.put("issues", issues.toString());
            health.put("cacheStats", allStats);
            health.put("cacheSizes", sizes);
            health.put("timestamp", System.currentTimeMillis());

        } catch (Exception e) {
            health.put("healthy", false);
            health.put("error", e.getMessage());
        }

        return DataResult.ok(health);
    }

    /**
     * 计算总体统计信息
     */
    private Map<String, Object> calculateSummary(Map<String, CacheStats> allStats) {
        Map<String, Object> summary = new HashMap<>();

        long totalRequests = 0;
        long totalHits = 0;
        long totalMisses = 0;
        long totalEvictions = 0;

        for (CacheStats stats : allStats.values()) {
            totalRequests += stats.requestCount();
            totalHits += stats.hitCount();
            totalMisses += stats.missCount();
            totalEvictions += stats.evictionCount();
        }

        summary.put("totalRequests", totalRequests);
        summary.put("totalHits", totalHits);
        summary.put("totalMisses", totalMisses);
        summary.put("totalEvictions", totalEvictions);
        summary.put("overallHitRate", totalRequests > 0 ? (double) totalHits / totalRequests : 0.0);

        return summary;
    }

    /**
     * 构建详细统计信息
     */
    private Map<String, Object> buildDetailedStats(String cacheName, CacheStats stats) {
        Map<String, Object> detail = new HashMap<>();

        detail.put("name", cacheName);
        detail.put("requestCount", stats.requestCount());
        detail.put("hitCount", stats.hitCount());
        detail.put("missCount", stats.missCount());
        detail.put("hitRate", String.format("%.2f%%", stats.hitRate() * 100));
        detail.put("missRate", String.format("%.2f%%", stats.missRate() * 100));
        detail.put("loadCount", stats.loadCount());
        // detail.put("loadExceptionCount", stats.loadExceptionCount());
        detail.put("totalLoadTime", stats.totalLoadTime());
        detail.put("averageLoadPenalty", String.format("%.2f ns", stats.averageLoadPenalty()));
        detail.put("evictionCount", stats.evictionCount());

        return detail;
    }

    /**
     * 缓存性能测试
     */
    @Operation(summary = "缓存性能测试")
    @SaCheckPermission("cache.test")
    @PostMapping("/test/performance")
    public R<Map<String, Object>> testCachePerformance(
            @RequestParam(defaultValue = "1000") int requestCount,
            @RequestParam(defaultValue = "10") int concurrency) {

        Map<String, Object> result = new HashMap<>();

        try {
            // 测试物品查询性能
            CachePerformanceUtil.PerformanceTestResult itemResult =
                CachePerformanceUtil.testItemQueryPerformance(
                    daItemService, enhancedCacheManager, requestCount, concurrency);
            result.put("itemQueryTest", itemResult);

            // 测试列表查询性能
            CachePerformanceUtil.PerformanceTestResult listResult =
                CachePerformanceUtil.testListQueryPerformance(
                    daItemService, enhancedCacheManager, requestCount, concurrency);
            result.put("listQueryTest", listResult);

            return DataResult.ok(result);
        } catch (Exception e) {
            log.error("缓存性能测试失败", e);
            return DataResult.fail("性能测试失败: " + e.getMessage());
        }
    }

    /**
     * 缓存性能对比测试
     */
    @Operation(summary = "缓存性能对比测试")
    @SaCheckPermission("cache.test")
    @PostMapping("/test/compare")
    public R<String> compareCachePerformance(
            @RequestParam(defaultValue = "500") int requestCount,
            @RequestParam(defaultValue = "5") int concurrency) {

        try {
            CachePerformanceUtil.comparePerformance(
                daItemService, enhancedCacheManager, requestCount, concurrency);
            return DataResult.ok("性能对比测试完成，请查看日志");
        } catch (Exception e) {
            log.error("缓存性能对比测试失败", e);
            return DataResult.fail("性能对比测试失败: " + e.getMessage());
        }
    }
}
