import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import type { SysRoleVo } from '@/services/web/system';
import { role } from '@/services/web/system';

interface RoleFormProps {
  visible: boolean;
  role: SysRoleVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  visible,
  role: roleData,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible) {
      if (roleData) {
        form.setFieldsValue(roleData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, roleData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (roleData) {
        await role.edit({ ...values, id: roleData.id });
      } else {
        await role.create(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <Modal
      title={roleData ? '编辑角色' : '新增角色'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <ProForm form={form} onFinish={handleSubmit} initialValues={{ type: 1 }}>
        <ProFormText
          name="name"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormText
          name="code"
          label="角色标识"
          placeholder="请输入角色标识（以 ROLE_ 开头）"
          rules={[
            { required: true, message: '请输入角色标识' },
            { pattern: /^ROLE_/, message: '角色标识必须以 ROLE_ 开头' },
          ]}
          disabled={!!roleData}
        />
        <ProFormSelect
          name="type"
          label="角色类型"
          options={[
            { label: '系统角色', value: 1 },
            { label: '业务角色', value: 2 },
          ]}
          rules={[{ required: true, message: '请选择角色类型' }]}
        />
        <ProFormTextArea name="remarks" label="备注" placeholder="请输入备注" />
      </ProForm>
    </Modal>
  );
};

export default RoleForm;
