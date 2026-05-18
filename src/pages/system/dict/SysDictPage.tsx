import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Modal, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import type { SysDictVo } from '@/services/web/system';
import { dict, dictItem } from '@/services/web/system';
import DictForm from './components/DictForm';
import DictItemModal from './components/DictItemModal';

const DictPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentDict, setCurrentDict] = useState<SysDictVo | null>(null);
  const [dictItemVisible, setDictItemVisible] = useState(false);
  const [currentDictCode, setCurrentDictCode] = useState('');

  const valueTypeMap: Record<number, string> = {
    1: 'Number',
    2: 'String',
    3: 'Boolean',
  };

  const columns: ProColumns<SysDictVo>[] = [
    {
      title: '字典标识',
      dataIndex: 'code',
      ellipsis: true,
    },
    {
      title: '字典名称',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '数据类型',
      dataIndex: 'valueType',
      render: (_, record) => valueTypeMap[record.valueType] || '-',
      hideInSearch: true,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'green' : 'red'}>
          {record.status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
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
          <AccessControl permission="system:dict:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessControl>
          <AccessControl permission="system:dict:del">
            <Popconfirm
              title="确认删除"
              description="删除字典将同时删除所有字典项，确认删除？"
              onConfirm={() => handleDelete(record)}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </AccessControl>
          <Button type="link" onClick={() => handleOpenDictItem(record)}>
            字典项
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setCurrentDict(null);
    setFormVisible(true);
  };

  const handleEdit = (record: SysDictVo) => {
    setCurrentDict(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysDictVo) => {
    try {
      await dict.del(record);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleOpenDictItem = (record: SysDictVo) => {
    setCurrentDictCode(record.code);
    setDictItemVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      <ProTable<SysDictVo>
        headerTitle="字典管理"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await dict.query({
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
          <AccessControl key="add" permission="system:dict:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增字典
            </Button>
          </AccessControl>,
        ]}
      />

      <DictForm
        visible={formVisible}
        dict={currentDict}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <DictItemModal
        visible={dictItemVisible}
        dictCode={currentDictCode}
        onCancel={() => setDictItemVisible(false)}
      />
    </PageContainer>
  );
};

export default DictPage;
