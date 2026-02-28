# 执行模式选择功能集成指南

## 📋 修改概览

本次更新为自动化测试执行添加了模式选择功能，用户可以在执行时选择 Simple/Standard/Script 模式。

## 🔧 需要修改的文件

### 1. ✅ backend/migrations/008_add_execution_config.sql
**状态**: 已创建
**说明**: 数据库迁移脚本，添加 execution_config 字段

### 2. ✅ backend/src/controllers/testCaseController.js
**状态**: 已修改
**修改内容**:
- `executeTestCase` 函数现在接收 `executionConfig` 参数
- 验证 `executionConfig.automation_level` 的有效性
- 将 `executionConfig` 存储到数据库

### 3. ✅ automation-testing/test-executor/db_connector.py
**状态**: 已修改
**修改内容**:
- `get_pending_executions` 函数现在返回 `execution_config` 字段

### 4. ✅ automation-testing/test-executor/test_runner.py
**状态**: 已修改
**修改内容**:
- `execute_test_case` 函数新增 `execution_config` 参数
- 配置优先级: execution_config > test_case.automation_config > 默认值

### 5. ✅ automation-testing/test-executor/executor.py
**状态**: 已修改
**修改内容**:
- `execute_task` 函数读取并传递 `execution_config`

### 6. ✅ frontend/api-service.js
**状态**: 已修改
**修改内容**:
- `executeTestCase` 函数新增 `executionConfig` 参数

### 7. ✅ frontend/execution-config-dialog.js
**状态**: 已创建
**说明**: 新的执行配置弹窗组件

### 8. ⚠️ frontend/manage.html
**状态**: 需要手动修改
**修改位置**: 见下方详细说明

---

## 📝 frontend/manage.html 修改详情

### 步骤 1: 引入新的弹窗组件

在 `<head>` 标签中添加：

```html
<!-- 执行配置弹窗 -->
<script src="execution-config-dialog.js"></script>
```

### 步骤 2: 修改 executeSingleTestCase 函数

**原代码** (约6614行):
```javascript
async function executeSingleTestCase(testCaseId, testCaseName, platform) {
    try {
        console.log(`[执行测试用例] ID: ${testCaseId}, 平台: ${platform}`);
        showLoading(`正在提交测试用例: ${testCaseName}...`);

        const result = await apiService.executeTestCase(testCaseId, platform);

        if (result && result.success) {
            const executionId = result.data.taskId || result.data.executionId;
            hideLoading();

            // 使用新的进度弹窗
            const progressModal = new ExecutionProgressModal(
                executionId,
                testCaseName,
                platform,
                'simple'
            );
            progressModal.show();
        } else {
            hideLoading();
            showToast('执行失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('执行测试用例失败:', error);
        hideLoading();
        showToast('执行失败: ' + error.message);
    }
}
```

**新代码**:
```javascript
async function executeSingleTestCase(testCaseId, testCaseName, platform, executionConfig = null) {
    try {
        console.log(`[执行测试用例] ID: ${testCaseId}, 平台: ${platform}, 配置:`, executionConfig);
        showLoading(`正在提交测试用例: ${testCaseName}...`);

        const result = await apiService.executeTestCase(testCaseId, platform, null, executionConfig);

        if (result && result.success) {
            const executionId = result.data.taskId || result.data.executionId;
            hideLoading();

            // 使用新的进度弹窗
            const progressModal = new ExecutionProgressModal(
                executionId,
                testCaseName,
                platform,
                executionConfig?.automation_level || 'simple'
            );
            progressModal.show();
        } else {
            hideLoading();
            showToast('执行失败: ' + (result.error || '未知错误'));
        }
    } catch (error) {
        console.error('执行测试用例失败:', error);
        hideLoading();
        showToast('执行失败: ' + error.message);
    }
}
```

### 步骤 3: 替换所有 showExecutionDialog 调用

**查找**: `showExecutionDialog`
**替换为**: `showExecutionConfigDialog`

**修改调用方式**:

**原代码** (约5331行):
```javascript
showExecutionDialog((platform) => {
    executeSingleTestCase(testCaseId, testCaseName, platform);
});
```

**新代码**:
```javascript
showExecutionConfigDialog((platform, executionConfig) => {
    executeSingleTestCase(testCaseId, testCaseName, platform, executionConfig);
});
```

**注意**: 所有调用 `showExecutionDialog` 的地方都需要修改:
1. 单个用例执行按钮点击事件 (约5331行、5442行)
2. 批量执行按钮点击事件 (约5135行)
3. 右键菜单执行 (约6775行)

### 步骤 4: 修改批量执行函数（可选）

**原代码** (约6645行):
```javascript
async function executeMenuTestCases(menuId, menuName, platform, isSmokeMenu = false) {
    // ...
}
```

**新代码**:
```javascript
async function executeMenuTestCases(menuId, menuName, platform, isSmokeMenu = false, executionConfig = null) {
    // ... 在批量执行时也传递 executionConfig
}
```

### 步骤 5: 删除或注释旧的 showExecutionDialog 函数

**位置**: 约6781行

可以注释掉或删除原有的 `showExecutionDialog` 函数，因为已经被 `showExecutionConfigDialog` 替代。

---

## 🚀 使用步骤

### 1. 运行数据库迁移

```bash
cd D:\TestT\backend
node migrations/run-all-migrations.js
```

或直接执行 SQL:
```sql
-- 给 test_executions 表添加执行配置字段
ALTER TABLE test_executions
ADD COLUMN IF NOT EXISTS execution_config JSONB;
```

### 2. 重启 Backend 服务

```bash
cd D:\TestT\backend
npm start
```

### 3. 重启 test-executor 服务

```bash
cd D:\TestT\automation-testing\test-executor
python executor.py
```

### 4. 刷新前端页面

访问: https://test-management-58v.pages.dev/manage

---

## 🎯 功能验证

### 测试步骤

1. 打开冒烟测试用例列表
2. 点击任意用例的"🚀 执行"按钮
3. 应该看到新的弹窗，包含：
   - 平台选择: Android/iOS/H5
   - 模式选择: Simple/Standard/Script
4. 选择平台和模式后点击"开始执行"
5. 查看 executor 日志，应该显示用户选择的配置

### 预期日志输出

**Executor 控制台**:
```
============================================================
🧪 执行任务
============================================================
任务ID: exec_1234567890_abc123
用例ID: smoke_001
平台: android
设备: qox8qsyd8hjzlzoz
🎯 执行配置: {'automation_level': 'simple', 'platform': 'android', ...}
============================================================

🧪 开始执行测试用例: 登录功能测试
📝 优先级: P0
📋 使用执行时选择的配置
🎯 执行级别: simple
```

---

## 📌 关键改进

### 1. 用户体验提升
- ✅ 无需修改数据库配置
- ✅ 每次执行可以选择不同模式
- ✅ 清晰的模式说明和推荐

### 2. 灵活性增强
- ✅ 支持临时切换模式
- ✅ 保留用例默认配置
- ✅ 配置优先级清晰

### 3. 可追溯性
- ✅ 每次执行的配置记录在 test_executions 表
- ✅ 可以查看历史执行使用的模式

---

## 🔄 配置优先级

```
1️⃣ execution_config (用户选择)  → 最高优先级
    ↓ 如果为空
2️⃣ test_cases.automation_config (用例默认) → 中等优先级
    ↓ 如果为空
3️⃣ 全局默认值 (simple模式) → 最低优先级
```

---

## ⚠️ 注意事项

1. **数据库迁移**: 必须先运行迁移脚本
2. **服务重启**: Backend 和 executor 都需要重启
3. **浏览器缓存**: 建议清除浏览器缓存或强制刷新 (Ctrl+F5)
4. **兼容性**: 即使不选择模式，系统也会使用默认的 Simple 模式

---

## 📞 问题排查

### 问题 1: 弹窗不显示
**原因**: 未引入 execution-config-dialog.js
**解决**: 检查 manage.html 的 `<head>` 标签

### 问题 2: 执行失败 - 400 错误
**原因**: Backend 未更新或未重启
**解决**: 重启 Backend 服务

### 问题 3: executor 仍使用默认模式
**原因**: executor 未更新或未重启
**解决**: 重启 executor 服务

### 问题 4: 数据库报错 - column "execution_config" does not exist
**原因**: 未运行数据库迁移
**解决**: 执行迁移脚本
