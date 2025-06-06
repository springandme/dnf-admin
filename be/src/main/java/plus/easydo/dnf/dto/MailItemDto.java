package plus.easydo.dnf.dto;

import lombok.Builder;
import lombok.Data;

/**
 * @author laoyu
 * @version 1.0
 * @description 邮件物品信息
 * @date 2023/11/19
 */
@Data
@Builder
public class MailItemDto {
    /**物品id*/
    private Long itemId;
    /**物品类型*/
    private Integer itemType;
    /**物品数量*/
    private Long count;
    /**强化等级 0-30*/
    private Integer upgrade;
    /**锻造等级*/
    private Integer seperateUpgrade;
    /**增幅类型 0-无，1-体力，2-精神，3-力量，4-智力*/
    private Integer amplifyOption;
    /**增幅数值*/
    private Integer amplifyValue;
    /**是否封装 0-否，1-是*/
    private Integer sealFlag;
    /**力量红字*/
    private Integer redStrength;
    /**智力红字*/
    private Integer redIntelligence;
    /**精神红字*/
    private Integer redSpirit;
    /**体力红字*/
    private Integer redStamina;
}
