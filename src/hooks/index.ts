/**
 * 自定义React Hooks集合
 * 作用: 提供可复用的状态逻辑和副作用处理
 * 
 * 信息流:
 *   1. 被各个组件导入使用
 *   2. 封装通用的状态管理逻辑
 *   3. 处理副作用如API调用、事件监听等
 * 
 * 与其他文件关系:
 *   - 被 components/ 下的组件使用
 *   - 使用 utils/ 中的工具函数
 *   - 使用 types/ 中定义的类型
 */

import { useState, useEffect } from 'react';

/**
 * 当前日期Hook
 * 每秒更新一次当前时间
 */
export function useCurrentDate() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return currentDate;
}

/**
 * 本地存储Hook
 * 提供localStorage的响应式接口
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}