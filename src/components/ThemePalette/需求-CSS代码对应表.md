# 主题调色板需求-CSS代码对应表

本文档梳理了主题调色板系统中各个需求点对应的CSS样式位置，方便开发者快速定位和修改。

## 重要说明

### CSS Modules 类名映射问题
⚠️ **关键**：项目使用CSS Modules，类名会被编译成唯一哈希值。

**问题示例**：
- 源代码：`.yearContainer`
- 编译后：`.YearView_yearContainer__abc123`

**解决方案**：使用属性选择器
```css
/* ❌ 错误 - 无法匹配CSS Modules生成的类名 */
.yearContainer { background: red !important; }

/* ✅ 正确 - 使用属性选择器匹配 */
[class*="yearContainer"] { background: red !important; }
```

### 样式覆盖策略

1. **优先级管理**
   - 所有调色板样式必须加 `!important`
   - 确保覆盖默认样式和CSS Modules样式

2. **嵌套元素处理**
   - 子元素可能有自己的背景色，遮挡父元素效果
   - 解决：同时设置相关子元素背景为透明或相同颜色
   
3. **视图隔离**
   - 月视图：添加 `[class*="monthContainer"]` 前缀
   - 周视图：添加 `[class*="weekContainer"]` 前缀
   - 年视图：使用 `[class*="monthCard"]` 确保只影响年视图的月份卡片

## 一、全局样式

### 调色板配置项 → CSS选择器映射

| 调色板选项 | 应用的CSS选择器 | 说明 |
|---------|------------|-----|
| 背景颜色 | `body` | 全局背景 |
| 背景渐变 | `body` | 使用linear-gradient |
| 透明度 | `body { opacity }` | 全局透明度 |
| 背景图片 | `body { background-image }` | 支持上传本地图片 |

## 二、年视图 (YearView)

### 调色板配置项 → CSS选择器映射

| 调色板选项 | 应用的CSS选择器 | 说明 |
|---------|------------|-----|
| **容器样式** |
| 背景颜色 | `[class*="yearContainer"]` | 年视图容器背景 |
| 容器渐变 | `[class*="yearContainer"]` | 渐变背景 |
| 透明度 | `[class*="yearContainer"] { opacity }` | 容器透明度 |
| 圆角 | `[class*="yearContainer"] { border-radius }` | 容器圆角 |
| 阴影 | `[class*="yearContainer"] { box-shadow }` | 容器阴影 |
| **标题样式** |
| 标题大小 | `[class*="yearHeader"] { font-size }` | 年份标题字体大小 |
| 标题颜色 | `[class*="yearHeader"] { color; -webkit-text-fill-color }` | 需同时设置两个属性 |
| 标题粗细 | `[class*="yearHeader"] { font-weight }` | 字体粗细 |

## 三、年视图-月份卡片 (MonthCard)

### 调色板配置项 → CSS选择器映射

| 调色板选项 | 应用的CSS选择器 | 说明 |
|---------|------------|-----|
| **通用卡片样式** |
| 背景颜色 | `[class*="monthCard"]` | 月份卡片背景 |
| 背景渐变 | `[class*="monthCard"]` | 渐变背景 |
| 透明度 | `[class*="monthCard"] { opacity }` | 卡片透明度 |
| 边框颜色 | `[class*="monthCard"] { border-color }` | 边框颜色 |
| 圆角 | `[class*="monthCard"] { border-radius }` | 卡片圆角 |
| **字体样式** |
| 字体大小 | `[class*="monthNumber"] { font-size }` | 月份数字大小 |
| 字体颜色 | `[class*="monthNumber"] { color }` | 月份数字颜色 |
| **交互样式** |
| 悬浮背景 | `[class*="monthCard"]:hover` | 悬浮时背景色 |
| ~~选中背景~~ | 已移除（点击后立即跳转） | - |
| **特殊月份样式** |
| ~~当前月份背景~~ | 已移除（与今天月份重复） | - |
| ~~当前月份边框~~ | 已移除（与今天月份重复） | - |
| 今天月份背景 | `[class*="monthCard"][class*="todayMonth"]` | 今天所在月份背景 |
| 今天月份边框 | `[class*="monthCard"][class*="todayMonth"] { border }` | 需设置完整border属性 |

## 四、月视图 (MonthView)

### 调色板配置项 → CSS选择器映射

| 调色板选项 | 应用的CSS选择器 | 说明 |
|---------|------------|-----|
| **容器样式** |
| 背景颜色 | `[class*="monthContainer"]` | 月视图容器背景 |
| 容器渐变 | `[class*="monthContainer"]` | 渐变背景 |
| **标题样式** |
| 标题大小 | `[class*="monthHeader"] { font-size }` | 月份标题大小 |
| 标题颜色 | `[class*="monthHeader"] { color; -webkit-text-fill-color }` | 标题颜色 |
| **星期标题** |
| 背景颜色 | `[class*="weekdayRow"]` | 星期行背景 |
| 文字颜色 | `[class*="weekdayHeader"] { color }` | 星期文字颜色 |
| **日期单元格** |
| 单元格背景 | `[class*="monthContainer"] [class*="dayCell"]` | 需要前缀避免影响年视图 |
| 悬浮背景 | `[class*="monthContainer"] [class*="dayCell"]:hover` | 悬浮背景 |
| | `[class*="monthContainer"] [class*="dayCell"]:hover [class*="dayCellHeader"]` | 子元素透明化 |
| | `[class*="monthContainer"] [class*="dayCell"]:hover [class*="dayNumber"]` | 子元素透明化 |
| | `[class*="monthContainer"] [class*="dayCell"]:hover [class*="lunarInfo"]` | 子元素透明化 |
| 日期大小 | `[class*="monthContainer"] [class*="dayNumber"] { font-size }` | 日期数字大小 |
| 日期颜色 | `[class*="monthContainer"] [class*="dayNumber"] { color }` | 日期数字颜色 |
| **今天样式** |
| 背景颜色 | `[class*="monthContainer"] [class*="today"]` | 今天背景 |
| 文字颜色 | `[class*="monthContainer"] [class*="today"] [class*="dayNumber"]` | 今天日期颜色 |
| **农历样式** |
| 农历大小 | `[class*="monthContainer"] [class*="lunar"] { font-size }` | 农历字体大小 |
| 农历颜色 | `[class*="monthContainer"] [class*="lunar"] { color }` | 农历文字颜色 |
| 节日颜色 | `[class*="monthContainer"] [class*="festival"] { color }` | 节日文字颜色 |
| 节气颜色 | `[class*="monthContainer"] [class*="solarTerm"] { color }` | 节气文字颜色 |

### ⚠️ 无法控制的样式
- `.otherMonth` - 动态涂灰区域（基于滚动位置计算）
- `.currentMonth` - 当前月份区域（动态判断）

## 五、周视图 (WeekView)

### 调色板配置项 → CSS选择器映射

| 调色板选项 | 应用的CSS选择器 | 说明 |
|---------|------------|-----|
| **容器样式** |
| 背景颜色 | `[class*="weekContainer"]` | 周视图容器背景 |
| **标题样式** |
| 标题大小 | `[class*="weekHeader"] { font-size }` | 周标题大小 |
| 标题颜色 | `[class*="weekHeader"] { color }` | 周标题颜色 |
| **日期行标题** |
| 背景颜色 | `[class*="dayHeader"]` | 日期行背景 |
| 星期名称颜色 | `[class*="dayName"] { color }` | 星期名称颜色 |
| 日期颜色 | `[class*="dayDate"] { color }` | 日期数字颜色 |
| **今天标题** |
| 背景颜色 | `[class*="dayHeader"][class*="today"]` | 今天标题背景 |
| 文字颜色 | `[class*="dayHeader"][class*="today"] [class*="dayName"]` | 今天星期颜色 |
| | `[class*="dayHeader"][class*="today"] [class*="dayDate"]` | 今天日期颜色 |
| **时间列样式** |
| 背景颜色 | `[class*="timeColumn"]` | 时间列背景 |
| | `[class*="timeSlot"]` | 时间槽也需要设置 |
| | `[class*="cornerCell"]` | 左上角也需要设置 |
| 时间文字颜色 | `[class*="timeSlot"] { color }` | 时间文字颜色 |
| 时间字体大小 | `[class*="timeSlot"] { font-size }` | 时间字体大小 |
| **小时格子** |
| 格子背景 | `[class*="hourCell"]` | 小时格子背景 |
| 边框颜色 | `[class*="hourCell"] { border-color }` | 格子边框颜色 |
| 悬浮背景 | `[class*="hourCell"]:hover` | 格子悬浮背景 |
| **农历样式** |
| 农历大小 | `[class*="weekContainer"] [class*="lunar"] { font-size }` | 需要前缀隔离 |
| 农历颜色 | `[class*="weekContainer"] [class*="lunar"] { color }` | 农历颜色 |
| 节日颜色 | `[class*="weekContainer"] [class*="festival"] { color }` | 节日颜色 |
| 节气颜色 | `[class*="weekContainer"] [class*="solarTerm"] { color }` | 节气颜色 |

## 六、开发经验总结

### 常见问题及解决方案

1. **样式不生效**
   - 检查是否使用了属性选择器
   - 确认添加了 `!important`
   - 验证选择器优先级

2. **悬浮效果异常**
   - 子元素可能有独立背景
   - 需同时设置子元素透明

3. **样式互相影响**
   - 使用视图前缀隔离
   - 避免使用过于通用的选择器

4. **边框样式问题**
   - 设置边框颜色时需要完整的border属性
   - 例：`border: 2px solid ${color}`

### 调试技巧

1. 使用浏览器开发者工具查看实际生成的类名
2. 验证CSS选择器是否正确匹配元素
3. 检查样式优先级和覆盖关系
4. 测试不同视图切换时的样式隔离

## 七、版本更新记录

### 2025-08-27
- 完善CSS Modules兼容性说明
- 添加选择器映射表
- 记录已移除的功能
- 补充开发经验和常见问题