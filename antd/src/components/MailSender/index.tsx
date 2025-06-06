import React, { useState } from 'react';
import { Modal, message, Form } from 'antd';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea, ProFormMoney } from '@ant-design/pro-form';
import { sendMail } from '@/services/dnf-admin/daMailController';
import { roleList } from '@/services/dnf-admin/gameRoleController';

interface MailSenderProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  prefilledItems?: Array<{
    itemId: string | number;
    itemName: string;
    itemType?: number;
    count?: number;
  }>;
  title?: string;
}

interface MailFormData {
  characNo: string;
  title: string;
  content: string;
  gold: number;
  itemList: Array<{
    itemId: string | number;
    itemType: number;
    count: number;
  }>;
}

const MailSender: React.FC<MailSenderProps> = ({
  visible,
  onCancel,
  onSuccess,
  prefilledItems = [],
  title = "发送邮件"
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * 处理邮件发送
   */
  const handleSendMail = async (values: MailFormData) => {
    setLoading(true);
    const hide = message.loading('正在发送邮件...');

    try {
      // 构建邮件数据
      const mailData: API.SendMailDto = {
        characNo: values.characNo,
        title: values.title,
        content: values.content,
        gold: values.gold || 0,
        itemList: prefilledItems.map(item => ({
          itemId: item.itemId,
          itemType: item.itemType || 1, // 默认装备类型
          count: item.count || 1,
        })),
      };

      await sendMail(mailData);
      hide();
      message.success('邮件发送成功！');
      
      // 重置表单
      form.resetFields();
      
      // 调用成功回调
      onSuccess?.();
      
      // 关闭弹窗
      onCancel();
      
      return true;
    } catch (error) {
      hide();
      message.error('邮件发送失败，请重试！');
      console.error('邮件发送失败:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生成物品摘要文本
   */
  const getItemsSummary = () => {
    if (prefilledItems.length === 0) return '';
    
    if (prefilledItems.length === 1) {
      return `物品：${prefilledItems[0].itemName}`;
    }
    
    return `${prefilledItems.length}个物品：${prefilledItems.map(item => item.itemName).join('、')}`;
  };

  /**
   * 生成默认邮件内容
   */
  const getDefaultContent = () => {
    const itemsSummary = getItemsSummary();
    return itemsSummary 
      ? `系统邮件\n\n${itemsSummary}\n\n请查收。\n\n- DNF Admin`
      : 'DNF Admin 系统邮件';
  };

  return (
    <ModalForm
      title={title}
      visible={visible}
      form={form}
      modalProps={{
        destroyOnClose: true,
        confirmLoading: loading,
        onCancel,
      }}
      onFinish={handleSendMail}
      submitter={{
        submitButtonProps: {
          loading,
        },
      }}
    >
      {/* 角色选择 */}
      <ProFormSelect
        name="characNo"
        label="收件角色"
        placeholder="请选择收件角色"
        fieldProps={{
          suffixIcon: null,
          showSearch: true,
          labelInValue: false,
          autoClearSearchValue: true,
          fieldNames: {
            label: 'characName',
            value: 'characNo',
          },
        }}
        request={() => roleList({}).then(res => res.data || [])}
        rules={[
          {
            required: true,
            message: '请选择收件角色',
          },
        ]}
      />

      {/* 邮件标题 */}
      <ProFormText
        name="title"
        label="邮件标题"
        placeholder="请输入邮件标题"
        initialValue="DNF Admin - 物品邮件"
        rules={[
          {
            required: true,
            message: '请输入邮件标题',
          },
        ]}
      />

      {/* 邮件正文 */}
      <ProFormTextArea
        name="content"
        label="邮件正文"
        placeholder="请输入邮件正文"
        initialValue={getDefaultContent()}
        fieldProps={{
          rows: 4,
        }}
        rules={[
          {
            required: true,
            message: '请输入邮件正文',
          },
        ]}
      />

      {/* 金币数量 */}
      <ProFormMoney
        name="gold"
        label="附加金币"
        placeholder="请输入金币数量"
        initialValue={0}
        fieldProps={{
          min: 0,
        }}
        rules={[
          {
            required: true,
            message: '请输入金币数量',
          },
        ]}
      />

      {/* 物品信息展示 */}
      {prefilledItems.length > 0 && (
        <Form.Item label="发送物品">
          <div style={{ 
            padding: '8px 12px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '6px',
            border: '1px solid #d9d9d9'
          }}>
            {prefilledItems.map((item, index) => (
              <div key={index} style={{ marginBottom: index < prefilledItems.length - 1 ? '4px' : 0 }}>
                <span style={{ fontWeight: 500 }}>{item.itemName}</span>
                <span style={{ color: '#666', marginLeft: '8px' }}>
                  (ID: {item.itemId}, 数量: {item.count || 1})
                </span>
              </div>
            ))}
          </div>
        </Form.Item>
      )}
    </ModalForm>
  );
};

export default MailSender;
