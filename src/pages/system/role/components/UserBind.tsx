import { DeleteOutlined } from '@ant-design/icons';
import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Modal, message, Popconfirm, Space } from 'antd';
import React, { useRef, useState } from 'react';
import type { SysRoleBindVo } from '@/services/web/system';
import { role } from '@/services/web/system';

interface UserBindProps {
  visible: boolean;
  roleCode: string;
  onCancel: () => void;
}

const UserBind: React.FC<UserBindProps> = ({ visible, roleCode, onCancel }) => {
  const actionRef = useRef<ActionType>(null);

  const columns: ProColumns<SysRoleBindVo>[] = [
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
      title: '组织',
      dataIndex: 'organizationName',
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="确认解绑"
            description="确认解除该用户与角色的绑定？"
            onConfirm={() => handleUnbind(record)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              解绑
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleUnbind = async (record: SysRoleBindVo) => {
    try {
      await role.unbindUser(record.userId, roleCode);
      message.success('解绑成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Unbind failed:', error);
    }
  };

  return (
    <Modal
      title="用户绑定"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <ProTable<SysRoleBindVo>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="userId"
        columns={columns}
        search={false}
        params={{ roleCode }}
        request={async (params) => {
          const { current, pageSize, roleCode: code } = params;
          const response = await role.listRoleBindUser({
            page: current as number,
            size: pageSize as number,
            roleCode: code as string,
          });
          return {
            data: response.data?.records || [],
            total: response.data?.total || 0,
            success: true,
          };
        }}
      />
    </Modal>
  );
};

export default UserBind;
