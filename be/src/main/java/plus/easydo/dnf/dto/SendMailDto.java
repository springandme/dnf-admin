package plus.easydo.dnf.dto;

import lombok.Data;

import java.util.List;

/**
 * @author laoyu
 * @version 1.0
 * @description 发送邮件参数封装
 * @date 2023/10/29
 */
@Data
public class SendMailDto {

    /**收件角色编号*/
    private Long characNo;

    /**收件角色编号列表（批量发送）*/
    private List<Long> characNoList;

    /**邮件标题*/
    private String title;

    /**邮件内容*/
    private String content;

    /**金币数量*/
    private Long gold = 0L;

    /**物品列表*/
    private List<MailItemDto> itemList;

    /**发送类型：single-单个发送，batch-批量发送*/
    private String sendType = "single";

    /**模板名称（用于保存发送模板）*/
    private String templateName;

    /**是否保存为模板*/
    private Boolean saveAsTemplate = false;
}
