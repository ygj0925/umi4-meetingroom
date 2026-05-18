import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space } from 'antd';
import React, { useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import type { SysOrganizationVo } from '@/services/web/system';
import { organization } from '@/services/web/system';
import OrgForm from './components/OrgForm';

const OrganizationPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentOrg, setCurrentOrg] = useState<SysOrganizationVo | null>(null);
  const [parentOrg, setParentOrg] = useState<SysOrganizationVo | null>(null);

  const columns: ProColumns<SysOrganizationVo>[] = [
    {
      title: '组织名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      hideInSearch: true,
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
          <AccessControl permission="system:organization:add">
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => handleAddChild(record)}
            >
              新增子级
            </Button>
          </AccessControl>
          <AccessControl permission="system:organization:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessControl>
          <AccessControl permission="system:organization:del">
            <Popconfirm
              title="确认删除"
              description="删除组织将同时删除所有子组织，确认删除？"
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
    setCurrentOrg(null);
    setParentOrg(null);
    setFormVisible(true);
  };

  const handleAddChild = (record: SysOrganizationVo) => {
    setCurrentOrg(null);
    setParentOrg(record);
    setFormVisible(true);
  };

  const handleEdit = (record: SysOrganizationVo) => {
    setCurrentOrg(record);
    setParentOrg(null);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysOrganizationVo) => {
    try {
      await organization.del(record);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleRevised = async () => {
    try {
      await organization.revised();
      message.success('层级校正成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Revised failed:', error);
    }
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      <ProTable<SysOrganizationVo>
        headerTitle="组织管理"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        request={async () => {
          const response = await organization.query();
          return {
            data: response.data || [],
            success: true,
          };
        }}
        toolBarRender={() => [
          <AccessControl key="add" permission="system:organization:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增组织
            </Button>
          </AccessControl>,
          <AccessControl key="revised" permission="system:organization:revised">
            <Button icon={<ToolOutlined />} onClick={handleRevised}>
              校正层级
            </Button>
          </AccessControl>,
        ]}
      />

      <OrgForm
        visible={formVisible}
        org={currentOrg}
        parentOrg={parentOrg}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </PageContainer>
  );
};

export default OrganizationPage;
