import { useCallback, useEffect, useState } from 'react';
import type { SysDictData, SysDictDataItem } from '@/services/web/system';
import { dict } from '@/services/web/system';
import { useDictContext } from './DictProvider';

export function useDict(dictCode: string) {
  const { dictMap, getDictData, loading: contextLoading } = useDictContext();
  const [localLoading, setLocalLoading] = useState(false);
  const [dictData, setDictData] = useState<SysDictData | undefined>(
    getDictData(dictCode),
  );

  useEffect(() => {
    const data = getDictData(dictCode);
    if (data) {
      setDictData(data);
    } else if (dictCode) {
      setLocalLoading(true);
      dict
        .dictData([dictCode])
        .then((response) => {
          if (response?.data?.[0]) {
            const item = response.data[0];
            setDictData({
              ...item,
              dictItems: item.dictItems.map((dictItem) => ({
                ...dictItem,
                realVal: getRealValue(item.valueType, dictItem.value),
              })),
            });
          }
        })
        .catch((error) => {
          console.error('Failed to load dict:', error);
        })
        .finally(() => {
          setLocalLoading(false);
        });
    }
  }, [dictCode, getDictData]);

  const getRealValue = (valueType: number, value: string): any => {
    switch (valueType) {
      case 1:
        return Number(value);
      case 3:
        return value === 'true';
      default:
        return value;
    }
  };

  return {
    dictData,
    dictItems: dictData?.dictItems || [],
    loading: contextLoading || localLoading,
  };
}

export function useDictItem(dictCode: string, value: string) {
  const { getDictItem } = useDictContext();
  const { dictData, loading } = useDict(dictCode);

  const dictItem = getDictItem(dictCode, value);

  return {
    dictItem,
    name: dictItem?.name || String(value),
    attributes: dictItem?.attributes,
    loading,
  };
}

export default useDict;
