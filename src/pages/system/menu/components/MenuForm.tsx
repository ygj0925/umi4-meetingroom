import {
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import type { SysMenuVo } from '@/services/web/system';
import { menu } from '@/services/web/system';

interface MenuFormProps {
  visible: boolean;
  menu: SysMenuVo | null;
  parentMenu: SysMenuVo | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const MenuForm: React.FC<MenuFormProps> = ({
  visible,
  menu: menuData,
  parentMenu,
  onCancel,
  onSuccess,
}) => {
  const [form] = ProForm.useForm();
  const [menuType, setMenuType] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      if (menuData) {
        form.setFieldsValue(menuData);
        setMenuType(menuData.type);
      } else {
        form.resetFields();
        const defaultType = parentMenu ? (parentMenu.type === 0 ? 1 : 2) : 0;
        form.setFieldsValue({ type: defaultType, parentId: parentMenu?.id });
        setMenuType(defaultType);
      }
    }
  }, [visible, menuData, parentMenu, form]);

  const handleSubmit = async (values: any) => {
    try {
      if (menuData) {
        await menu.edit({ ...values, id: menuData.id });
      } else {
        await menu.create(values);
      }
      onSuccess();
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleTypeChange = (value: number) => {
    setMenuType(value);
    form.setFieldsValue({ targetType: value === 2 ? undefined : 1 });
  };

  const loadTreeData = async () => {
    const response = await menu.query({});
    const convertToTreeData = (items: SysMenuVo[]): any[] => {
      return items
        .filter((item) => item.type !== 2)
        .map((item) => ({
          title: item.title,
          value: item.id,
          children: item.children ? convertToTreeData(item.children) : [],
        }));
    };
    return convertToTreeData(response.data || []);
  };

  return (
    <Modal
      title={menuData ? '编辑菜单' : '新增菜单'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          type: 0,
          sort: 0,
          keepAlive: 0,
          hidden: 0,
          targetType: 1,
        }}
      >
        <ProFormTreeSelect
          name="parentId"
          label="上级菜单"
          placeholder="请选择上级菜单（不选则为顶级）"
          allowClear
          request={loadTreeData}
          fieldProps={{
            treeDefaultExpandAll: true,
          }}
        />
        <ProFormSelect
          name="type"
          label="菜单类型"
          options={[
            { label: '目录', value: 0 },
            { label: '菜单', value: 1 },
            { label: '按钮', value: 2 },
          ]}
          rules={[{ required: true, message: '请选择菜单类型' }]}
          fieldProps={{ onChange: handleTypeChange }}
        />
        <ProFormText
          name="title"
          label="菜单名称"
          placeholder="请输入菜单名称"
          rules={[{ required: true, message: '请输入菜单名称' }]}
        />
        <ProFormText
          name="id"
          label="菜单ID"
          placeholder={
            menuType === 0
              ? '目录格式: XX0000'
              : menuType === 1
                ? '菜单格式: XXXX00'
                : '按钮格式: XXXXXX'
          }
          rules={[{ required: true, message: '请输入菜单ID' }]}
          disabled={!!menuData}
        />
        {menuType !== 2 && (
          <>
            <ProFormText
              name="icon"
              label="图标"
              placeholder="请输入图标名称"
            />
            <ProFormText
              name="path"
              label="路由地址"
              placeholder="请输入路由地址"
              rules={[{ required: true, message: '请输入路由地址' }]}
            />
          </>
        )}
        {menuType === 1 && (
          <>
            <ProFormSelect
              name="targetType"
              label="打开方式"
              options={[
                { label: '组件', value: 1 },
                { label: '内链', value: 2 },
                { label: '外链', value: 3 },
              ]}
              rules={[{ required: true, message: '请选择打开方式' }]}
            />
            <ProFormText
              name="uri"
              label="资源路径"
              placeholder="组件路径或URL地址"
              rules={[{ required: true, message: '请输入资源路径' }]}
            />
            <ProFormSwitch
              name="keepAlive"
              label="组件缓存"
              initialValue={false}
              fieldProps={{
                checkedChildren: '开启',
                unCheckedChildren: '关闭',
              }}
            />
          </>
        )}
        {menuType === 2 && (
          <ProFormText
            name="permission"
            label="授权标识"
            placeholder="如: system:user:add"
            rules={[{ required: true, message: '请输入授权标识' }]}
          />
        )}
        <ProFormSwitch
          name="hidden"
          label="隐藏菜单"
          initialValue={false}
          fieldProps={{
            checkedChildren: '是',
            unCheckedChildren: '否',
          }}
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

export default MenuForm;
