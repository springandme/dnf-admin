package plus.easydo.dnf.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.github.benmanes.caffeine.cache.RemovalListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import plus.easydo.dnf.entity.DaItemEntity;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * 缓存配置类
 * 
 * @author hliushi
 * @since 1.0.3
 */
@Slf4j
@Configuration
@EnableCaching
@ConfigurationProperties(prefix = "dnf.cache")
public class CacheConfig {

    /**
     * 物品缓存过期时间（小时）
     */
    private int itemCacheExpireHours = 6;

    /**
     * 物品缓存最大容量
     */
    private long itemCacheMaximumSize = 100000L;

    /**
     * 缓存统计开关
     */
    private boolean enableStats = true;

    /**
     * 缓存预热开关
     */
    private boolean enableWarmup = true;

    /**
     * Spring Cache Manager
     */
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(defaultCaffeineBuilder());
        return cacheManager;
    }

    /**
     * 默认 Caffeine 配置
     */
    private Caffeine<Object, Object> defaultCaffeineBuilder() {
        return Caffeine.newBuilder()
                .maximumSize(10000)
                .expireAfterWrite(Duration.ofHours(2))
                .recordStats();
    }

    /**
     * 物品缓存专用配置
     */
    @Bean("itemCache")
    public Cache<Long, DaItemEntity> itemCache() {
        Caffeine<Long, DaItemEntity> builder = Caffeine.newBuilder()
                .maximumSize(itemCacheMaximumSize)
                .expireAfterWrite(itemCacheExpireHours, TimeUnit.HOURS)
                .removalListener((RemovalListener<Long, DaItemEntity>) (key, value, cause) -> {
                    if (log.isDebugEnabled()) {
                        log.debug("物品缓存移除: key={}, cause={}", key, cause);
                    }
                });

        if (enableStats) {
            builder.recordStats();
        }

        return builder.build();
    }

    /**
     * 物品名称查询缓存
     */
    @Bean("itemNameCache")
    public Cache<String, Object> itemNameCache() {
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .recordStats()
                .build();
    }

    /**
     * 物品列表缓存（用于查询所有物品）
     */
    @Bean("itemListCache")
    public Cache<String, Object> itemListCache() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(itemCacheExpireHours, TimeUnit.HOURS)
                .removalListener((key, value, cause) -> {
                    if (log.isDebugEnabled()) {
                        log.debug("物品列表缓存移除: key={}, cause={}", key, cause);
                    }
                })
                .recordStats()
                .build();
    }

    // Getter and Setter methods
    public int getItemCacheExpireHours() {
        return itemCacheExpireHours;
    }

    public void setItemCacheExpireHours(int itemCacheExpireHours) {
        this.itemCacheExpireHours = itemCacheExpireHours;
    }

    public long getItemCacheMaximumSize() {
        return itemCacheMaximumSize;
    }

    public void setItemCacheMaximumSize(long itemCacheMaximumSize) {
        this.itemCacheMaximumSize = itemCacheMaximumSize;
    }

    public boolean isEnableStats() {
        return enableStats;
    }

    public void setEnableStats(boolean enableStats) {
        this.enableStats = enableStats;
    }

    public boolean isEnableWarmup() {
        return enableWarmup;
    }

    public void setEnableWarmup(boolean enableWarmup) {
        this.enableWarmup = enableWarmup;
    }
}
