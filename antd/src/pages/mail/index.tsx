import { CloseCircleOutlined, CopyOutlined, PlusOutlined, DeleteOutlined, LoadingOutlined, SendOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Button, message, Spin } from 'antd';
import React, { useCallback, useRef, useState, useMemo } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ProColumns, ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { ModalForm, ProFormGroup, ProFormList, ProFormMoney, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-form';
import { cleanMail1} from '@/services/dnf-admin/gameToolController';
import { pageMailSendLog, sendMail } from '@/services/dnf-admin/daMailController';
import { roleList } from '@/services/dnf-admin/gameRoleController';
import { searchItems } from '@/services/dnf-admin/daItemController';
import { Access, useAccess } from 'umi';
import { debounce } from 'lodash';
import EnhancedMailSender from '@/components/EnhancedMailSender';
import PlayerListImporter from '@/components/PlayerListImporter';

// 物品搜索缓存接口
interface ItemSearchCache {
  [key: string]: {
    data: API.DaItemEntity[];
    total: number;
    timestamp: number;
  };
}

const Email: React.FC = () => {
  const actionRef = useRef<ActionType>();

  /** 新建窗口的弹窗 */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);

  /** 增强邮件发送弹窗 */
  const [enhancedMailVisible, setEnhancedMailVisible] = useState<boolean>(false);

  /** 玩家列表导入弹窗 */
  const [importerVisible, setImporterVisible] = useState<boolean>(false);

  /** 预填充的玩家列表 */
  const [prefilledPlayers, setPrefilledPlayers] = useState<Array<{ characNo: string; characName: string }>>([]);

  // 物品搜索相关状态
  const [itemSearchCache, setItemSearchCache] = useState<ItemSearchCache>({});
  const [itemSearchLoading, setItemSearchLoading] = useState<boolean>(false);
  const [currentItemKeyword, setCurrentItemKeyword] = useState<string>('');

  const access = useAccess();

  // 缓存过期时间（5分钟）
  const CACHE_EXPIRE_TIME = 5 * 60 * 1000;

  /**
   * 搜索物品（带缓存和分页）
   */
  const searchItemsWithCache = useCallback(async (keyword: string, current: number = 1, pageSize: number = 50) => {
    const cacheKey = `${keyword}_${current}_${pageSize}`;
    const now = Date.now();

    // 检查缓存
    const cached = itemSearchCache[cacheKey];
    if (cached && (now - cached.timestamp) < CACHE_EXPIRE_TIME) {
      return {
        data: cached.data,
        total: cached.total,
        current,
        pageSize,
      };
    }

    try {
      setItemSearchLoading(true);
      const response = await searchItems({
        keyword: keyword.trim(),
        current,
        pageSize,
      });

      if (response.success && response.data) {
        const result = {
          data: response.data.records || [],
          total: response.data.total || 0,
          current: response.data.current || current,
          pageSize: response.data.pageSize || pageSize,
        };

        // 更新缓存
        setItemSearchCache(prev => ({
          ...prev,
          [cacheKey]: {
            data: result.data,
            total: result.total,
            timestamp: now,
          },
        }));

        return result;
      }
    } catch (error) {
      console.error('搜索物品失败:', error);
      message.error('搜索物品失败，请重试');
    } finally {
      setItemSearchLoading(false);
    }

    return {
      data: [],
      total: 0,
      current,
      pageSize,
    };
  }, [itemSearchCache, CACHE_EXPIRE_TIME]);

  /**
   * 防抖搜索函数
   */
  const debouncedSearchItems = useMemo(
    () => debounce(async (keyword: string) => {
      if (keyword && keyword.length >= 2) {
        setCurrentItemKeyword(keyword);
        await searchItemsWithCache(keyword);
      }
    }, 300),
    [searchItemsWithCache]
  );

  /**
   * 清理过期缓存
   */
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    setItemSearchCache(prev => {
      const newCache: ItemSearchCache = {};
      Object.entries(prev).forEach(([key, value]) => {
        if ((now - value.timestamp) < CACHE_EXPIRE_TIME) {
          newCache[key] = value;
        }
      });
      return newCache;
    });
  }, [CACHE_EXPIRE_TIME]);

  // 定期清理过期缓存
  React.useEffect(() => {
    const interval = setInterval(cleanExpiredCache, 60000); // 每分钟清理一次
    return () => clearInterval(interval);
  }, [cleanExpiredCache]);

  /**
   * 添加节点
   *
   * @param fields
   */
  const handleAdd = async (fields: API.SendMailDto) => {
    const hide = message.loading('正在添加');

    try {
      await sendMail({ ...fields });
      hide();
      message.success('添加成功');
      return true;
    } catch (error) {
      hide();
      message.error('添加失败请重试！');
      return false;
    }
  };

  /** 国际化配置 */

  const columns: ProColumns<API.DaMailSendLog>[] = [
    {
      title: '标题',
      dataIndex: 'sendDetails.title',
      render: (_, record) => {
        const sendDetails = JSON.parse(record.sendDetails);
        return sendDetails.title;
      }
    },
    {
      title: '正文',
      dataIndex: 'sendDetails.content',
      render: (_, record) => {
        const sendDetails = JSON.parse(record.sendDetails);
        return sendDetails.content;
      }
    },
    {
      title: '发送时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
  ];


  return (
    <PageContainer>
      <ProTable<API.DaMailSendLog, API.PageQo>
        headerTitle="发送记录"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: false,
        }}
        toolBarRender={() => [
          <Access accessible={access.hashPre('mail.sendMail')}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleModalVisible(true)}>
              普通邮件
            </Button>
          </Access>,
          <Access accessible={access.hashPre('mail.sendMail')}>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={() => setEnhancedMailVisible(true)}>
              增强邮件
            </Button>
          </Access>,
          <Access accessible={access.hashPre('mail.sendMail')}>
            <Button icon={<SendOutlined />} onClick={() => setImporterVisible(true)}>
              批量发送
            </Button>
          </Access>,
          <Access accessible={access.hashPre('tool.cleanMail')}>
            <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => {
              cleanMail1().then(res=>{
                if(res.success){
                  message.success(res.message)
                }
                })
            }}>
              清空全服邮件
            </Button>
          </Access>,
        ]}
        request={pageMailSendLog}
        columns={columns}
      />
      <ModalForm
        modalProps={{
          destroyOnClose: true,
        }}
        title="发送邮件"
        visible={createModalVisible}
        onVisibleChange={handleModalVisible}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.SendMailDto);
          if (success) {
            handleModalVisible(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormSelect
          name="characNo"
          label="角色"
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
          request={() => roleList({}).then(res => {
            return res.data
          })}
          rules={[
            {
              required: true,
              message: '请选择角色',
            },
          ]}
        />
        <ProFormText
          name="title"
          label="邮件标题"
          initialValue={'dnf-admin'}
          rules={[
            {
              required: true,
              message: '请输入邮件标题',
            },
          ]}
        />
        <ProFormTextArea
          name="content"
          label="邮件正文"
          initialValue={"dnf-admin 系统邮件"}
          rules={[
            {
              required: true,
              message: '请输入邮件标题',
            },
          ]}
        />

        <ProFormMoney
          name="gold"
          label="金币"
          initialValue={0}
          rules={[
            {
              required: true,
              message: '请输入金币',
            },
          ]}
        />
        <ProFormList
          name="itemList"
          label="发送物品"
          initialValue={[
          ]}
          copyIconProps={{ Icon: CopyOutlined, tooltipText: '复制' }}
          deleteIconProps={{
            Icon: CloseCircleOutlined,
            tooltipText: '删除',
          }}
        >
          <ProFormGroup key="group">
            <ProFormSelect
              name="itemId"
              label="物品"
              placeholder="请输入物品名称搜索（至少2个字符）"
              fieldProps={{
                suffixIcon: itemSearchLoading ? <LoadingOutlined /> : null,
                showSearch: true,
                labelInValue: false,
                autoClearSearchValue: false,
                filterOption: false,
                onSearch: (value: string) => {
                  if (value && value.length >= 2) {
                    debouncedSearchItems(value);
                  }
                },
                notFoundContent: itemSearchLoading ? (
                  <div style={{ textAlign: 'center', padding: '12px' }}>
                    <Spin size="small" />
                    <span style={{ marginLeft: 8 }}>搜索中...</span>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px', color: '#999' }}>
                    {currentItemKeyword ? '未找到相关物品' : '请输入至少2个字符开始搜索'}
                  </div>
                ),
                fieldNames: {
                  label: 'name',
                  value: 'id',
                },
              }}
              request={async (params) => {
                const keyword = params.keyWords;
                if (!keyword || keyword.length < 2) {
                  return [];
                }

                const result = await searchItemsWithCache(keyword);
                return result.data.map(item => ({
                  label: `${item.name} (ID: ${item.id})`,
                  value: item.id,
                  ...item,
                }));
              }}
            />
        <ProFormSelect
          name="itemType"
          label="物品类型"
          options={[
            {'label':'装备','value':1},
            {'label':'消耗品','value':2},
            {'label':'材料','value':3},
            {'label':'任务材料','value':4},
            {'label':'宠物','value':5},
            {'label':'宠物装备','value':6},
            {'label':'宠物消耗品','value':7},
            {'label':'时装','value':8},
            {'label':'副职业','value':10},
          ]}
        /> 
            <ProFormText fieldProps={{
              type: 'number',
              min: 1,
            }} initialValue={1} name="count" label="数量" />
          </ProFormGroup>
        </ProFormList>
      </ModalForm>

      {/* 增强邮件发送组件 */}
      <EnhancedMailSender
        visible={enhancedMailVisible}
        onCancel={() => {
          setEnhancedMailVisible(false);
          setPrefilledPlayers([]); // 清空预填充数据
        }}
        onSuccess={() => {
          message.success('邮件发送成功！');
          setPrefilledPlayers([]); // 清空预填充数据
          if (actionRef.current) {
            actionRef.current.reload();
          }
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
          // 设置预填充玩家列表并打开增强邮件发送组件
          setPrefilledPlayers(playerList);
          setEnhancedMailVisible(true);
          message.success(`已导入 ${playerList.length} 个角色，请配置邮件内容`);
        }}
      />
    </PageContainer>
  );
};

export default Email;
