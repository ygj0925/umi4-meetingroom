import { history, useLocation } from '@umijs/max';
import { message } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import RouteUtils from '@/utils/RouteUtils';

export interface TabItem {
  key: string;
  title: string;
  closable: boolean;
}

export default function useMultiTab() {
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [activeKey, setActiveKey] = useState<string>('');
  const location = useLocation();
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/user/') || pathname === '/404') return;

    const menuDict = RouteUtils.getMenuDict();
    const menu = menuDict[pathname];
    if (!menu) return;

    const title = (menu.name as string) || pathname;

    setTabs((prev) => {
      const exists = prev.some((t) => t.key === pathname);
      if (exists) return prev;
      return [...prev, { key: pathname, title, closable: true }];
    });
    setActiveKey(pathname);
  }, [location.pathname]);

  const removeTab = useCallback(
    (key: string) => {
      const current = tabsRef.current;
      if (current.length <= 1) {
        message.warning('禁止关闭最后一个标签页!');
        return [];
      }
      const idx = current.findIndex((t) => t.key === key);
      const next = current.filter((t) => t.key !== key);
      setTabs(next);

      if (key === activeKey) {
        const newActive = idx > 0 ? next[idx - 1]?.key : next[0]?.key;
        if (newActive) {
          setActiveKey(newActive);
          history.push(newActive);
        }
      }
      return [key];
    },
    [activeKey],
  );

  const removeLeft = useCallback(
    (key: string) => {
      const current = tabsRef.current;
      const idx = current.findIndex((t) => t.key === key);
      const toRemove = current.slice(0, idx).map((t) => t.key);
      if (toRemove.length === 0) {
        message.warning('没有可以被关闭的标签页!');
        return [];
      }
      setTabs((prev) => prev.filter((t) => !toRemove.includes(t.key)));
      if (toRemove.includes(activeKey)) {
        setActiveKey(key);
        history.push(key);
      }
      return toRemove;
    },
    [activeKey],
  );

  const removeRight = useCallback(
    (key: string) => {
      const current = tabsRef.current;
      const idx = current.findIndex((t) => t.key === key);
      const toRemove = current.slice(idx + 1).map((t) => t.key);
      if (toRemove.length === 0) {
        message.warning('没有可以被关闭的标签页!');
        return [];
      }
      setTabs((prev) => prev.filter((t) => !toRemove.includes(t.key)));
      if (toRemove.includes(activeKey)) {
        setActiveKey(key);
        history.push(key);
      }
      return toRemove;
    },
    [activeKey],
  );

  const removeOthers = useCallback(
    (key: string) => {
      const current = tabsRef.current;
      const toRemove = current.filter((t) => t.key !== key).map((t) => t.key);
      if (toRemove.length === 0) {
        message.warning('没有可以被关闭的标签页!');
        return [];
      }
      setTabs((prev) => prev.filter((t) => t.key === key));
      if (activeKey !== key) {
        setActiveKey(key);
        history.push(key);
      }
      return toRemove;
    },
    [activeKey],
  );

  const clear = useCallback(() => {
    setTabs([]);
    setActiveKey('');
    return tabsRef.current.map((t) => t.key);
  }, []);

  return {
    tabs,
    activeKey,
    setActiveKey,
    removeTab,
    removeLeft,
    removeRight,
    removeOthers,
    clear,
  };
}
