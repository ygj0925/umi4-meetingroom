import {
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import type { SysDictVo } from '@/services/web/system';
import { dict } from '@/services/web/system';

interface DictFormProps {
  visible: boolean;
  dict: SysDictVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DictForm: React.FC<DictFormProps> = ({
  visible,
  dict: dictData,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible) {
      if (dictData) {
        form.setFieldsValue(dictData);
      } else {
        form.resetFields();
      }
    }
  }, [visible, dictData, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (dictData) {
        await dict.edit({ ...values, id: dictData.id });
      } else {
        await dict.create(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <Modal
      title={dictData ? '编辑字典' : '新增字典'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        initialValues={{ valueType: 2 }}
      >
        <ProFormText
          name="code"
          label="字典标识"
          placeholder="请输入字典标识"
          rules={[{ required: true, message: '请输入字典标识' }]}
          disabled={!!dictData}
        />
        <ProFormText
          name="title"
          label="字典名称"
          placeholder="请输入字典名称"
          rules={[{ required: true, message: '请输入字典名称' }]}
        />
        <ProFormSelect
          name="valueType"
          label="数据类型"
          options={[
            { label: 'Number', value: 1 },
            { label: 'String', value: 2 },
            { label: 'Boolean', value: 3 },
          ]}
          rules={[{ required: true, message: '请选择数据类型' }]}
          disabled={!!dictData}
        />
        <ProFormTextArea name="remarks" label="备注" placeholder="请输入备注" />
      </ProForm>
    </Modal>
  );
};

export default DictForm;
