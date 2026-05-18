import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import type { SysDictItemVo } from '@/services/web/system';
import {
  badgeDefaultColorArray,
  badgeStatusArray,
  dictItem,
  tagDefaultColorArray,
} from '@/services/web/system';

interface DictItemFormProps {
  visible: boolean;
  dictCode: string;
  item: SysDictItemVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const DictItemForm: React.FC<DictItemFormProps> = ({
  visible,
  dictCode,
  item,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible) {
      if (item) {
        form.setFieldsValue({
          ...item,
          tagColor: item.attributes?.tagColor,
          textColor: item.attributes?.textColor,
          badgeColor: item.attributes?.badgeColor,
          badgeStatus: item.attributes?.badgeStatus,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, item, form]);

  const handleSubmit = async (values: any) => {
    const { tagColor, textColor, badgeColor, badgeStatus, ...rest } = values;
    const attributes = {
      tagColor,
      textColor,
      badgeColor,
      badgeStatus,
    };

    try {
      if (item) {
        await dictItem.edit({
          ...rest,
          id: item.id,
          dictCode,
          attributes,
        });
      } else {
        await dictItem.create({
          ...rest,
          dictCode,
          attributes,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  return (
    <Modal
      title={item ? '编辑字典项' : '新增字典项'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <ProForm form={form} onFinish={handleSubmit} initialValues={{ sort: 0 }}>
        <ProFormText
          name="name"
          label="文本值"
          placeholder="请输入文本值"
          rules={[{ required: true, message: '请输入文本值' }]}
        />
        <ProFormText
          name="value"
          label="数据值"
          placeholder="请输入数据值"
          rules={[{ required: true, message: '请输入数据值' }]}
        />
        <ProFormDigit
          name="sort"
          label="排序"
          placeholder="请输入排序"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormSelect
          name="tagColor"
          label="标签颜色"
          options={tagDefaultColorArray.map((color) => ({
            label: color,
            value: color,
          }))}
          allowClear
        />
        <ProFormText
          name="textColor"
          label="文本颜色"
          placeholder="如: #ff0000"
        />
        <ProFormSelect
          name="badgeColor"
          label="徽标颜色"
          options={badgeDefaultColorArray.map((color) => ({
            label: color,
            value: color,
          }))}
          allowClear
        />
        <ProFormSelect
          name="badgeStatus"
          label="徽标状态"
          options={badgeStatusArray.map((status) => ({
            label: status,
            value: status,
          }))}
          allowClear
        />
        <ProFormTextArea name="remarks" label="备注" placeholder="请输入备注" />
      </ProForm>
    </Modal>
  );
};

export default DictItemForm;
