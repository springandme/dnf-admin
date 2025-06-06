package plus.easydo.dnf.service;

import com.mybatisflex.core.paginate.Page;
import plus.easydo.dnf.dto.BatchSendResultDto;
import plus.easydo.dnf.dto.SendMailDto;
import plus.easydo.dnf.entity.Postal;
import plus.easydo.dnf.qo.RoleMailPageQo;

import java.util.List;

/**
 * @author yuzhanfeng
 * @Date 2024-01-05 10:44
 * @Description 游戏邮件服务
 */
public interface GameMailService {

    /**
     * 发送邮件
     */
    void sendMail(SendMailDto sendMailDto);

    /**
     * 批量发送邮件
     */
    BatchSendResultDto batchSendMail(SendMailDto sendMailDto);

    /**
     * 异步批量发送邮件
     */
    String asyncBatchSendMail(SendMailDto sendMailDto);

    /**
     * 查询批量发送进度
     */
    BatchSendResultDto getBatchSendProgress(String taskId);

    /**
     * 角色邮件分页查询
     */
    Page<Postal> roleMailPage(Long characNo, RoleMailPageQo pageQo);

    /**
     * 删除邮件
     */
    boolean removeMail(Long postalId);

    /**
     * 验证角色列表
     */
    List<Long> validateCharacList(List<Long> characNoList);
}
