import {
  ProForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import type { SysConfigVo } from '@/services/web/system';
import { config } from '@/services/web/system';

interface ConfigFormProps {
  visible: boolean;
  config: SysConfigVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  visible,
  config: configData,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible) {
      if (configData) {
        form.setFieldsValue(configData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, configData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (configData) {
        await config.edit({ ...values, id: configData.id });
      } else {
        await config.create(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <Modal
      title={configData ? '编辑配置' : '新增配置'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <ProForm form={form} onFinish={handleSubmit}>
        <ProFormText
          name="name"
          label="配置名称"
          placeholder="请输入配置名称"
          rules={[{ required: true, message: '请输入配置名称' }]}
        />
        <ProFormText
          name="confKey"
          label="配置Key"
          placeholder="请输入配置Key"
          rules={[{ required: true, message: '请输入配置Key' }]}
          disabled={!!configData}
        />
        <ProFormText
          name="confValue"
          label="配置值"
          placeholder="请输入配置值"
          rules={[{ required: true, message: '请输入配置值' }]}
        />
        <ProFormText name="category" label="分类" placeholder="请输入分类" />
        <ProFormTextArea name="remarks" label="备注" placeholder="请输入备注" />
      </ProForm>
    </Modal>
  );
};

export default ConfigForm;
