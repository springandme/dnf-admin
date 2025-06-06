package plus.easydo.dnf.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import plus.easydo.dnf.entity.DaItemEntity;
import plus.easydo.dnf.manager.EnhancedCacheManager;
import plus.easydo.dnf.service.IDaItemService;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * 缓存性能测试工具
 * 
 * @author hliushi
 * @since 1.0.3
 */
@Slf4j
@Component
public class CachePerformanceUtil {

    /**
     * 测试缓存性能
     */
    public static class PerformanceTestResult {
        private long totalRequests;
        private long totalTime;
        private double averageTime;
        private double requestsPerSecond;
        private long cacheHits;
        private long cacheMisses;
        private double hitRate;

        // Getters and setters
        public long getTotalRequests() { return totalRequests; }
        public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }
        
        public long getTotalTime() { return totalTime; }
        public void setTotalTime(long totalTime) { this.totalTime = totalTime; }
        
        public double getAverageTime() { return averageTime; }
        public void setAverageTime(double averageTime) { this.averageTime = averageTime; }
        
        public double getRequestsPerSecond() { return requestsPerSecond; }
        public void setRequestsPerSecond(double requestsPerSecond) { this.requestsPerSecond = requestsPerSecond; }
        
        public long getCacheHits() { return cacheHits; }
        public void setCacheHits(long cacheHits) { this.cacheHits = cacheHits; }
        
        public long getCacheMisses() { return cacheMisses; }
        public void setCacheMisses(long cacheMisses) { this.cacheMisses = cacheMisses; }
        
        public double getHitRate() { return hitRate; }
        public void setHitRate(double hitRate) { this.hitRate = hitRate; }

        @Override
        public String toString() {
            return String.format(
                "PerformanceTestResult{totalRequests=%d, totalTime=%dms, averageTime=%.2fms, " +
                "requestsPerSecond=%.2f, cacheHits=%d, cacheMisses=%d, hitRate=%.2f%%}",
                totalRequests, totalTime, averageTime, requestsPerSecond, 
                cacheHits, cacheMisses, hitRate * 100
            );
        }
    }

    /**
     * 测试物品查询性能
     */
    public static PerformanceTestResult testItemQueryPerformance(
            IDaItemService itemService,
            EnhancedCacheManager cacheManager,
            int requestCount,
            int concurrency) {
        
        log.info("开始缓存性能测试: requestCount={}, concurrency={}", requestCount, concurrency);
        
        // 准备测试数据
        List<Long> testItemIds = prepareTestData(itemService, Math.min(1000, requestCount));
        if (testItemIds.isEmpty()) {
            log.warn("没有可用的测试数据");
            return new PerformanceTestResult();
        }
        
        Random random = new Random();
        ExecutorService executor = Executors.newFixedThreadPool(concurrency);
        
        long startTime = System.currentTimeMillis();
        
        // 创建并发任务
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        int requestsPerThread = requestCount / concurrency;
        
        for (int i = 0; i < concurrency; i++) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                for (int j = 0; j < requestsPerThread; j++) {
                    Long itemId = testItemIds.get(random.nextInt(testItemIds.size()));
                    itemService.getItemInfoCache(itemId);
                }
            }, executor);
            futures.add(future);
        }
        
        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        
        // 关闭线程池
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        // 计算性能指标
        PerformanceTestResult result = new PerformanceTestResult();
        result.setTotalRequests(requestCount);
        result.setTotalTime(totalTime);
        result.setAverageTime((double) totalTime / requestCount);
        result.setRequestsPerSecond(requestCount * 1000.0 / totalTime);
        
        // 获取缓存统计
        var cacheStats = cacheManager.getItemCacheStats();
        result.setCacheHits(cacheStats.hitCount());
        result.setCacheMisses(cacheStats.missCount());
        result.setHitRate(cacheStats.hitRate());
        
        log.info("缓存性能测试完成: {}", result);
        return result;
    }

    /**
     * 测试列表查询性能
     */
    public static PerformanceTestResult testListQueryPerformance(
            IDaItemService itemService,
            EnhancedCacheManager cacheManager,
            int requestCount,
            int concurrency) {
        
        log.info("开始列表查询性能测试: requestCount={}, concurrency={}", requestCount, concurrency);
        
        String[] testNames = {"剑", "刀", "枪", "法杖", "护甲", "戒指", "项链", "手镯", "鞋子", "头盔"};
        Random random = new Random();
        ExecutorService executor = Executors.newFixedThreadPool(concurrency);
        
        long startTime = System.currentTimeMillis();
        
        // 创建并发任务
        List<CompletableFuture<Void>> futures = new ArrayList<>();
        int requestsPerThread = requestCount / concurrency;
        
        for (int i = 0; i < concurrency; i++) {
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                for (int j = 0; j < requestsPerThread; j++) {
                    String name = testNames[random.nextInt(testNames.length)];
                    itemService.listByName(name);
                }
            }, executor);
            futures.add(future);
        }
        
        // 等待所有任务完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        
        long endTime = System.currentTimeMillis();
        long totalTime = endTime - startTime;
        
        // 关闭线程池
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        // 计算性能指标
        PerformanceTestResult result = new PerformanceTestResult();
        result.setTotalRequests(requestCount);
        result.setTotalTime(totalTime);
        result.setAverageTime((double) totalTime / requestCount);
        result.setRequestsPerSecond(requestCount * 1000.0 / totalTime);
        
        // 获取缓存统计
        var cacheStats = cacheManager.getItemListCacheStats();
        result.setCacheHits(cacheStats.hitCount());
        result.setCacheMisses(cacheStats.missCount());
        result.setHitRate(cacheStats.hitRate());
        
        log.info("列表查询性能测试完成: {}", result);
        return result;
    }

    /**
     * 准备测试数据
     */
    private static List<Long> prepareTestData(IDaItemService itemService, int count) {
        List<Long> itemIds = new ArrayList<>();
        try {
            List<DaItemEntity> items = itemService.listAll();
            for (int i = 0; i < Math.min(count, items.size()); i++) {
                itemIds.add(items.get(i).getId());
            }
        } catch (Exception e) {
            log.error("准备测试数据失败", e);
        }
        return itemIds;
    }

    /**
     * 预热缓存
     */
    public static void warmupCache(IDaItemService itemService, int warmupRequests) {
        log.info("开始缓存预热: warmupRequests={}", warmupRequests);
        
        List<Long> testItemIds = prepareTestData(itemService, warmupRequests);
        
        for (Long itemId : testItemIds) {
            itemService.getItemInfoCache(itemId);
        }
        
        log.info("缓存预热完成");
    }

    /**
     * 比较缓存前后性能
     */
    public static void comparePerformance(
            IDaItemService itemService,
            EnhancedCacheManager cacheManager,
            int requestCount,
            int concurrency) {
        
        log.info("开始缓存性能对比测试");
        
        // 清空缓存，测试无缓存性能
        cacheManager.clearAllItemCaches();
        PerformanceTestResult noCacheResult = testItemQueryPerformance(
            itemService, cacheManager, requestCount, concurrency);
        
        // 预热缓存，测试有缓存性能
        warmupCache(itemService, 1000);
        PerformanceTestResult withCacheResult = testItemQueryPerformance(
            itemService, cacheManager, requestCount, concurrency);
        
        // 输出对比结果
        log.info("=== 缓存性能对比结果 ===");
        log.info("无缓存: {}", noCacheResult);
        log.info("有缓存: {}", withCacheResult);
        
        double improvement = (withCacheResult.getRequestsPerSecond() - noCacheResult.getRequestsPerSecond()) 
                           / noCacheResult.getRequestsPerSecond() * 100;
        log.info("性能提升: {:.2f}%", improvement);
    }
}
