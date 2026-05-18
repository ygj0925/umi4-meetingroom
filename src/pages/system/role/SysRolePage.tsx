import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import type { SysRoleVo } from '@/services/web/system';
import { role } from '@/services/web/system';
import MenuGrant from './components/MenuGrant';
import RoleForm from './components/RoleForm';
import UserBind from './components/UserBind';

const RolePage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<SysRoleVo | null>(null);
  const [grantVisible, setGrantVisible] = useState(false);
  const [grantRoleCode, setGrantRoleCode] = useState('');
  const [userBindVisible, setUserBindVisible] = useState(false);
  const [userBindRoleCode, setUserBindRoleCode] = useState('');

  const typeMap: Record<number, string> = {
    1: '系统角色',
    2: '业务角色',
  };

  const columns: ProColumns<SysRoleVo>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '角色标识',
      dataIndex: 'code',
      ellipsis: true,
    },
    {
      title: '角色类型',
      dataIndex: 'type',
      render: (_, record) => (
        <Tag color={record.type === 1 ? 'blue' : 'green'}>
          {typeMap[record.type] || '-'}
        </Tag>
      ),
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
          <AccessControl permission="system:role:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessControl>
          <AccessControl permission="system:role:grant">
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => handleGrant(record)}
            >
              菜单授权
            </Button>
          </AccessControl>
          <AccessControl permission="system:role:grant">
            <Button
              type="link"
              icon={<TeamOutlined />}
              onClick={() => handleUserBind(record)}
            >
              用户绑定
            </Button>
          </AccessControl>
          <AccessControl permission="system:role:del">
            <Popconfirm
              title="确认删除"
              description="确认删除该角色？"
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
    setCurrentRole(null);
    setFormVisible(true);
  };

  const handleEdit = (record: SysRoleVo) => {
    setCurrentRole(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysRoleVo) => {
    try {
      await role.del(record);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleGrant = (record: SysRoleVo) => {
    setGrantRoleCode(record.code);
    setGrantVisible(true);
  };

  const handleUserBind = (record: SysRoleVo) => {
    setUserBindRoleCode(record.code);
    setUserBindVisible(true);
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    actionRef.current?.reload();
  };

  return (
    <PageContainer>
      <ProTable<SysRoleVo>
        headerTitle="角色管理"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await role.query({
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
          <AccessControl key="add" permission="system:role:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增角色
            </Button>
          </AccessControl>,
        ]}
      />

      <RoleForm
        visible={formVisible}
        role={currentRole}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <MenuGrant
        visible={grantVisible}
        roleCode={grantRoleCode}
        onCancel={() => setGrantVisible(false)}
      />

      <UserBind
        visible={userBindVisible}
        roleCode={userBindRoleCode}
        onCancel={() => setUserBindVisible(false)}
      />
    </PageContainer>
  );
};

export default RolePage;
