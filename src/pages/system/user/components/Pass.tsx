import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Modal } from 'antd';
import React from 'react';
import type { SysUserVo } from '@/services/web/system';
import { user } from '@/services/web/system';

interface PassModalProps {
  visible: boolean;
  user: SysUserVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const PassModal: React.FC<PassModalProps> = ({
  visible,
  user: userData,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  const handleSubmit = async (values: any) => {
    if (!userData) return;
    try {
      await user.changePassword({
        userId: userData.userId,
        username: userData.username,
        pass: values.pass,
      });
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <ProForm form={form} onFinish={handleSubmit}>
        <ProFormText.Password
          name="pass"
          label="新密码"
          placeholder="请输入新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            {
              pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,12}$/,
              message: '密码必须为6-12位数字+字母组合',
            },
          ]}
        />
        <ProFormText.Password
          name="confirmPass"
          label="确认密码"
          placeholder="请再次输入新密码"
          dependencies={['pass']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('pass') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次密码输入不一致'));
              },
            }),
          ]}
        />
      </ProForm>
    </Modal>
  );
};

export default PassModal;
