import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, message, Popconfirm, Space, Switch, Tag } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import AvatarCropper from '@/components/AvatarCropper';
import OrganizationTree from '@/components/OrganizationTree';
import type { SysUserVo } from '@/services/web/system';
import { user } from '@/services/web/system';
import Grant from './components/Grant';
import Pass from './components/Pass';
import UserForm from './components/UserForm';

const UserPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<SysUserVo | null>(null);
  const [grantVisible, setGrantVisible] = useState(false);
  const [grantUser, setGrantUser] = useState<SysUserVo | null>(null);
  const [passVisible, setPassVisible] = useState(false);
  const [passUser, setPassUser] = useState<SysUserVo | null>(null);
  const [avatarVisible, setAvatarVisible] = useState(false);
  const [avatarUser, setAvatarUser] = useState<SysUserVo | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState<number | undefined>();

  const genderMap: Record<number, string> = {
    0: '未知',
    1: '男',
    2: '女',
  };

  const columns: ProColumns<SysUserVo>[] = [
    {
      title: '头像',
      dataIndex: 'avatar',
      width: 60,
      render: (_, record) => (
        <Avatar
          src={record.avatar}
          icon={<UserOutlined />}
          style={{ cursor: 'pointer' }}
          onClick={() => handleAvatarUpload(record)}
        />
      ),
      hideInSearch: true,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      ellipsis: true,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      render: (_, record) => genderMap[record.gender] || '-',
      hideInSearch: true,
      width: 80,
    },
    {
      title: '电话',
      dataIndex: 'phoneNumber',
      ellipsis: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '组织',
      dataIndex: 'organizationName',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <AccessControl permission="system:user:edit">
          <Switch
            checked={record.status === 1}
            onChange={(checked) => handleStatusChange(record, checked ? 1 : 0)}
          />
        </AccessControl>
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
          <AccessControl permission="system:user:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessControl>
          <AccessControl permission="system:user:grant">
            <Button
              type="link"
              icon={<SafetyOutlined />}
              onClick={() => handleGrant(record)}
            >
              授权
            </Button>
          </AccessControl>
          <AccessControl permission="system:user:pass">
            <Button
              type="link"
              icon={<KeyOutlined />}
              onClick={() => handlePass(record)}
            >
              改密
            </Button>
          </AccessControl>
          <AccessControl permission="system:user:del">
            <Popconfirm
              title="确认删除"
              description="确认删除该用户？"
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
    setCurrentUser(null);
    setFormVisible(true);
  };

  const handleEdit = (record: SysUserVo) => {
    setCurrentUser(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysUserVo) => {
    try {
      await user.del(record);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleGrant = (record: SysUserVo) => {
    setGrantUser(record);
    setGrantVisible(true);
  };

  const handlePass = (record: SysUserVo) => {
    setPassUser(record);
    setPassVisible(true);
  };

  const handleAvatarUpload = (record: SysUserVo) => {
    setAvatarUser(record);
    setAvatarVisible(true);
  };

  const handleStatusChange = async (record: SysUserVo, status: 0 | 1) => {
    try {
      await user.updateStatus([record.userId], status);
      message.success('状态更新成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleBatchEnable = async () => {
    const selectedRows = (actionRef.current as any)?.getSelectedRows?.() || [];
    if (selectedRows.length === 0) {
      message.warning('请选择要启用的用户');
      return;
    }
    try {
      await user.updateStatus(
        selectedRows.map((r: SysUserVo) => r.userId),
        1,
      );
      message.success('批量启用成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Batch enable failed:', error);
    }
  };

  const handleBatchDisable = async () => {
    const selectedRows = (actionRef.current as any)?.getSelectedRows?.() || [];
    if (selectedRows.length === 0) {
      message.warning('请选择要锁定的用户');
      return;
    }
    try {
      await user.updateStatus(
        selectedRows.map((r: SysUserVo) => r.userId),
        0,
      );
      message.success('批量锁定成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Batch disable failed:', error);
    }
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    actionRef.current?.reload();
  };

  const handleGrantSuccess = () => {
    setGrantVisible(false);
    message.success('授权成功');
  };

  const handlePassSuccess = () => {
    setPassVisible(false);
    message.success('密码修改成功');
  };

  const handleAvatarUploadSuccess = async (file: Blob) => {
    if (!avatarUser) return;
    try {
      await user.updateAvatar(avatarUser, file, { name: 'avatar.jpg' } as any);
      message.success('头像上传成功');
      setAvatarVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Avatar upload failed:', error);
    }
  };

  const handleOrgSelect = useCallback((org: any) => {
    setSelectedOrgId(org?.id);
    actionRef.current?.reload();
  }, []);

  return (
    <PageContainer>
      <div style={{ display: 'flex', gap: 16 }}>
        <div
          style={{
            width: 250,
            background: '#fff',
            padding: 16,
            borderRadius: 8,
          }}
        >
          <OrganizationTree onSelectOrganization={handleOrgSelect} />
        </div>
        <div style={{ flex: 1 }}>
          <ProTable<SysUserVo>
            headerTitle="用户管理"
            actionRef={actionRef}
            rowKey="userId"
            columns={columns}
            rowSelection={{}}
            params={{
              organizationId: selectedOrgId ? [selectedOrgId] : undefined,
            }}
            request={async (params) => {
              const { current, pageSize, organizationId, ...rest } = params;
              const response = await user.query({
                page: current as number,
                size: pageSize as number,
                organizationId: organizationId as number[],
                ...rest,
              });
              return {
                data: response.data?.records || [],
                total: response.data?.total || 0,
                success: true,
              };
            }}
            toolBarRender={() => [
              <AccessControl key="add" permission="system:user:add">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  新增用户
                </Button>
              </AccessControl>,
              <AccessControl key="batchEnable" permission="system:user:edit">
                <Button onClick={handleBatchEnable}>批量启用</Button>
              </AccessControl>,
              <AccessControl key="batchDisable" permission="system:user:edit">
                <Button onClick={handleBatchDisable}>批量锁定</Button>
              </AccessControl>,
            ]}
          />
        </div>
      </div>

      <UserForm
        visible={formVisible}
        user={currentUser}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />

      <Grant
        visible={grantVisible}
        user={grantUser}
        onCancel={() => setGrantVisible(false)}
        onSuccess={handleGrantSuccess}
      />

      <Pass
        visible={passVisible}
        user={passUser}
        onCancel={() => setPassVisible(false)}
        onSuccess={handlePassSuccess}
      />

      <AvatarCropper
        visible={avatarVisible}
        onCancel={() => setAvatarVisible(false)}
        onUpload={handleAvatarUploadSuccess}
      />
    </PageContainer>
  );
};

export default UserPage;
