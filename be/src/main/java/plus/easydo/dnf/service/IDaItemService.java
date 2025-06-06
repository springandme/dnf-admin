package plus.easydo.dnf.service;


import cn.hutool.json.JSONObject;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.service.IService;
import plus.easydo.dnf.entity.DaItemEntity;
import plus.easydo.dnf.qo.DaItemQo;

import java.util.List;
import java.util.Map;

/**
 * 物品缓存 服务层。
 *
 * @author mybatis-flex-helper automatic generation
 * @since 1.0
 */
public interface IDaItemService extends IService<DaItemEntity> {

    Page<DaItemEntity> itemPage(DaItemQo daItemQo);

    List<DaItemEntity> listByName(String name);

    Long importItemForJson(List<JSONObject> res);

    void importItemForMap(Map<Integer, String> itemMap);

    void initItemCache();

    DaItemEntity getItemInfoCache(Long itemId);

    /**
     * 获取所有物品（带缓存）
     */
    List<DaItemEntity> listAll();

    /**
     * 分页搜索物品
     *
     * @param keyword 搜索关键词
     * @param current 当前页码
     * @param pageSize 每页大小
     * @return 分页结果
     */
    Page<DaItemEntity> searchItems(String keyword, Integer current, Integer pageSize);
}
