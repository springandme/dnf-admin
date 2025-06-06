package plus.easydo.dnf.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import cn.dev33.satoken.annotation.SaCheckPermission;
import cn.hutool.json.JSONObject;
import com.alibaba.excel.EasyExcelFactory;
import com.mybatisflex.core.paginate.Page;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import plus.easydo.dnf.entity.DaItemEntity;
import plus.easydo.dnf.listener.ItemDataListener;
import plus.easydo.dnf.qo.DaItemQo;
import plus.easydo.dnf.service.IDaItemService;
import plus.easydo.dnf.util.ItemReaderUtil;
import plus.easydo.dnf.util.ResponseUtil;
import plus.easydo.dnf.vo.DataResult;
import plus.easydo.dnf.vo.R;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * 物品缓存 控制层。
 *
 * @author mybatis-flex-helper automatic generation
 * @since 1.0
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/item")
public class DaItemController {

    private final IDaItemService daItemService;


    /**
     * 导入物品缓存
     * @param file file
     * @throws IOException
     */
    @Operation(summary = "导入")
    @SaCheckPermission("item.importItem")
    @PostMapping("/importItem")
    public void importItem(@RequestParam("file") MultipartFile file) throws IOException {
        EasyExcelFactory.read(file.getInputStream(), DaItemEntity.class, new ItemDataListener(daItemService)).sheet().doRead();
    }

    /**
     * 导入物品缓存 从pvf导出的7z文件导入
     * @param file file
     * @throws IOException
     */
    @Operation(summary = "从pvf导出的7z文件导入")
    @SaCheckPermission("item.importItemFor7z")
    @PostMapping("/importItemFor7z")
    public void importItemFor7z(@RequestParam("file") MultipartFile file) throws IOException {
        List<JSONObject> res = ItemReaderUtil.reader(file);
        daItemService.importItemForJson(res);
    }

    /**
     * 下载导入模板
     *
     * @param response response
     * @author laoyu
     * @date 2023/10/29
     */
    @Operation(summary = "下载导入模板")
    @SaCheckPermission("item")
    @GetMapping("/downloadTemplate")
    public void downloadTemplate(HttpServletResponse response) throws IOException {
        ServletOutputStream opt = response.getOutputStream();
        ResponseUtil.setFileResponse(response,"物品导入模板.xlsx");
        EasyExcelFactory.write(opt, DaItemEntity.class).sheet(1).doWrite(Collections.emptyList());
    }

    /**
     * 添加 物品缓存
     *
     * @param daItem 物品缓存
     * @return {@code true} 添加成功，{@code false} 添加失败
     */
    @Operation(summary = "添加")
    @SaCheckPermission("item.save")
    @PostMapping("/save")
    public boolean saveItem(@RequestBody DaItemEntity daItem) {
        return daItemService.save(daItem);
    }


    /**
     * 根据主键删除物品缓存
     *
     * @param ids 主键
     * @return {@code true} 删除成功，{@code false} 删除失败
     */
    @Operation(summary = "删除")
    @SaCheckPermission("item.remove")
    @PostMapping("/remove")
    public boolean removeItem(@RequestBody List<String> ids) {
        return daItemService.removeByIds(ids);
    }


    /**
     * 根据主键更新物品缓存
     *
     * @param daItem 物品缓存
     * @return {@code true} 更新成功，{@code false} 更新失败
     */
    @Operation(summary = "更新")
    @SaCheckPermission("item.update")
    @PostMapping("/update")
    public boolean updateItem(@RequestBody DaItemEntity daItem) {
        return daItemService.updateById(daItem);
    }


    /**
     * 查询所有物品缓存（优化版本，支持缓存）
     *
     * @param name 物品名称（可选）
     * @return 物品列表
     */
    @Operation(summary = "查询所有物品")
    @SaCheckLogin
    @GetMapping("/list")
    public R<List<DaItemEntity>> listItem(@RequestParam(value = "name", required = false) String name) {
        List<DaItemEntity> result;

        if (name == null || name.trim().isEmpty()) {
            // 查询所有物品，使用缓存优化
            result = daItemService.listAll();
        } else {
            // 按名称查询，使用缓存优化
            result = daItemService.listByName(name.trim());
        }

        return DataResult.ok(result);
    }

    /**
     * 分页搜索物品（新增接口，支持关键词搜索和分页）
     *
     * @param keyword 搜索关键词
     * @param current 当前页码，默认1
     * @param pageSize 每页大小，默认50，最大100
     * @return 分页结果
     */
    @Operation(summary = "分页搜索物品")
    @SaCheckLogin
    @GetMapping("/search")
    public DataResult<List<DaItemEntity>> searchItems(
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "current", defaultValue = "1") Integer current,
            @RequestParam(value = "pageSize", defaultValue = "50") Integer pageSize) {

        // 限制每页最大数量，防止数据过载
        if (pageSize > 100) {
            pageSize = 100;
        }

        // 最小搜索长度限制
        if (keyword != null && keyword.trim().length() < 2) {
            return DataResult.ok(new Page<>(current, pageSize));
        }

        Page<DaItemEntity> result = daItemService.searchItems(keyword, current, pageSize);
        return DataResult.ok(result);
    }



    /**
     * 分页查询物品缓存
     *
     * @param daItemQo 分页对象
     * @return 分页对象
     */
    @Operation(summary = "分页")
    @SaCheckPermission("item")
    @PostMapping("/page")
    public R<List<DaItemEntity>> pageItem(@RequestBody DaItemQo daItemQo) {
        return DataResult.ok(daItemService.itemPage(daItemQo));
    }
}
