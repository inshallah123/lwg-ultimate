/**
 * 月视图组件
 * 作用: 显示月度日历视图，展示整月的日期和事件
 * 
 * 信息流:
 *   1. 接收来自App.tsx的props和状态
 *   2. 计算并渲染月度日历网格(6周x7天)
 *   3. 处理用户的日期选择和事件点击
 *   4. 与事件相关组件通信显示事件详情
 * 
 * 与其他文件关系:
 *   - 被 App.tsx 导入和使用
 *   - 可能调用 events/ 下的事件组件
 *   - 未来可能使用 hooks/ 下的日期处理逻辑
 *   - 可能使用 utils/ 下的日期工具函数
 */
import React from 'react';

export function MonthView() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  const currentDay = new Date(startDate);
  
  while (days.length < 42) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <div>
      <h2>{monthNames[currentMonth]} {currentYear}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{ padding: '8px', fontWeight: 'bold', textAlign: 'center' }}>
            {day}
          </div>
        ))}
        {days.map((day, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '8px', 
              textAlign: 'center',
              backgroundColor: day.getMonth() === currentMonth ? '#f0f0f0' : '#e0e0e0'
            }}
          >
            {day.getDate()}
          </div>
        ))}
      </div>
    </div>
  );
}