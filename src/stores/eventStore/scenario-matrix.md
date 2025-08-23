# 事件管理系统完整场景矩阵——针对现有实现的修改方向

## 一、基础操作矩阵（不考虑级联）

### 1.1 事件类型定义
- **SE (Simple Event)**: 简单事件 - recurrence='none' 且无 parentId
- **RP (Recurring Parent)**: 重复母事件—recurrence!='none' 且无 parentId  
- **VI (Virtual Instance)**: 虚拟实例 - 有 parentId 且 ID 格式为 parentId_timestamp


### 1.2 操作类型定义
- **C (Create)**: 创建——仅SE/RP
- **ES (Edit Single)**: 编辑单个——SE/RP/VI，不包括recurrence
- **EF (Edit Future)**: 编辑此后所有——仅VI，不包括recurrence
- **EA (Edit All)**: 编辑整个系列——仅RP/VI，不包括recurrence
- **DS (Delete Single)**: 删除单个——SE/RP/VI
- **DF (Delete Future)**: 删除此后所有——仅VI
- **DA (Delete All)**: 删除整个系列——仅RP/VI
- **CS (Convert to Simple)**: 转为简单事件——仅RP/VI
- **CR (Convert to Recurring)**: 转为重复事件——仅SE
- **CC (Change Cycle)**: 改变重复周期——仅RP

## 二、业务逻辑矩阵
| 操作\事件类型         | SE (简单事件)         | RP (重复母事件)                 | VI (虚拟实例)                         |
|-----------------|-------------------|----------------------------|-----------------------------------|
| **C** (创建)      | ✓ 创建简单事件          | ✓ 创建重复母事件/生成虚拟实例           | ✗ 不能直接创建                          |
| **ES** (编辑单个)   | ✓ 直接修改事件          | ✗ 不适用                      | ✓ 当前VI转为SE，脱离母事件                  |
| **EF** (编辑此后所有) | ✗ 不适用             | ✗ 不适用                      | ✓ 截断原RP至当前VI之前<br>创建新RP管理此后实例     |
| **EA** (编辑整个系列) | ✗ 不适用             | ✓ 修改母事件<br>更新所有虚拟实例        | ✗ 不适用                             |
| **DS** (删除单个)   | ✓ 直接删除            | ✗ 不适用                      | ✓ 标记为已删除<br>添加到deletedOccurrences |
| **DF** (删除此后所有) | ✗ 不适用             | ✗ 不适用                      | ✓ 删除此后实例<br>调整母事件endDate          |
| **DA** (删除整个系列) | ✗ 不适用             | ✓ 删除母事件<br>删除所有虚拟实例        | ✗ 不适用                             |
| **CS** (转为简单事件) | ✗ 已是简单事件          | ✗ 不适用                      | ✓ 转换为独立SE<br>脱离母事件                |
| **CR** (转为重复事件) | ✓ 转换为RP<br>生成虚拟实例 | ✗ 不适用                      | ✗ 不适用                             |
| **CC** (改变周期)   | ✗ 不适用             | ✓ 修改recurrence<br>重新生成虚拟实例 | ✗ 不适用                             |

### 图例说明：
- ✓ : 支持的操作
- ✗ : 不支持/不适用的操作
- SE: Simple Event (简单事件)
- RP: Recurring Parent (重复母事件)
- VI: Virtual Instance (虚拟实例)

## 三、UI逻辑（理想设计）

| 操作-类型组合   | UI交互流程                                                                                                                                                                     |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **C-SE**  | 1. 点击"新建事件"按钮<br>2. 在EventForm中填写事件信息<br>3. Recurrence保持默认"No Repeat"<br>4. 点击"Create Event"                                                                               |
| **C-RP**  | 1. 点击"新建事件"按钮<br>2. 在EventForm中填写事件信息<br>3. 在Recurrence选择重复模式<br>4. 设置重复参数（间隔、结束条件等）<br>5. 点击"Create Event"                                                                |
| **ES-SE** | 1. 点击SE卡片的编辑按钮<br>2. 直接打开EventForm（编辑模式）<br>3. 修改事件信息<br>4. 点击"Save Changes"                                                                                               |
| **ES-VI** | 1. 点击VI卡片的编辑按钮<br>2. 弹出RecurringEditModal选择编辑范围<br>3. 选择"Only This Event"<br>4. 在EventForm中修改信息（禁用recurrence）<br>5. 点击"Save Changes"<br>6. 该VI转为独立SE                       |
| **EF-VI** | 1. 点击VI卡片的编辑按钮<br>2. 弹出RecurringEditModal选择编辑范围<br>3. 选择"This and Future Events"<br>4. 在EventForm中修改信息（禁用recurrence）<br>5. 点击"Save Changes"<br>6. 截断原RP至当前VI之前，创建新RP管理后续实例 |
| **EA-RP** | 1. 点击RP卡片的编辑按钮<br>2. 弹出RecurringEditModal选择编辑范围<br>3. 选择"All Events in Series"<br>4. 在EventForm中修改信息（禁用recurrence）<br>5. 点击"Save Changes"<br>6. 更新所有VI                     |
| **DS-SE** | 1. 点击SE卡片的删除按钮<br>2. 弹出DeleteConfirmModal确认<br>3. 点击"Confirm Delete"                                                                                                       |
| **DS-VI** | 1. 点击VI卡片的删除按钮<br>2. 弹出RecurringDeleteModal选择删除范围<br>3. 选择"Only This Event"<br>4. 点击"Confirm Delete"<br>5. 该VI被标记为已删除（添加到deletedOccurrences）                               |
| **DF-VI** | 1. 点击VI卡片的删除按钮<br>2. 弹出RecurringDeleteModal选择删除范围<br>3. 选择"This and Future Events"<br>4. 点击"Confirm Delete"<br>5. 调整RP的endDate至此VI之前                                       |
| **DA-RP** | 1. 点击RP卡片的删除按钮<br>2. 弹出RecurringDeleteModal选择删除范围<br>3. 选择"All Events in Series"<br>4. 点击"Confirm Delete"<br>5. 删除RP及所有VI                                                  |
| **CS-VI** | 1. 点击VI卡片的更多菜单<br>2. 选择"Convert to Single Event"<br>3. 弹出确认对话框<br>4. 点击"Confirm"<br>5. 该VI转为独立SE                                                                           |
| **CR-SE** | 1. 点击SE卡片的更多菜单<br>2. 选择"Set as Recurring"<br>3. 在RecurrencePanel设置重复模式<br>4. 点击"Save Changes"<br>5. SE转为RP并生成VI                                                            |
| **CC-RP** | 1. 点击RP卡片的编辑按钮<br>2. 弹出RecurringEditModal<br>3. 选择"Change Recurrence Pattern"<br>4. 在RecurrencePanel修改重复设置<br>5. 点击"Save Changes"<br>6. 重新生成所有VI                           |

### UI组件说明：
- **EventForm**: 事件表单，创建/编辑事件的主界面
- **RecurringEditModal**: 重复事件编辑选项对话框（Only This/Future/All/Change Recurrence）
- **RecurringDeleteModal**: 重复事件删除选项对话框（Only This/Future/All）
- **DeleteConfirmModal**: 简单删除确认对话框
- **ConvertModal**: 转换类型选项对话框
- **RecurrencePanel**: 重复设置面板（集成在EventForm中）

