# 事件管理系统完整场景矩阵——针对现有实现的修改方向

## 一、基础操作矩阵（不考虑级联）

### 1.1 事件类型定义
- **SE (Simple Event)**: 简单事件 - recurrence='none' 且无 parentId
- **RP (Recurring Parent)**: 重复母事件—recurrence!='none' 且无 parentId  
- **VI (Virtual Instance)**: 虚拟实例 - 有 parentId 且 ID 格式为 parentId_timestamp
- **MI (Modified Instance)**: 修改实例 - 现在存在的一类事件。有 parentId 且 recurrence='none' 且非虚拟ID （此类事件不应存在。MI应该被转换为SE并脱离原重复事件序列。）

### 1.2 操作类型定义
- **C (Create)**: 创建
- **ES (Edit Single)**: 编辑单个
- **EF (Edit Future)**: 编辑此后所有——仅VI
- **EA (Edit All)**: 编辑整个系列——仅RP/VI
- **DS (Delete Single)**: 删除单个
- **DF (Delete Future)**: 删除此后所有——仅VI
- **DA (Delete All)**: 删除整个系列——仅RP/VI
- **CS (Convert to Simple)**: 转为简单事件——仅RP/VI
- **CR (Convert to Recurring)**: 转为重复事件——仅SE
- **CC (Change Cycle)**: 改变重复周期——仅RP/VI

### 基础操作矩阵

| 事件类型 | 操作  | 场景描述        | 业务预期                                         |
  |------|-----|-------------|----------------------------------------------|
| SE   | C   | 创建简单事件      | 创建简单事件                                       |
| SE   | ES  | 编辑简单事件      | 直接修改简单事件属性                                   |
| SE   | DS  | 删除简单事件      | 删除简单事件                                       |
| SE   | CR  | 简单事件转重复     | 以该事件为基础创建新的重复序列（RP），原SE删除                    |
| RP   | ES  | 编辑母事件的单个实例  | 创建新SE（母事件当天的内容+修改），将母事件的开始日期推迟到下一个周期         |
| RP   | EA  | 编辑母事件的所有实例  | 直接修改RP的属性                                    |
| RP   | DS  | 删除母事件的单个实例  | 将母事件的开始日期推迟到下一个周期                            |
| RP   | DA  | 删除整个母事件系列   | 删除整个重复序列                                     |
| RP   | CS  | 母事件转简单      | 创建新SE（母事件当天的内容），将母事件的开始日期推迟到下一个周期            |
| RP   | CC  | 母事件改变周期     | 创建新的RP（新周期），删除原RP                            |
| VI   | ES  | 编辑虚拟实例为单个   | 创建新SE（该实例的内容+修改），母事件添加该日期到excludedDates      |
| VI   | EF  | 从虚拟实例开始编辑此后 | 设置原RP的recurrenceEndDate为前一天，创建新RP从该日期开始      |
| VI   | EA  | 通过虚拟实例编辑所有  | 找到母事件并修改其属性（内部调用RP-EA）                       |
| VI   | DS  | 删除单个虚拟实例    | 将该日期加入RP的excludedDates                       |
| VI   | DF  | 从虚拟实例开始删除此后 | 设置RP的recurrenceEndDate为前一天                   |
| VI   | DA  | 通过虚拟实例删除所有  | 找到母事件并删除（内部调用RP-DA）                          |
| VI   | CS  | 虚拟实例转简单     | 创建新SE（该实例的内容），母事件添加该日期到excludedDates         |
| VI   | CC  | 虚拟实例改变周期    | 设置原RP的recurrenceEndDate为前一天，创建新RP从该日期开始（新周期） |
