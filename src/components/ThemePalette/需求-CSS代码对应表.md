# 主题调色板需求-CSS代码对应表

本文档梳理了主题调色板系统中各个需求点对应的CSS样式位置，方便开发者快速定位和修改。

## 一、全局样式 (`src/index.css`)

### 1. 全局背景
| 需求         | CSS属性位置                           | 当前值                                                                 |
|------------|-----------------------------------|---------------------------------------------------------------------|
| 背景颜色       | `body { background }` (第13行)      | `var(--color-bg-secondary)`                                         |
| 背景渐变（深色模式） | `body { background }` (第172-175行) | `linear-gradient(180deg, var(--color-bg-primary) 0%, #1a202c 100%)` |
| 透明度        | 可通过修改颜色值的alpha通道实现                | -                                                                   |

### 2. 全局颜色变量
| 需求    | CSS变量                      | 行号 | 说明                                        |
|-------|----------------------------|----|-------------------------------------------|
| 主色调   | `--color-primary`          | 23 | #5B8DBE                                   |
| 主色调渐变 | `--color-primary-gradient` | 28 | linear-gradient(135deg, #5B8DBE, #7BA7D1) |
| 背景主色  | `--color-bg-primary`       | 50 | #FFFFFF                                   |
| 背景次色  | `--color-bg-secondary`     | 51 | #f8fcfb                                   |
| 文字主色  | `--color-text-primary`     | 43 | #2C3E50                                   |
| 边框色   | `--color-border`           | 63 | #539dd6                                   |

## 二、Calendar组件

### （一）Year View 年视图 (`src/components/calendar/year/YearView.module.css`)

#### 容器样式
| 需求   | CSS位置                                   | 行号    | 当前值                                                                                   |
|------|-----------------------------------------|-------|---------------------------------------------------------------------------------------|
| 背景颜色 | `.yearContainer { background }`         | 9     | #ffffff                                                                               |
| 背景渐变 | `.yearContainer::before { background }` | 17-20 | linear-gradient(180deg, rgba(168, 196, 212, 0.08) 0%, rgba(224, 197, 210, 0.04) 100%) |
| 透明度  | `.yearContainer::before { opacity }`    | 21    | 0.9                                                                                   |
| 边框圆角 | `.yearContainer { border-radius }`      | 10    | 12px                                                                                  |
| 阴影   | `.yearContainer { box-shadow }`         | 11    | 0 4px 6px rgba(0, 0, 0, 0.1)                                                          |

#### 标题样式
| 需求   | CSS位置                         | 行号    | 当前值    |
|------|-------------------------------|-------|--------|
| 字体大小 | `.yearHeader { font-size }`   | 233   | 1.5rem |
| 字体颜色 | `.yearHeader { background }`  | 28-31 | 渐变文字效果 |
| 字体粗细 | `.yearHeader { font-weight }` | 27    | 400    |

### （二）Year Section (`src/components/calendar/year/YearSection.module.css`)

| 需求     | CSS位置                                            | 行号 | 当前值     |
|--------|--------------------------------------------------|----|---------|
| 当前年份背景 | `.yearSection.currentYear::before { color }`     | 15 | #a8c4d4 |
| 透明度    | `.yearSection.currentYear::before { opacity }`   | 16 | 0.1     |
| 滚动时透明度 | `.yearSection.scrolling { opacity }`             | 8  | 0.7     |
| 字体大小   | `.yearSection.currentYear::before { font-size }` | 13 | 3em     |

### （三）Month Card 月份卡片 (`src/components/calendar/year/MonthCard.module.css`)

#### 月份卡片通用样式
| 需求   | CSS位置                             | 行号 | 当前值                          |
|------|-----------------------------------|----|------------------------------|
| 背景颜色 | `.monthCard { background }`       | 3  | #ffffff                      |
| 边框颜色 | `.monthCard { border }`           | 4  | 1px solid #e2e8f0            |
| 圆角   | `.monthCard { border-radius }`    | 5  | 8px                          |
| 悬浮背景 | `.monthCard:hover { background }` | 10 | #f8fafc                      |
| 悬浮阴影 | `.monthCard:hover { box-shadow }` | 12 | 0 4px 8px rgba(0, 0, 0, 0.1) |

#### 当前月份样式
| 需求   | CSS位置                            | 行号 | 当前值                       |
|------|----------------------------------|----|---------------------------|
| 背景颜色 | `.currentMonth { background }`   | 16 | rgba(168, 196, 212, 0.15) |
| 边框颜色 | `.currentMonth { border-color }` | 17 | #a8c4d4                   |

#### 今天月份样式
| 需求   | CSS位置                          | 行号 | 当前值     |
|------|--------------------------------|----|---------|
| 背景颜色 | `.todayMonth { background }`   | 21 | #e8f2fa |
| 边框颜色 | `.todayMonth { border-color }` | 22 | #a8c4d4 |
| 字体粗细 | `.todayMonth { font-weight }`  | 23 | 600     |

#### 月份文字样式
| 需求   | CSS位置                        | 行号 | 当前值     |
|------|------------------------------|----|---------|
| 数字大小 | `.monthNumber { font-size }` | 27 | 1.8em   |
| 数字颜色 | `.monthNumber { color }`     | 29 | #2c3e50 |
| 名称大小 | `.monthName { font-size }`   | 33 | 0.9em   |
| 名称颜色 | `.monthName { color }`       | 34 | #5a6c7d |

### （四）Month View 月视图 (`src/components/calendar/month/MonthView.module.css`)

#### 容器样式
| 需求   | CSS位置                                    | 行号    | 当前值                                                                                   |
|------|------------------------------------------|-------|---------------------------------------------------------------------------------------|
| 背景颜色 | `.monthContainer { background }`         | 41    | var(--bg-primary)                                                                     |
| 背景渐变 | `.monthContainer::before { background }` | 50-53 | linear-gradient(180deg, rgba(168, 196, 212, 0.06) 0%, rgba(224, 197, 210, 0.03) 100%) |
| 透明度  | `.monthContainer::before { opacity }`    | 54    | 0.8                                                                                   |
| 边框圆角 | `.monthContainer { border-radius }`      | 42    | 12px                                                                                  |
| 阴影   | `.monthContainer { box-shadow }`         | 43    | 0 4px 6px rgba(0, 0, 0, 0.1)                                                          |

#### 标题样式
| 需求   | CSS位置                          | 行号    | 当前值     |
|------|--------------------------------|-------|---------|
| 字体大小 | `.monthHeader { font-size }`   | 262   | 1.75rem |
| 字体颜色 | `.monthHeader { background }`  | 60-63 | 渐变文字效果  |
| 字体粗细 | `.monthHeader { font-weight }` | 65    | 400     |

#### 星期标题样式
| 需求   | CSS位置                            | 行号  | 当前值                                               |
|------|----------------------------------|-----|---------------------------------------------------|
| 背景颜色 | `.weekdayRow { background }`     | 79  | linear-gradient(180deg, #fafbfc 0%, #f8f9fa 100%) |
| 文字颜色 | `.weekdayHeader { color }`       | 86  | var(--text-secondary)                             |
| 字体大小 | `.weekdayHeader { font-size }`   | 288 | 0.75rem                                           |
| 字体粗细 | `.weekdayHeader { font-weight }` | 87  | 500                                               |

#### 日期单元格样式
| 需求     | CSS位置                           | 行号      | 当前值                                                                           |
|--------|---------------------------------|---------|-------------------------------------------------------------------------------|
| 背景颜色   | `.dayCell { background }`       | 104     | var(--bg-primary)                                                             |
| 悬浮背景   | `.dayCell:hover { background }` | 150-153 | linear-gradient(135deg, rgba(168, 196, 212, 0.05), rgba(224, 197, 210, 0.02)) |
| 边框颜色   | `.dayCell { border }`           | 105-106 | 1px solid var(--border-light)                                                 |
| 日期字体大小 | `.dayNumber { font-size }`      | 325     | 1.125rem                                                                      |
| 日期字体颜色 | `.dayNumber { color }`          | 121     | var(--text-primary)                                                           |

#### 今天样式
| 需求   | CSS位置                         | 行号      | 当前值                                                                           |
|------|-------------------------------|---------|-------------------------------------------------------------------------------|
| 背景颜色 | `.today { background }`       | 199-202 | linear-gradient(135deg, rgba(168, 196, 212, 0.15), rgba(224, 197, 210, 0.08)) |
| 边框颜色 | `.today { border }`           | 203     | 2px solid var(--border-accent)                                                |
| 阴影   | `.today { box-shadow }`       | 204-206 | 0 3px 12px rgba(168, 196, 212, 0.15)                                          |
| 字体颜色 | `.today .dayNumber { color }` | 211     | var(--text-accent)                                                            |

#### 农历信息样式
| 需求   | CSS位置                  | 行号  | 当前值                              |
|------|------------------------|-----|----------------------------------|
| 文字颜色 | `.lunar { color }`     | 129 | var(--text-muted)                |
| 节日颜色 | `.festival { color }`  | 136 | var(--color-festival) (#d6536d)  |
| 节气颜色 | `.solarTerm { color }` | 142 | var(--color-solarterm) (#4a8a73) |
| 字体大小 | `.lunar { font-size }` | 344 | 0.7rem                           |

### （五）Week View 周视图 (`src/components/calendar/week/WeekView.module.css`)

#### 容器样式
| 需求   | CSS位置                              | 行号 | 当前值                     |
|------|------------------------------------|----|-------------------------|
| 背景颜色 | `.weekContainer { background }`    | 18 | var(--color-bg-primary) |
| 边框圆角 | `.weekContainer { border-radius }` | 19 | var(--radius-lg)        |
| 阴影   | `.weekContainer { box-shadow }`    | 20 | var(--shadow-md)        |

#### 标题样式
| 需求   | CSS位置                         | 行号  | 当前值                       |
|------|-------------------------------|-----|---------------------------|
| 字体大小 | `.weekHeader { font-size }`   | 189 | var(--font-size-lg)       |
| 字体颜色 | `.weekHeader { color }`       | 26  | var(--color-text-primary) |
| 字体粗细 | `.weekHeader { font-weight }` | 25  | var(--font-weight-medium) |

#### 网格样式
| 需求   | CSS位置                      | 行号 | 当前值                           |
|------|----------------------------|----|-------------------------------|
| 背景颜色 | `.weekGrid { background }` | 31 | var(--color-bg-primary)       |
| 边框颜色 | `.weekGrid { border }`     | 33 | 1px solid var(--color-border) |

#### 日期列样式
| 需求     | CSS位置                             | 行号  | 当前值                        |
|--------|-----------------------------------|-----|----------------------------|
| 背景颜色   | `.dayColumn { background }`       | 44  | var(--color-bg-primary)    |
| 悬浮背景   | `.dayColumn:hover { background }` | 50  | var(--color-bg-hover)      |
| 今天背景   | `.dayHeader.today { background }` | 71  | var(--color-primary-light) |
| 日期字体大小 | `.dayDate { font-size }`          | 245 | 1.125rem                   |
| 日期字体颜色 | `.dayDate { color }`              | 90  | var(--color-text-primary)  |

#### 时间槽样式
| 需求   | CSS位置                       | 行号  | 当前值                       |
|------|-----------------------------|-----|---------------------------|
| 背景颜色 | `.timeSlot { background }`  | 124 | var(--color-bg-secondary) |
| 文字颜色 | `.timeSlot { color }`       | 120 | var(--color-text-muted)   |
| 字体大小 | `.timeSlot { font-size }`   | 277 | var(--font-size-xs)       |
| 字体粗细 | `.timeSlot { font-weight }` | 123 | var(--font-weight-medium) |

#### 小时单元格样式
| 需求   | CSS位置                            | 行号  | 当前值                                  |
|------|----------------------------------|-----|--------------------------------------|
| 背景颜色 | `.hourCell { background }`       | 137 | var(--color-bg-primary)              |
| 悬浮背景 | `.hourCell:hover { background }` | 149 | var(--color-bg-secondary)            |
| 边框颜色 | `.hourCell { border-bottom }`    | 134 | 1px solid var(--color-border-light)  |
| 悬浮边框 | `.hourCell:hover { box-shadow }` | 150 | inset 0 0 0 1px var(--color-primary) |

## 三、共享组件

### NavButton 导航按钮 (`src/components/calendar/shared/NavButton.module.css`)

| 需求   | CSS位置                             | 行号 | 当前值                                 |
|------|-----------------------------------|----|-------------------------------------|
| 背景颜色 | `.navButton { background }`       | 10 | var(--color-bg-primary)             |
| 悬浮背景 | `.navButton:hover { background }` | 21 | var(--color-bg-secondary)           |
| 边框颜色 | `.navButton { border }`           | 12 | 1px solid var(--color-border-light) |
| 文字颜色 | `.navButton { color }`            | 14 | var(--color-text-secondary)         |
| 字体大小 | `.navButton { font-size }`        | 15 | var(--font-size-lg)                 |
| 阴影   | `.navButton { box-shadow }`       | 16 | var(--shadow-sm)                    |

### DayCellContent 日期单元格内容 (`src/components/calendar/month/components/DayCellContent.module.css`)

| 需求     | CSS位置                      | 行号 | 当前值                        |
|--------|----------------------------|----|----------------------------|
| 日期字体大小 | `.dayNumber { font-size }` | 9  | 14px                       |
| 日期字体颜色 | `.dayNumber { color }`     | 11 | var(--color-text-primary)  |
| 农历字体大小 | `.lunar { font-size }`     | 27 | 10px                       |
| 农历字体颜色 | `.lunar { color }`         | 26 | var(--color-text-tertiary) |
| 节日颜色   | `.festival { color }`      | 31 | var(--color-accent-red)    |
| 节气颜色   | `.solarTerm { color }`     | 37 | var(--color-accent-orange) |

### MonthView 事件卡片样式 (DayCellContent) (`src/components/calendar/month/components/DayCellContent.module.css`)

#### 月视图事件卡片样式
| 需求      | CSS位置                               | 行号 | 当前值                   |
|---------|-------------------------------------|----|-----------------------|
| 事件卡片背景  | `.eventCard { background-color }` | 48 | var(--color-surface) |
| 事件卡片边框  | `.eventCard { border }` | 49 | 1px solid transparent |
| 事件卡片圆角  | `.eventCard { border-radius }` | 50 | 3px |
| 悬浮效果  | `.eventCard:hover { transform }` | 54 | translateY(-1px) |
| 悬浮阴影  | `.eventCard:hover { box-shadow }` | 55 | 0 2px 4px rgba(0, 0, 0, 0.1) |
| 事件标题颜色  | `.eventTitle { color }` | 64 | var(--color-text-primary) |
| 事件标题大小  | `.eventTitle { font-size }` | 63 | 11px |

#### 月视图事件标签主题
| 需求      | CSS位置                               | 行号 | 当前值                   |
|---------|-------------------------------------|----|-----------------------|
| 工作事件背景  | `.eventCard.work { background-color }` | 76 | rgba(59, 130, 246, 0.08) |
| 工作事件边框  | `.eventCard.work { border-color }` | 77 | rgba(59, 130, 246, 0.2) |
| 私人事件背景  | `.eventCard.private { background-color }` | 91 | rgba(137, 16, 185, 0.08) |
| 私人事件边框  | `.eventCard.private { border-color }` | 92 | rgba(148, 16, 185, 0.2) |
| 平衡事件背景  | `.eventCard.balance { background-color }` | 106 | rgba(187, 251, 60, 0.08) |
| 平衡事件边框  | `.eventCard.balance { border-color }` | 107 | rgba(152, 251, 60, 0.2) |
| 自定义事件背景  | `.eventCard.custom { background-color }` | 117 | rgba(156, 163, 175, 0.08) |
| 自定义事件边框  | `.eventCard.custom { border-color }` | 118 | rgba(156, 163, 175, 0.2) |

#### 月视图事件点样式
| 需求      | CSS位置                               | 行号 | 当前值                   |
|---------|-------------------------------------|----|-----------------------|
| 事件点背景  | `.eventDot { background-color }` | 69 | var(--color-accent-gray) |
| 事件点圆角  | `.eventDot { border-radius }` | 68 | 50% |
| 工作事件点  | `.eventDot.work { background-color }` | 86 | #3b82f6 |
| 私人事件点  | `.eventDot.private { background-color }` | 101 | #10b981 |
| 自定义事件点  | `.eventDot.custom { background-color }` | 127 | #9ca3af |

#### 月视图更多指示器样式
| 需求      | CSS位置                               | 行号 | 当前值                   |
|---------|-------------------------------------|----|-----------------------|
| 更多指示器背景  | `.moreIndicatorCompact { background-color }` | 132 | var(--color-accent-blue) |
| 更多指示器圆角  | `.moreIndicatorCompact { border-radius }` | 133 | 8px |
| 悬浮背景  | `.moreIndicatorCompact:hover { background-color }` | 139 | var(--color-accent-blue-hover) |
| 更多文字颜色  | `.moreTextCompact { color }` | 146 | white |
| 更多文字大小  | `.moreTextCompact { font-size }` | 144 | 9px |

### WeekEventIndicator 周视图事件指示器 (`src/components/calendar/week/components/WeekEventIndicator.module.css`)

#### 事件卡片样式
| 需求      | CSS位置                               | 行号 | 当前值                   |
|---------|-------------------------------------|----|-----------------------|
| 私人事件背景  | `.eventCard.private { background }` | 42 | var(--tag-bg-private) |
| 工作事件背景  | `.eventCard.work { background }`    | 47 | var(--tag-bg-work)    |
| 平衡事件背景  | `.eventCard.balance { background }` | 52 | var(--tag-bg-balance) |
| 自定义事件背景 | `.eventCard.custom { background }`  | 57 | var(--tag-bg-custom)  |
| 事件标题颜色  | `.eventTitle { color }`             | 71 | #1e293b               |
| 事件时间颜色  | `.eventTime { color }`              | 81 | #64748b               |

## 四、使用指南

### 1. 颜色修改
- 全局颜色变量位于 `src/index.css` 的 `:root` 选择器中
- 各组件特定颜色在对应的 `.module.css` 文件的第一部分
- 建议通过修改CSS变量来实现主题切换

### 2. 渐变效果
- 使用 `linear-gradient()` 函数定义
- 格式：`linear-gradient(角度, 起始颜色, 结束颜色)`
- 示例：`linear-gradient(135deg, #5B8DBE, #7BA7D1)`

### 3. 透明度调整
- 使用 `rgba()` 函数：`rgba(红, 绿, 蓝, 透明度)`
- 或者使用 `opacity` 属性：值范围 0-1

### 4. 字体样式
- 字体大小使用 `rem` 单位，便于响应式调整
- 字体粗细使用数值（300-900）或关键词（normal, bold等）

### 5. 阴影效果
- 格式：`box-shadow: 水平偏移 垂直偏移 模糊半径 扩散半径 颜色`
- 示例：`box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)`

## 五、开发建议

1. 创建主题时，建议复制现有的CSS变量定义，修改值后作为新主题
2. 使用CSS变量系统可以轻松实现主题切换功能
3. 背景图片功能可通过添加 `background-image` 属性实现
4. 建议将用户自定义的样式通过内联样式或动态生成的CSS类来应用，避免直接修改源文件