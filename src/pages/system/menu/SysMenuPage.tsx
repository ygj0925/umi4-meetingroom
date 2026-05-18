import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import type { SysMenuVo } from '@/services/web/system';
import { menu } from '@/services/web/system';
import MenuForm from './components/MenuForm';

const MenuPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<SysMenuVo | null>(null);
  const [parentMenu, setParentMenu] = useState<SysMenuVo | null>(null);

  const typeMap: Record<number, { label: string; color: string }> = {
    0: { label: '目录', color: 'blue' },
    1: { label: '菜单', color: 'green' },
    2: { label: '按钮', color: 'orange' },
  };

  const targetTypeMap: Record<number, string> = {
    1: '组件',
    2: '内链',
    3: '外链',
  };

  const columns: ProColumns<SysMenuVo>[] = [
    {
      title: '菜单名称',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (_, record) => {
        const typeInfo = typeMap[record.type];
        return typeInfo ? (
          <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
        ) : (
          '-'
        );
      },
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '路由地址',
      dataIndex: 'path',
      ellipsis: true,
    },
    {
      title: '授权标识',
      dataIndex: 'permission',
      ellipsis: true,
    },
    {
      title: '打开方式',
      dataIndex: 'targetType',
      width: 100,
      render: (_, record) => targetTypeMap[record.targetType] || '-',
      hideInSearch: true,
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          {record.type !== 2 && (
            <AccessControl permission="system:menu:add">
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => handleAddChild(record)}
              >
                新增子级
              </Button>
            </AccessControl>
          )}
          <AccessControl permission="system:menu:edit">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
          </AccessControl>
          <AccessControl permission="system:menu:del">
            <Popconfirm
              title="确认删除"
              description="删除菜单将同时删除所有子菜单，确认删除？"
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
    setCurrentMenu(null);
    setParentMenu(null);
    setFormVisible(true);
  };

  const handleAddChild = (record: SysMenuVo) => {
    setCurrentMenu(null);
    setParentMenu(record);
    setFormVisible(true);
  };

  const handleEdit = (record: SysMenuVo) => {
    setCurrentMenu(record);
    setParentMenu(null);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysMenuVo) => {
    try {
      await menu.del(record);
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
      <ProTable<SysMenuVo>
        headerTitle="菜单管理"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const response = await menu.query(rest as any);
          return {
            data: response.data || [],
            success: true,
          };
        }}
        toolBarRender={() => [
          <AccessControl key="add" permission="system:menu:add">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增菜单
            </Button>
          </AccessControl>,
        ]}
      />

      <MenuForm
        visible={formVisible}
        menu={currentMenu}
        parentMenu={parentMenu}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </PageContainer>
  );
};

export default MenuPage;
