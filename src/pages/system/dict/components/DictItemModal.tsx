import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Modal, message, Popconfirm, Space, Switch, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import AccessControl from '@/components/AccessControl';
import type { SysDictItemVo } from '@/services/web/system';
import { dictItem, tagDefaultColorArray } from '@/services/web/system';
import DictItemForm from './DictItemForm';

interface DictItemModalProps {
  visible: boolean;
  dictCode: string;
  onCancel: () => void;
}

const DictItemModal: React.FC<DictItemModalProps> = ({
  visible,
  dictCode,
  onCancel,
}) => {
  const actionRef = useRef<ActionType>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<SysDictItemVo | null>(null);

  const columns: ProColumns<SysDictItemVo>[] = [
    {
      title: '文本值',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '数据值',
      dataIndex: 'value',
      ellipsis: true,
    },
    {
      title: '标签颜色',
      dataIndex: ['attributes', 'tagColor'],
      render: (_, record) => {
        const color = record.attributes?.tagColor;
        return color ? <Tag color={color}>{color}</Tag> : '-';
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (_, record) => (
        <AccessControl permission="system:dict:edit">
          <Switch
            checked={record.status === 1}
            onChange={(checked) => handleStatusChange(record, checked ? 1 : 0)}
          />
        </AccessControl>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      ellipsis: true,
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
              description="确认删除该字典项？"
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
    setCurrentItem(null);
    setFormVisible(true);
  };

  const handleEdit = (record: SysDictItemVo) => {
    setCurrentItem(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: SysDictItemVo) => {
    try {
      await dictItem.del(record);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleStatusChange = async (record: SysDictItemVo, status: number) => {
    try {
      await dictItem.updateStatus(record.id, status);
      message.success('状态更新成功');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleFormSuccess = () => {
    setFormVisible(false);
    actionRef.current?.reload();
  };

  return (
    <Modal
      title="字典项管理"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <ProTable<SysDictItemVo>
        headerTitle={false}
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        params={{ dictCode }}
        request={async (params) => {
          const { current, pageSize, dictCode: code } = params;
          const response = await dictItem.query({
            page: current as number,
            size: pageSize as number,
            dictCode: code as string,
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
              新增字典项
            </Button>
          </AccessControl>,
        ]}
      />

      <DictItemForm
        visible={formVisible}
        dictCode={dictCode}
        item={currentItem}
        onCancel={() => setFormVisible(false)}
        onSuccess={handleFormSuccess}
      />
    </Modal>
  );
};

export default DictItemModal;
