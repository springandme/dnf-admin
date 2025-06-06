package plus.easydo.dnf.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 邮件发送模板 实体类。
 *
 * @author dnf-admin
 * @since 1.0.3
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(value = "da_mail_template")
public class DaMailTemplate implements Serializable {

    @Id(keyType = KeyType.Auto)
    private Long id;

    /**
     * 模板名称
     */
    @Column(value = "template_name")
    private String templateName;

    /**
     * 邮件标题
     */
    @Column(value = "title")
    private String title;

    /**
     * 邮件内容
     */
    @Column(value = "content")
    private String content;

    /**
     * 金币数量
     */
    @Column(value = "gold")
    private Long gold;

    /**
     * 物品配置JSON
     */
    @Column(value = "item_config")
    private String itemConfig;

    /**
     * 创建人
     */
    @Column(value = "creator")
    private String creator;

    /**
     * 创建时间
     */
    @Column(value = "create_time")
    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @Column(value = "update_time")
    @JsonFormat(locale = "zh", timezone = "GMT+8", pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;

    /**
     * 使用次数
     */
    @Column(value = "use_count")
    private Integer useCount;

    /**
     * 是否启用
     */
    @Column(value = "enabled")
    private Boolean enabled;

    /**
     * 备注
     */
    @Column(value = "remark")
    private String remark;
}
