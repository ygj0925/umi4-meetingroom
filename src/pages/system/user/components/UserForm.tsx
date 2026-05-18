import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import type { SysUserVo } from '@/services/web/system';
import { organization, role, user } from '@/services/web/system';

interface UserFormProps {
  visible: boolean;
  user: SysUserVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  visible,
  user: userData,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible) {
      if (userData) {
        form.setFieldsValue(userData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, userData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (userData) {
        await user.edit({ ...values, userId: userData.userId });
      } else {
        await user.create(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const loadOrgTree = async () => {
    const response = await organization.query();
    const convertToTreeData = (items: any[]): any[] => {
      return items.map((item) => ({
        title: item.name,
        value: item.id,
        children: item.children ? convertToTreeData(item.children) : [],
      }));
    };
    return convertToTreeData(response.data || []);
  };

  const loadRoles = async () => {
    const response = await role.listSelectData();
    return response.data || [];
  };

  return (
    <Modal
      title={userData ? '编辑用户' : '新增用户'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        initialValues={{ gender: 0, status: 1, type: 1 }}
      >
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
          disabled={!!userData}
        />
        {!userData && (
          <ProFormText.Password
            name="pass"
            label="密码"
            placeholder="请输入密码"
            rules={[
              { required: true, message: '请输入密码' },
              {
                pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,12}$/,
                message: '密码必须为6-12位数字+字母组合',
              },
            ]}
          />
        )}
        <ProFormText
          name="nickname"
          label="昵称"
          placeholder="请输入昵称"
          rules={[{ required: true, message: '请输入昵称' }]}
        />
        <ProFormSelect
          name="gender"
          label="性别"
          options={[
            { label: '未知', value: 0 },
            { label: '男', value: 1 },
            { label: '女', value: 2 },
          ]}
        />
        <ProFormText name="phoneNumber" label="电话" placeholder="请输入电话" />
        <ProFormText name="email" label="邮箱" placeholder="请输入邮箱" />
        <ProFormTreeSelect
          name="organizationId"
          label="组织"
          placeholder="请选择组织"
          request={loadOrgTree}
          fieldProps={{
            treeDefaultExpandAll: true,
          }}
        />
        <ProFormSelect
          name="roleCodes"
          label="角色"
          placeholder="请选择角色"
          mode="multiple"
          request={async () => {
            const data = await loadRoles();
            return data.map((item: any) => ({
              label: item.name,
              value: item.value,
            }));
          }}
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '正常', value: 1 },
            { label: '冻结', value: 0 },
          ]}
        />
      </ProForm>
    </Modal>
  );
};

export default UserForm;
