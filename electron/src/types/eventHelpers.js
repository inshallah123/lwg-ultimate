"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSimpleEvent = isSimpleEvent;
exports.isRecurringParent = isRecurringParent;
exports.isVirtualInstance = isVirtualInstance;
// 事件类型判断辅助函数
function isSimpleEvent(event) {
    return event.recurrence === 'none' && !event.parentId;
}
function isRecurringParent(event) {
    return event.recurrence !== 'none' && !event.parentId;
}
function isVirtualInstance(event) {
    return !!event.parentId && event.id.includes('_') && event.id.startsWith(event.parentId);
}
//# sourceMappingURL=eventHelpers.js.map