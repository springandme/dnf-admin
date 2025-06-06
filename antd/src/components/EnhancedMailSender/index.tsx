import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  message, 
  Form, 
  Card, 
  Divider, 
  Space, 
  Button, 
  Upload, 
  Progress,
  Table,
  Tag,
  Tooltip
} from 'antd';
import { 
  ModalForm, 
  ProFormSelect, 
  ProFormText, 
  ProFormTextArea, 
  ProFormMoney,
  ProFormDigit,
  ProFormSwitch,
  ProFormGroup,
  ProFormList
} from '@ant-design/pro-form';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  InfoCircleOutlined,
  SendOutlined,
  UserOutlined
} from '@ant-design/icons';
import { sendMail, batchSendMail, asyncBatchSendMail, getBatchSendProgress } from '@/services/dnf-admin/daMailController';
import { roleList } from '@/services/dnf-admin/gameRoleController';
import ItemSelector from '@/components/ItemSelector';

interface EnhancedMailSenderProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  prefilledItems?: Array<{
    itemId: string | number;
    itemName: string;
    itemType?: number;
    count?: number;
  }>;
  prefilledPlayers?: Array<{
    characNo: string;
    characName: string;
  }>;
  title?: string;
}

interface MailFormData {
  sendType: 'single' | 'batch';
  characNo?: string;
  characNoList?: string[];
  title: string;
  content: string;
  gold: number;
  itemList: Array<{
    itemId: string | number;
    itemType: number;
    count: number;
    upgrade?: number;
    seperateUpgrade?: number;
    amplifyOption?: number;
    amplifyValue?: number;
    sealFlag?: number;
    redStrength?: number;
    redIntelligence?: number;
    redSpirit?: number;
    redStamina?: number;
  }>;
  saveAsTemplate?: boolean;
  templateName?: string;
}

interface BatchSendProgress {
  taskId: string;
  totalCount: number;
  successCount: number;
  failCount: number;
  status: string;
  progress: number;
  failDetails?: Array<{
    characNo: number;
    characName: string;
    failReason: string;
  }>;
}

const EnhancedMailSender: React.FC<EnhancedMailSenderProps> = ({
  visible,
  onCancel,
  onSuccess,
  prefilledItems = [],
  prefilledPlayers = [],
  title = "发送邮件"
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sendType, setSendType] = useState<'single' | 'batch'>('single');
  const [batchProgress, setBatchProgress] = useState<BatchSendProgress | null>(null);
  const [progressVisible, setProgressVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    if (prefilledItems.length > 0) {
      setSelectedItems(prefilledItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemType: item.itemType || 1,
        count: item.count || 1,
        upgrade: 0,
        seperateUpgrade: 0,
        amplifyOption: 0,
        amplifyValue: 0,
        sealFlag: 0,
        redStrength: 0,
        redIntelligence: 0,
        redSpirit: 0,
        redStamina: 0,
      })));
      console.log('EnhancedMailSender - 预填充物品:', prefilledItems);
    }
  }, [prefilledItems]);

  useEffect(() => {
    if (prefilledPlayers.length > 0) {
      setSendType('batch');
      // 设置表单的初始值
      form.setFieldsValue({
        sendType: 'batch',
        characNoList: prefilledPlayers.map(p => p.characNo),
      });
    }
  }, [prefilledPlayers, form]);

  /**
   * 处理邮件发送
   */
  const handleSendMail = async (values: MailFormData) => {
    setLoading(true);
    const hide = message.loading('正在发送邮件...');

    try {
      const mailData: API.SendMailDto = {
        sendType: values.sendType,
        characNo: values.sendType === 'single' ? values.characNo : undefined,
        characNoList: values.sendType === 'batch' ? values.characNoList : undefined,
        title: values.title,
        content: values.content,
        gold: values.gold || 0,
        itemList: selectedItems.map(item => ({
          itemId: item.itemId,
          itemType: item.itemType || 1,
          count: item.count || 1,
          upgrade: item.upgrade || 0,
          seperateUpgrade: item.seperateUpgrade || 0,
          amplifyOption: item.amplifyOption || 0,
          amplifyValue: item.amplifyValue || 0,
          sealFlag: item.sealFlag || 0,
          redStrength: item.redStrength || 0,
          redIntelligence: item.redIntelligence || 0,
          redSpirit: item.redSpirit || 0,
          redStamina: item.redStamina || 0,
        })),
        saveAsTemplate: values.saveAsTemplate,
        templateName: values.templateName,
      };

      if (values.sendType === 'single') {
        await sendMail(mailData);
        hide();
        message.success('邮件发送成功！');
      } else {
        // 批量发送
        if (mailData.characNoList && mailData.characNoList.length > 10) {
          // 大批量异步发送
          const response = await asyncBatchSendMail(mailData);
          hide();
          message.success('批量发送任务已启动，请查看进度！');
          startProgressMonitoring(response.data || '');
        } else {
          // 小批量同步发送
          const response = await batchSendMail(mailData);
          hide();
          const result = response.data;
          if (result && result.failCount && result.failCount > 0) {
            message.warning(`发送完成：成功${result.successCount}个，失败${result.failCount}个`);
          } else {
            message.success(`批量发送成功：共${result?.successCount || 0}个角色`);
          }
        }
      }
      
      // 重置表单和状态
      form.resetFields();
      setSelectedItems([]);
      setSendType('single');
      setBatchProgress(null);
      setProgressVisible(false);

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
   * 开始进度监控
   */
  const startProgressMonitoring = (taskId: string) => {
    setProgressVisible(true);
    const interval = setInterval(async () => {
      try {
        const response = await getBatchSendProgress(taskId);
        const progress = response.data;
        setBatchProgress(progress || null);

        if (progress && (progress.status === 'completed' || progress.status === 'failed')) {
          clearInterval(interval);
          setTimeout(() => {
            setProgressVisible(false);
            setBatchProgress(null);
          }, 3000);
        }
      } catch (error) {
        console.error('获取进度失败:', error);
        clearInterval(interval);
      }
    }, 1000);
  };

  /**
   * 处理物品属性变更
   */
  const handleItemAttributeChange = (index: number, field: string, value: any) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  /**
   * 添加物品
   */
  const handleAddItem = () => {
    setSelectedItems([...selectedItems, {
      itemId: '',
      itemName: '',
      itemType: 1,
      count: 1,
      upgrade: 0,
      seperateUpgrade: 0,
      amplifyOption: 0,
      amplifyValue: 0,
      sealFlag: 0,
      redStrength: 0,
      redIntelligence: 0,
      redSpirit: 0,
      redStamina: 0,
    }]);
  };

  /**
   * 删除物品
   */
  const handleRemoveItem = (index: number) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
  };

  /**
   * 增幅选项
   */
  const amplifyOptions = [
    { label: '无', value: 0 },
    { label: '体力', value: 1 },
    { label: '精神', value: 2 },
    { label: '力量', value: 3 },
    { label: '智力', value: 4 },
  ];

  return (
    <>
      <ModalForm
        title={title}
        visible={visible}
        form={form}
        width={1200}
        modalProps={{
          destroyOnClose: true,
          confirmLoading: loading,
          onCancel,
          bodyStyle: { maxHeight: '70vh', overflowY: 'auto' },
        }}
        onFinish={handleSendMail}
        submitter={{
          submitButtonProps: {
            loading,
            icon: <SendOutlined />,
            size: 'large',
          },
          resetButtonProps: {
            size: 'large',
          },
        }}
      >
        {/* 发送类型选择 */}
        <ProFormSelect
          name="sendType"
          label="发送类型"
          initialValue="single"
          options={[
            { label: '单个发送', value: 'single' },
            { label: '批量发送', value: 'batch' },
          ]}
          fieldProps={{
            onChange: (value) => setSendType(value),
          }}
          rules={[{ required: true, message: '请选择发送类型' }]}
        />

        {/* 收件人选择 */}
        {sendType === 'single' ? (
          <ProFormSelect
            name="characNo"
            label="收件角色"
            placeholder="请选择收件角色"
            fieldProps={{
              suffixIcon: <UserOutlined />,
              showSearch: true,
              labelInValue: false,
              autoClearSearchValue: true,
              fieldNames: {
                label: 'characName',
                value: 'characNo',
              },
            }}
            request={() => roleList({}).then(res => res.data || [])}
            rules={[{ required: true, message: '请选择收件角色' }]}
          />
        ) : (
          <ProFormSelect
            name="characNoList"
            label="收件角色列表"
            placeholder="请选择多个收件角色"
            fieldProps={{
              mode: 'multiple',
              showSearch: true,
              labelInValue: false,
              autoClearSearchValue: true,
              fieldNames: {
                label: 'characName',
                value: 'characNo',
              },
            }}
            request={() => roleList({}).then(res => res.data || [])}
            rules={[{ required: true, message: '请至少选择一个收件角色' }]}
          />
        )}

        <Divider orientation="left">邮件内容</Divider>

        {/* 邮件标题 */}
        <ProFormText
          name="title"
          label="邮件标题"
          placeholder="请输入邮件标题"
          initialValue="DNF Admin - 增强物品邮件"
          rules={[{ required: true, message: '请输入邮件标题' }]}
        />

        {/* 邮件内容 */}
        <ProFormTextArea
          name="content"
          label="邮件内容"
          placeholder="请输入邮件内容"
          initialValue="这是来自DNF Admin的增强物品邮件，请查收。"
          fieldProps={{
            rows: 3,
          }}
          rules={[{ required: true, message: '请输入邮件内容' }]}
        />

        {/* 金币数量 */}
        <ProFormMoney
          name="gold"
          label="金币数量"
          placeholder="请输入金币数量"
          initialValue={0}
          fieldProps={{
            precision: 0,
            min: 0,
            max: 999999999,
          }}
        />

        <Divider orientation="left">物品配置</Divider>

        {/* 物品列表 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />}>
              添加物品
            </Button>
            <Tooltip title="支持配置物品的强化、锻造、增幅、封装等属性">
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          </Space>
        </div>

        {/* 物品配置表格 */}
        {selectedItems.length > 0 && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Table
              size="small"
              dataSource={selectedItems}
              pagination={false}
              rowKey={(record, index) => index}
              scroll={{ x: 1200 }}
              bordered
              style={{
                fontSize: '14px',
                '.ant-table-thead > tr > th': {
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center',
                },
                '.ant-table-tbody > tr > td': {
                  fontSize: '14px',
                  textAlign: 'center',
                  padding: '8px 4px',
                }
              }}
              columns={[
                {
                  title: '物品',
                  dataIndex: 'itemName',
                  width: 180,
                  align: 'center',
                  render: (text, record, index) => (
                    record.itemName ? (
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1890ff',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        // 点击已选择的物品可以重新选择
                        handleItemAttributeChange(index, 'itemName', '');
                        handleItemAttributeChange(index, 'itemId', '');
                      }}
                      title="点击重新选择物品"
                      >
                        {record.itemName}
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          ID: {record.itemId}
                        </div>
                      </div>
                    ) : (
                      <ItemSelector
                        placeholder="选择物品"
                        style={{ width: '100%', fontSize: '14px' }}
                        onChange={(value, option) => {
                          console.log('选择物品:', value, option);
                          handleItemAttributeChange(index, 'itemId', value);
                          handleItemAttributeChange(index, 'itemName', option?.item?.itemName || option?.item?.name || '');
                          handleItemAttributeChange(index, 'itemType', option?.item?.itemType || option?.item?.type || 1);
                        }}
                      />
                    )
                  ),
                },
                {
                  title: '数量',
                  dataIndex: 'count',
                  width: 90,
                  align: 'center',
                  render: (text, record, index) => (
                    <ProFormDigit
                      fieldProps={{
                        size: 'small',
                        min: 1,
                        max: 9999,
                        value: record.count,
                        style: { fontSize: '14px', textAlign: 'center' },
                        onChange: (value) => handleItemAttributeChange(index, 'count', value),
                      }}
                    />
                  ),
                },
                {
                  title: '强化',
                  dataIndex: 'upgrade',
                  width: 90,
                  align: 'center',
                  render: (text, record, index) => (
                    <ProFormDigit
                      fieldProps={{
                        size: 'small',
                        min: 0,
                        max: 30,
                        value: record.upgrade,
                        style: { fontSize: '14px', textAlign: 'center' },
                        onChange: (value) => handleItemAttributeChange(index, 'upgrade', value),
                      }}
                    />
                  ),
                },
                {
                  title: '锻造',
                  dataIndex: 'seperateUpgrade',
                  width: 90,
                  align: 'center',
                  render: (text, record, index) => (
                    <ProFormDigit
                      fieldProps={{
                        size: 'small',
                        min: 0,
                        max: 10,
                        value: record.seperateUpgrade,
                        style: { fontSize: '14px', textAlign: 'center' },
                        onChange: (value) => handleItemAttributeChange(index, 'seperateUpgrade', value),
                      }}
                    />
                  ),
                },
                {
                  title: '增幅类型',
                  dataIndex: 'amplifyOption',
                  width: 120,
                  align: 'center',
                  render: (text, record, index) => (
                    <ProFormSelect
                      fieldProps={{
                        size: 'small',
                        options: amplifyOptions,
                        value: record.amplifyOption,
                        style: { fontSize: '14px', width: '100%' },
                        onChange: (value) => handleItemAttributeChange(index, 'amplifyOption', value),
                      }}
                    />
                  ),
                },
                {
                  title: '增幅值',
                  dataIndex: 'amplifyValue',
                  width: 90,
                  align: 'center',
                  render: (text, record, index) => (
                    <ProFormDigit
                      fieldProps={{
                        size: 'small',
                        min: 0,
                        max: 50,
                        value: record.amplifyValue,
                        style: { fontSize: '14px', textAlign: 'center' },
                        onChange: (value) => handleItemAttributeChange(index, 'amplifyValue', value),
                      }}
                    />
                  ),
                },
                {
                  title: '封装',
                  dataIndex: 'sealFlag',
                  width: 80,
                  align: 'center',
                  render: (text, record, index) => (
                    <div style={{ textAlign: 'center' }}>
                      <ProFormSwitch
                        fieldProps={{
                          size: 'small',
                          checked: record.sealFlag === 1,
                          onChange: (checked) => handleItemAttributeChange(index, 'sealFlag', checked ? 1 : 0),
                        }}
                      />
                    </div>
                  ),
                },
                {
                  title: '操作',
                  width: 80,
                  align: 'center',
                  render: (text, record, index) => (
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveItem(index)}
                      style={{ fontSize: '14px' }}
                    />
                  ),
                },
              ]}
            />
          </Card>
        )}

        <Divider orientation="left">模板设置</Divider>

        {/* 模板保存 */}
        <ProFormGroup>
          <ProFormSwitch
            name="saveAsTemplate"
            label="保存为模板"
            tooltip="保存此邮件配置为模板，方便下次使用"
          />
          <ProFormText
            name="templateName"
            label="模板名称"
            placeholder="请输入模板名称"
            dependencies={['saveAsTemplate']}
            rules={[
              ({ getFieldValue }) => ({
                required: getFieldValue('saveAsTemplate'),
                message: '请输入模板名称',
              }),
            ]}
          />
        </ProFormGroup>
      </ModalForm>

      {/* 批量发送进度弹窗 */}
      <Modal
        title="批量发送进度"
        visible={progressVisible}
        footer={null}
        closable={false}
        width={600}
      >
        {batchProgress && (
          <div>
            <Progress
              percent={Math.round(batchProgress.progress)}
              status={batchProgress.status === 'failed' ? 'exception' : 'active'}
            />
            <div style={{ marginTop: 16 }}>
              <Space>
                <Tag color="blue">总数: {batchProgress.totalCount}</Tag>
                <Tag color="green">成功: {batchProgress.successCount}</Tag>
                <Tag color="red">失败: {batchProgress.failCount}</Tag>
                <Tag color={batchProgress.status === 'completed' ? 'green' : 'processing'}>
                  状态: {batchProgress.status}
                </Tag>
              </Space>
            </div>
            
            {batchProgress.failDetails && batchProgress.failDetails.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>失败详情:</h4>
                <Table
                  size="small"
                  dataSource={batchProgress.failDetails}
                  pagination={false}
                  columns={[
                    { title: '角色编号', dataIndex: 'characNo', width: 100 },
                    { title: '角色名称', dataIndex: 'characName', width: 120 },
                    { title: '失败原因', dataIndex: 'failReason' },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default EnhancedMailSender;
