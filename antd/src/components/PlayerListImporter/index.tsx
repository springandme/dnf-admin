import React, { useState } from 'react';
import { Modal, Upload, Button, message, Table, Space, Alert, Typography, Input } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

interface PlayerListImporterProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (playerList: Array<{ characNo: string; characName: string }>) => void;
}

interface PlayerData {
  characNo: string;
  characName: string;
  status?: 'valid' | 'invalid' | 'duplicate';
  error?: string;
}

const PlayerListImporter: React.FC<PlayerListImporterProps> = ({
  visible,
  onCancel,
  onConfirm,
}) => {
  const [playerList, setPlayerList] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState<string>('');

  /**
   * 处理文件上传
   */
  const handleFileUpload = (file: File) => {
    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let players: PlayerData[] = [];

        if (file.name.endsWith('.csv')) {
          // 处理CSV文件
          const text = data as string;
          const lines = text.split('\n');

          // 跳过标题行
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
              const [characNo, characName] = line.split(',').map(s => s.trim().replace(/"/g, ''));
              if (characNo && characName) {
                players.push({ characNo, characName });
              }
            }
          }
        } else {
          message.error('暂时只支持CSV文件格式');
          setLoading(false);
          return;
        }

        // 验证和去重
        const validatedPlayers = validatePlayerList(players);
        setPlayerList(validatedPlayers);

        message.success(`成功导入 ${validatedPlayers.length} 个角色`);
      } catch (error) {
        console.error('文件解析失败:', error);
        message.error('文件解析失败，请检查文件格式');
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file, 'UTF-8');
    return false; // 阻止自动上传
  };

  /**
   * 处理文本输入
   */
  const handleTextInput = () => {
    if (!textInput.trim()) {
      message.warning('请输入角色信息');
      return;
    }

    setLoading(true);
    try {
      const lines = textInput.split('\n');
      const players: PlayerData[] = [];

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          // 支持多种分隔符：逗号、制表符、空格
          const parts = trimmedLine.split(/[,\t\s]+/);
          if (parts.length >= 2) {
            const characNo = parts[0].trim();
            const characName = parts[1].trim();
            if (characNo && characName) {
              players.push({ characNo, characName });
            }
          }
        }
      });

      // 验证和去重
      const validatedPlayers = validatePlayerList(players);
      setPlayerList(validatedPlayers);
      setTextInput('');

      message.success(`成功导入 ${validatedPlayers.length} 个角色`);
    } catch (error) {
      console.error('文本解析失败:', error);
      message.error('文本解析失败，请检查格式');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 验证玩家列表
   */
  const validatePlayerList = (players: PlayerData[]): PlayerData[] => {
    const seen = new Set<string>();
    const validated: PlayerData[] = [];

    players.forEach(player => {
      const validatedPlayer = { ...player };

      // 检查角色编号格式
      if (!/^\d+$/.test(player.characNo)) {
        validatedPlayer.status = 'invalid';
        validatedPlayer.error = '角色编号格式错误';
      }
      // 检查重复
      else if (seen.has(player.characNo)) {
        validatedPlayer.status = 'duplicate';
        validatedPlayer.error = '重复的角色编号';
      }
      // 有效数据
      else {
        validatedPlayer.status = 'valid';
        seen.add(player.characNo);
      }

      validated.push(validatedPlayer);
    });

    return validated;
  };

  /**
   * 下载模板文件
   */
  const downloadTemplate = () => {
    const templateContent = `角色编号,角色名称
1001,示例角色1
1002,示例角色2
1003,示例角色3`;

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', '角色列表导入模板.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * 确认导入
   */
  const handleConfirm = () => {
    const validPlayers = playerList.filter(p => p.status === 'valid');
    if (validPlayers.length === 0) {
      message.warning('没有有效的角色数据');
      return;
    }

    onConfirm(validPlayers);
    setPlayerList([]);
  };

  /**
   * 删除角色
   */
  const handleRemovePlayer = (index: number) => {
    const newList = playerList.filter((_, i) => i !== index);
    setPlayerList(newList);
  };

  /**
   * 清空列表
   */
  const handleClearList = () => {
    setPlayerList([]);
  };

  const validCount = playerList.filter(p => p.status === 'valid').length;
  const invalidCount = playerList.filter(p => p.status !== 'valid').length;

  const columns = [
    {
      title: '角色编号',
      dataIndex: 'characNo',
      width: 120,
    },
    {
      title: '角色名称',
      dataIndex: 'characName',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string, record: PlayerData) => {
        const statusConfig = {
          valid: { color: 'green', text: '有效' },
          invalid: { color: 'red', text: '无效' },
          duplicate: { color: 'orange', text: '重复' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: '未知' };
        return <Text type={config.color as any}>{config.text}</Text>;
      },
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      render: (error: string) => error && <Text type="danger">{error}</Text>,
    },
    {
      title: '操作',
      width: 80,
      render: (_: any, record: PlayerData, index: number) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePlayer(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="导入角色列表"
      visible={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="clear" onClick={handleClearList} disabled={playerList.length === 0}>
          清空
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={validCount === 0}
        >
          确认导入 ({validCount}个)
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* 上传区域 */}
        <div>
          <Space>
            <Upload
              accept=".csv"
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} loading={loading}>
                上传CSV文件
              </Button>
            </Upload>
            <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>
              下载模板
            </Button>
          </Space>
          <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
            支持 CSV 文件，第一列为角色编号，第二列为角色名称
          </div>
        </div>

        {/* 文本输入区域 */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>或者直接输入角色信息：</div>
          <TextArea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="请输入角色信息，每行一个角色，格式：角色编号 角色名称&#10;例如：&#10;1001 示例角色1&#10;1002 示例角色2"
            rows={6}
            style={{ marginBottom: 8 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleTextInput}
            loading={loading}
            disabled={!textInput.trim()}
          >
            添加角色
          </Button>
          <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
            支持多种分隔符：空格、制表符、逗号
          </div>
        </div>

        {/* 统计信息 */}
        {playerList.length > 0 && (
          <Alert
            message={`共导入 ${playerList.length} 个角色，其中有效 ${validCount} 个，无效 ${invalidCount} 个`}
            type={invalidCount > 0 ? 'warning' : 'success'}
            showIcon
          />
        )}

        {/* 角色列表 */}
        {playerList.length > 0 && (
          <Table
            size="small"
            dataSource={playerList}
            columns={columns}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
            }}
            rowKey={(record, index) => `${record.characNo}-${index}`}
            scroll={{ y: 300 }}
          />
        )}
      </Space>
    </Modal>
  );
};

export default PlayerListImporter;
