import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import type { SysConfigVo } from '@/services/web/system';
import { config } from '@/services/web/system';
import ConfigForm from './components/ConfigForm';

const ConfigPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<SysConfigVo | null>(null);

  const columns: ProColumns<SysConfigVo>[] = [
    {
      title: '配置名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '配置Key',
      dataIndex: 'confKey',
      ellipsis: true,
    },
    {
      title: '配置值',
      dataIndex: 'confValue',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      ellipsis: true,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <AccessControl permission="system:config:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessControl>
          <AccessControl permission="system:config:del">
            <Popconfirm
              title="确认删除"
              description="确认删除该配置？"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </AccessControl>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setCurrentConfig(null);
    setFormVisible(true);
  };

  const handleEdit = (record: SysConfigVo) => {
    setCurrentConfig(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysConfigVo) => {
    try {
      await config.del(record);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      <ProTable<SysConfigVo>
        headerTitle="系统配置"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await config.query({
            page: current as number,
            size: pageSize as number,
            ...rest,
          });
          return {
            data: response.data?.records || [],
            total: response.data?.total || 0,
            success: true,
          };
        }}
        toolBarRender={() => [
          <AccessControl key="add" permission="system:config:edit">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增配置
            </Button>
          </AccessControl>,
        ]}
      />

      <ConfigForm
        visible={formVisible}
        config={currentConfig}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </PageContainer>
  );
};

export default ConfigPage;
