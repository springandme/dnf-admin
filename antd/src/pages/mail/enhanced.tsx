import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Button, Space, message, Typography } from 'antd';
import { ThunderboltOutlined, SendOutlined, UploadOutlined } from '@ant-design/icons';
import EnhancedMailSender from '@/components/EnhancedMailSender';
import PlayerListImporter from '@/components/PlayerListImporter';
import ItemSelector from '@/components/ItemSelector';

const { Title, Paragraph } = Typography;

const EnhancedMailPage: React.FC = () => {
  const [enhancedMailVisible, setEnhancedMailVisible] = useState<boolean>(false);
  const [importerVisible, setImporterVisible] = useState<boolean>(false);
  const [prefilledPlayers, setPrefilledPlayers] = useState<Array<{ characNo: string; characName: string }>>([]);

  return (
    <PageContainer>
      <Card>
        <Title level={2}>增强邮件发送功能</Title>
        <Paragraph>
          这是DNF游戏管理系统的增强邮件发送功能，支持以下特性：
        </Paragraph>
        
        <div style={{ marginBottom: 24 }}>
          <Title level={4}>核心功能</Title>
          <ul>
            <li><strong>物品属性配置</strong>：支持强化等级(0-30)、锻造等级、增幅类型和数值、封装状态等</li>
            <li><strong>红字属性设置</strong>：支持力量、智力、精神、体力红字属性配置</li>
            <li><strong>批量发送</strong>：支持选择多个角色或导入角色列表进行批量发送</li>
            <li><strong>发送进度监控</strong>：实时显示批量发送进度和结果统计</li>
            <li><strong>模板管理</strong>：支持保存常用邮件配置为模板，便于重复使用</li>
          </ul>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Title level={4}>操作流程</Title>
          <ol>
            <li>选择发送类型（单个发送或批量发送）</li>
            <li>选择收件角色（单个选择或批量导入）</li>
            <li>配置邮件内容（标题、正文、金币）</li>
            <li>添加和配置物品属性</li>
            <li>确认发送并查看结果</li>
          </ol>
        </div>

        <Space size="large">
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={() => setEnhancedMailVisible(true)}
          >
            打开增强邮件发送
          </Button>

          <Button
            size="large"
            icon={<UploadOutlined />}
            onClick={() => setImporterVisible(true)}
          >
            导入角色列表
          </Button>

          <Button
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={() => {
              // 测试预填充物品
              setPrefilledPlayers([
                { characNo: '1001', characName: '测试角色1' },
                { characNo: '1002', characName: '测试角色2' }
              ]);
              setEnhancedMailVisible(true);
            }}
          >
            测试预填充角色
          </Button>
        </Space>

        <div style={{ marginTop: 32, padding: 16, backgroundColor: '#f6f8fa', borderRadius: 6 }}>
          <Title level={5}>使用说明</Title>
          <Paragraph>
            <strong>增强邮件发送</strong>：提供完整的物品属性配置功能，支持单个和批量发送。
          </Paragraph>
          <Paragraph>
            <strong>角色列表导入</strong>：支持CSV文件导入或直接文本输入，导入后自动切换到批量发送模式。
          </Paragraph>
          <Paragraph>
            <strong>物品属性配置</strong>：可以设置物品的强化、锻造、增幅、封装等属性，以及红字属性。
          </Paragraph>
          <Paragraph>
            <strong>批量发送监控</strong>：大批量发送时会显示实时进度，包括成功/失败统计和详细错误信息。
          </Paragraph>
        </div>

        <div style={{ marginTop: 24, padding: 16, backgroundColor: '#fff', borderRadius: 6, border: '1px solid #d9d9d9' }}>
          <Title level={5}>ItemSelector 测试</Title>
          <Paragraph>测试物品搜索功能，请输入"货币"进行搜索：</Paragraph>
          <ItemSelector
            placeholder="请输入物品名称搜索（如：货币）"
            style={{ width: 400 }}
            onChange={(value, option) => {
              console.log('测试页面 - 选择物品:', value, option);
              message.success(`选择了物品: ${option?.item?.itemName || option?.label}`);
            }}
          />
        </div>
      </Card>

      {/* 增强邮件发送组件 */}
      <EnhancedMailSender
        visible={enhancedMailVisible}
        onCancel={() => {
          setEnhancedMailVisible(false);
          setPrefilledPlayers([]);
        }}
        onSuccess={() => {
          message.success('邮件发送成功！');
          setPrefilledPlayers([]);
        }}
        prefilledPlayers={prefilledPlayers}
        title="增强邮件发送"
      />

      {/* 玩家列表导入组件 */}
      <PlayerListImporter
        visible={importerVisible}
        onCancel={() => setImporterVisible(false)}
        onConfirm={(playerList) => {
          setImporterVisible(false);
          setPrefilledPlayers(playerList);
          setEnhancedMailVisible(true);
          message.success(`已导入 ${playerList.length} 个角色，请配置邮件内容`);
        }}
      />
    </PageContainer>
  );
};

export default EnhancedMailPage;
