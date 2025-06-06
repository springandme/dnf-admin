package plus.easydo.dnf.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import plus.easydo.dnf.dto.BatchSendResultDto;
import plus.easydo.dnf.dto.SendMailDto;
import plus.easydo.dnf.entity.DaMailSendLog;
import plus.easydo.dnf.entity.Postal;
import plus.easydo.dnf.qo.PageQo;
import plus.easydo.dnf.qo.RoleMailPageQo;
import plus.easydo.dnf.service.GameMailService;
import plus.easydo.dnf.service.IDaMailSendLogService;
import plus.easydo.dnf.vo.DataResult;
import plus.easydo.dnf.vo.R;

import java.util.List;

/**
 * 邮件发送记录 控制层。
 *
 * @author mybatis-flex-helper automatic generation
 * @since 1.0
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mail")
public class DaMailController {

    private final IDaMailSendLogService daMailSendLogService;

    private final GameMailService gameMailService;


    @Operation(summary = "发送邮件")
    @SaCheckPermission("mail.sendMail")
    @PostMapping("/sendRoleMail")
    public R<Object> sendMail(@RequestBody SendMailDto sendMailDto) {
        gameMailService.sendMail(sendMailDto);
        return DataResult.ok();
    }

    @Operation(summary = "批量发送邮件")
    @SaCheckPermission("mail.sendMail")
    @PostMapping("/batchSendMail")
    public R<BatchSendResultDto> batchSendMail(@RequestBody SendMailDto sendMailDto) {
        BatchSendResultDto result = gameMailService.batchSendMail(sendMailDto);
        return DataResult.ok(result);
    }

    @Operation(summary = "异步批量发送邮件")
    @SaCheckPermission("mail.sendMail")
    @PostMapping("/asyncBatchSendMail")
    public R<String> asyncBatchSendMail(@RequestBody SendMailDto sendMailDto) {
        String taskId = gameMailService.asyncBatchSendMail(sendMailDto);
        return DataResult.ok(taskId);
    }

    @Operation(summary = "查询批量发送进度")
    @SaCheckPermission("mail.sendMail")
    @GetMapping("/batchSendProgress/{taskId}")
    public R<BatchSendResultDto> getBatchSendProgress(@PathVariable String taskId) {
        BatchSendResultDto result = gameMailService.getBatchSendProgress(taskId);
        return DataResult.ok(result);
    }

    @Operation(summary = "验证角色列表")
    @SaCheckPermission("mail.sendMail")
    @PostMapping("/validateCharacList")
    public R<List<Long>> validateCharacList(@RequestBody List<Long> characNoList) {
        List<Long> validList = gameMailService.validateCharacList(characNoList);
        return DataResult.ok(validList);
    }

    /**
     * 分页查询邮件发送记录
     *
     * @param pageQo 分页对象
     * @return 分页对象
     */
    @Operation(summary = "邮件发送记录分页")
    @SaCheckPermission("mail")
    @PostMapping("/pageMailSendLog")
    public R<List<DaMailSendLog>> pageMailSendLog(@RequestBody  PageQo pageQo) {
        return DataResult.ok(daMailSendLogService.sendLogpage(pageQo));
    }

    @Operation(summary = "角色邮件分页")
    @SaCheckPermission("mail")
    @PostMapping("/roleMailPage/{characNo}")
    public R<List<Postal>> roleMailPage(@PathVariable("characNo") Long characNo, @RequestBody RoleMailPageQo roleMailPageQo) {
        return DataResult.ok(gameMailService.roleMailPage(characNo,roleMailPageQo));
    }

    @Operation(summary = "删除邮件")
    @SaCheckPermission("mail")
    @PostMapping("/removeMail/{postalId}")
    public R<Boolean> removeMail(@PathVariable("postalId") Long postalId) {
        return DataResult.ok(gameMailService.removeMail(postalId));
    }

}
