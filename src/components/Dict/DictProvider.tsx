import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { SysDictData, SysDictDataItem } from '@/services/web/system';
import { dict } from '@/services/web/system';

interface DictContextType {
  dictMap: Record<string, SysDictData>;
  loading: boolean;
  getDictData: (dictCode: string) => SysDictData | undefined;
  getDictItem: (dictCode: string, value: string) => SysDictDataItem | undefined;
  getDictItemName: (dictCode: string, value: string) => string;
  refreshDict: (dictCodes?: string[]) => Promise<void>;
}

const DictContext = createContext<DictContextType>({
  dictMap: {},
  loading: false,
  getDictData: () => undefined,
  getDictItem: () => undefined,
  getDictItemName: () => '',
  refreshDict: async () => {},
});

export const useDictContext = () => useContext(DictContext);

interface DictProviderProps {
  children: React.ReactNode;
  dictCodes?: string[];
}

export const DictProvider: React.FC<DictProviderProps> = ({
  children,
  dictCodes = [],
}) => {
  const [dictMap, setDictMap] = useState<Record<string, SysDictData>>({});
  const [loading, setLoading] = useState(false);

  const loadDictData = useCallback(async (codes: string[]) => {
    if (codes.length === 0) return;

    setLoading(true);
    try {
      const response = await dict.dictData(codes);
      if (response?.data) {
        setDictMap((prev) => {
          const newMap = { ...prev };
          response.data.forEach((item) => {
            newMap[item.dictCode] = {
              ...item,
              dictItems: item.dictItems.map((dictItem) => ({
                ...dictItem,
                realVal: getRealValue(item.valueType, dictItem.value),
              })),
            };
          });
          return newMap;
        });
      }
    } catch (error) {
      console.error('Failed to load dict data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRealValue = (valueType: number, value: string): any => {
    switch (valueType) {
      case 1: // Number
        return Number(value);
      case 3: // Boolean
        return value === 'true';
      default: // String
        return value;
    }
  };

  const getDictData = useCallback(
    (dictCode: string) => {
      return dictMap[dictCode];
    },
    [dictMap],
  );

  const getDictItem = useCallback(
    (dictCode: string, value: string) => {
      const dictData = dictMap[dictCode];
      if (!dictData) return undefined;
      return dictData.dictItems.find((item) => item.value === String(value));
    },
    [dictMap],
  );

  const getDictItemName = useCallback(
    (dictCode: string, value: string) => {
      const item = getDictItem(dictCode, value);
      return item?.name || String(value);
    },
    [getDictItem],
  );

  const refreshDict = useCallback(
    async (codes?: string[]) => {
      const targetCodes = codes || Object.keys(dictMap);
      if (targetCodes.length > 0) {
        await loadDictData(targetCodes);
      }
    },
    [dictMap, loadDictData],
  );

  useEffect(() => {
    if (dictCodes.length > 0) {
      loadDictData(dictCodes);
    }
  }, [dictCodes, loadDictData]);

  return (
    <DictContext.Provider
      value={{
        dictMap,
        loading,
        getDictData,
        getDictItem,
        getDictItemName,
        refreshDict,
      }}
    >
      {children}
    </DictContext.Provider>
  );
};

export default DictProvider;
