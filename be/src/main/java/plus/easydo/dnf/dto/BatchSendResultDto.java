package plus.easydo.dnf.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 批量发送结果DTO
 *
 * @author dnf-admin
 * @since 1.0.3
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSendResultDto {

    /**
     * 发送任务ID
     */
    private String taskId;

    /**
     * 总发送数量
     */
    private Integer totalCount;

    /**
     * 成功数量
     */
    private Integer successCount;

    /**
     * 失败数量
     */
    private Integer failCount;

    /**
     * 发送状态：pending-等待中，processing-处理中，completed-已完成，failed-失败
     */
    private String status;

    /**
     * 开始时间
     */
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    private LocalDateTime endTime;

    /**
     * 发送进度（百分比）
     */
    private Double progress;

    /**
     * 失败详情列表
     */
    private List<SendFailDetail> failDetails;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 发送失败详情
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendFailDetail {
        /**
         * 角色编号
         */
        private Long characNo;

        /**
         * 角色名称
         */
        private String characName;

        /**
         * 失败原因
         */
        private String failReason;
    }
}
