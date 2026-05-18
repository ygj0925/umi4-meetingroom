import {
  ProForm,
  ProFormDigit,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect } from 'react';
import type { SysOrganizationVo } from '@/services/web/system';
import { organization } from '@/services/web/system';

interface OrgFormProps {
  visible: boolean;
  org: SysOrganizationVo | null;
  parentOrg: SysOrganizationVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const OrgForm: React.FC<OrgFormProps> = ({
  visible,
  org,
  parentOrg,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();

  useEffect(() => {
    if (visible) {
      if (org) {
        form.setFieldsValue(org);
      } else {
        form.resetFields();
        if (parentOrg) {
          form.setFieldsValue({ parentId: parentOrg.id });
        }
      }
    }
  }, [visible, org, parentOrg, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (org) {
        await organization.edit({ ...values, id: org.id });
      } else {
        await organization.create(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const loadTreeData = async () => {
    const response = await organization.query();
    return response.data || [];
  };

  return (
    <Modal
      title={org ? '编辑组织' : '新增组织'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <ProForm form={form} onFinish={handleSubmit} initialValues={{ sort: 0 }}>
        <ProFormTreeSelect
          name="parentId"
          label="上级组织"
          placeholder="请选择上级组织（不选则为顶级）"
          allowClear
          request={async () => {
            const data = await loadTreeData();
            const convertToTreeData = (items: SysOrganizationVo[]): any[] => {
              return items.map((item) => ({
                title: item.name,
                value: item.id,
                children: item.children ? convertToTreeData(item.children) : [],
              }));
            };
            return convertToTreeData(data);
          }}
          fieldProps={{
            treeDefaultExpandAll: true,
          }}
        />
        <ProFormText
          name="name"
          label="组织名称"
          placeholder="请输入组织名称"
          rules={[{ required: true, message: '请输入组织名称' }]}
        />
        <ProFormDigit
          name="sort"
          label="排序"
          placeholder="请输入排序"
          min={0}
          fieldProps={{ precision: 0 }}
        />
        <ProFormTextArea name="remarks" label="备注" placeholder="请输入备注" />
      </ProForm>
    </Modal>
  );
};

export default OrgForm;
