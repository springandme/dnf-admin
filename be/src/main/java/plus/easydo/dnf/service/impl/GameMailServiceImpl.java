package plus.easydo.dnf.service.impl;

import cn.hutool.json.JSONUtil;
import com.mybatisflex.core.paginate.Page;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import plus.easydo.dnf.dto.BatchSendResultDto;
import plus.easydo.dnf.dto.SendMailDto;
import plus.easydo.dnf.entity.CharacInfo;
import plus.easydo.dnf.entity.DaItemEntity;
import plus.easydo.dnf.entity.DaMailSendLog;
import plus.easydo.dnf.entity.Postal;
import plus.easydo.dnf.manager.CacheManager;
import plus.easydo.dnf.qo.RoleMailPageQo;
import plus.easydo.dnf.service.GameMailService;
import plus.easydo.dnf.service.GamePostalService;
import plus.easydo.dnf.service.IDaItemService;
import plus.easydo.dnf.service.IDaMailSendLogService;
import plus.easydo.dnf.util.WebSocketUtil;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;


/**
 * @author yuzhanfeng
 * @Date 2024-01-05 10:48
 * @Description 游戏邮件
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GameMailServiceImpl implements GameMailService {

    private final IDaMailSendLogService iDaMailSendLogService;

    private final GamePostalService gamePostalService;

    private final IDaItemService daItemService;

    // 批量发送任务缓存
    private final Map<String, BatchSendResultDto> batchTaskCache = new ConcurrentHashMap<>();


    @Override
    public void sendMail(SendMailDto sendMailDto) {
        // 判断是否使用增强发送功能
        boolean useEnhanced = hasEnhancedAttributes(sendMailDto);

        if(WebSocketUtil.getSessionCount() > 0L && !useEnhanced){
            WebSocketUtil.sendMail(sendMailDto);
        }else {
            log.warn("frida客户端全部离线或使用增强属性,使用数据库发送邮件");
            if (useEnhanced) {
                gamePostalService.sendEnhancedMail(sendMailDto);
            } else {
                gamePostalService.sendMail(sendMailDto);
            }
        }
        iDaMailSendLogService.save(DaMailSendLog.builder().sendDetails(JSONUtil.toJsonStr(sendMailDto)).createTime(LocalDateTime.now()).build());
    }

    /**
     * 检查是否包含增强属性
     */
    private boolean hasEnhancedAttributes(SendMailDto sendMailDto) {
        if (sendMailDto.getItemList() == null || sendMailDto.getItemList().isEmpty()) {
            return false;
        }

        return sendMailDto.getItemList().stream().anyMatch(item ->
            (item.getUpgrade() != null && item.getUpgrade() > 0) ||
            (item.getSeperateUpgrade() != null && item.getSeperateUpgrade() > 0) ||
            (item.getAmplifyOption() != null && item.getAmplifyOption() > 0) ||
            (item.getAmplifyValue() != null && item.getAmplifyValue() > 0) ||
            (item.getSealFlag() != null && item.getSealFlag() > 0) ||
            (item.getRedStrength() != null && item.getRedStrength() > 0) ||
            (item.getRedIntelligence() != null && item.getRedIntelligence() > 0) ||
            (item.getRedSpirit() != null && item.getRedSpirit() > 0) ||
            (item.getRedStamina() != null && item.getRedStamina() > 0)
        );
    }


    @Override
    public Page<Postal> roleMailPage(Long characNo, RoleMailPageQo pageQo) {
        Page<Postal> res = gamePostalService.roleMailPage(characNo, pageQo);
        res.getRecords().forEach(postal -> {
            Long itemId = postal.getItemId();
            DaItemEntity item = daItemService.getItemInfoCache(itemId);
            if(Objects.nonNull(item)){
                postal.setItemName(item.getName());
            }
            CharacInfo characInfo = CacheManager.CHARAC_INFO_CACHE.get(postal.getSendCharacNo());
            if(Objects.nonNull(characInfo)){
                postal.setSendCharacName(characInfo.getCharacName());
            }
        });
        return res;
    }

    @Override
    public boolean removeMail(Long postalId) {
        return gamePostalService.removeMail(postalId);
    }

    @Override
    public BatchSendResultDto batchSendMail(SendMailDto sendMailDto) {
        String taskId = UUID.randomUUID().toString();
        List<Long> characNoList = sendMailDto.getCharacNoList();

        if (characNoList == null || characNoList.isEmpty()) {
            throw new IllegalArgumentException("角色列表不能为空");
        }

        BatchSendResultDto result = BatchSendResultDto.builder()
                .taskId(taskId)
                .totalCount(characNoList.size())
                .successCount(0)
                .failCount(0)
                .status("processing")
                .startTime(LocalDateTime.now())
                .progress(0.0)
                .failDetails(new ArrayList<>())
                .build();

        batchTaskCache.put(taskId, result);

        try {
            AtomicInteger successCount = new AtomicInteger(0);
            AtomicInteger failCount = new AtomicInteger(0);
            List<BatchSendResultDto.SendFailDetail> failDetails = new ArrayList<>();

            for (int i = 0; i < characNoList.size(); i++) {
                Long characNo = characNoList.get(i);
                try {
                    // 创建单个发送请求
                    SendMailDto singleMailDto = new SendMailDto();
                    singleMailDto.setCharacNo(characNo);
                    singleMailDto.setTitle(sendMailDto.getTitle());
                    singleMailDto.setContent(sendMailDto.getContent());
                    singleMailDto.setGold(sendMailDto.getGold());
                    singleMailDto.setItemList(sendMailDto.getItemList());

                    // 发送邮件
                    sendMail(singleMailDto);
                    successCount.incrementAndGet();

                } catch (Exception e) {
                    failCount.incrementAndGet();
                    CharacInfo characInfo = CacheManager.CHARAC_INFO_CACHE.get(characNo);
                    String characName = characInfo != null ? characInfo.getCharacName() : "未知角色";

                    failDetails.add(BatchSendResultDto.SendFailDetail.builder()
                            .characNo(characNo)
                            .characName(characName)
                            .failReason(e.getMessage())
                            .build());

                    log.error("批量发送邮件失败: characNo={}, error={}", characNo, e.getMessage());
                }

                // 更新进度
                double progress = ((double) (i + 1) / characNoList.size()) * 100;
                result.setProgress(progress);
                result.setSuccessCount(successCount.get());
                result.setFailCount(failCount.get());
                result.setFailDetails(failDetails);
            }

            result.setStatus("completed");
            result.setEndTime(LocalDateTime.now());

        } catch (Exception e) {
            result.setStatus("failed");
            result.setErrorMessage(e.getMessage());
            result.setEndTime(LocalDateTime.now());
            log.error("批量发送邮件异常", e);
        }

        return result;
    }

    @Override
    public String asyncBatchSendMail(SendMailDto sendMailDto) {
        String taskId = UUID.randomUUID().toString();

        // 异步执行批量发送
        asyncExecuteBatchSend(taskId, sendMailDto);

        return taskId;
    }

    @Async
    public void asyncExecuteBatchSend(String taskId, SendMailDto sendMailDto) {
        BatchSendResultDto result = batchSendMail(sendMailDto);
        result.setTaskId(taskId);
        batchTaskCache.put(taskId, result);
    }

    @Override
    public BatchSendResultDto getBatchSendProgress(String taskId) {
        return batchTaskCache.get(taskId);
    }

    @Override
    public List<Long> validateCharacList(List<Long> characNoList) {
        if (characNoList == null || characNoList.isEmpty()) {
            return new ArrayList<>();
        }

        List<Long> validCharacList = new ArrayList<>();
        for (Long characNo : characNoList) {
            CharacInfo characInfo = CacheManager.CHARAC_INFO_CACHE.get(characNo);
            if (characInfo != null && characInfo.getDeleteFlag() != 1) {
                validCharacList.add(characNo);
            }
        }

        return validCharacList;
    }
}
