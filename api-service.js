/**
 * API 服务模块 - 处理所有后端 API 调用
 */

class APIService {
    constructor() {
        this.baseURL = 'https://test-management-backend-3fib.onrender.com/api';
        this.token = localStorage.getItem('token');
    }

    // 获取认证头
    getAuthHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // 通用请求方法
    async request(url, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                ...options,
                headers: this.getAuthHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                // 401 未授权错误 - token 过期或无效
                if (response.status === 401) {
                    const error = new Error('认证失败，请重新登录');
                    error.code = 'UNAUTHORIZED';
                    error.status = 401;
                    throw error;
                }
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== 菜单相关 ====================

    // 获取所有菜单和测试用例（旧接口，保留兼容）
    async getAllData() {
        return await this.request('/test-cases');
    }

    // 新优化接口：获取指定层级的菜单
    async getMenusByLevel(level = 1) {
        return await this.request(`/test-cases/menus?level=${level}`);
    }

    // 新优化接口：获取子菜单
    async getMenuChildren(parentId) {
        return await this.request(`/test-cases/menus/${parentId}/children`);
    }

    // 新优化接口：获取菜单下的测试用例列表（精简版）
    async getTestCasesByMenu(menuId) {
        return await this.request(`/test-cases/menus/${menuId}/test-cases`);
    }

    // 新优化接口：获取测试用例详情（完整版）
    async getTestCaseDetail(testCaseId) {
        return await this.request(`/test-cases/${testCaseId}/detail`);
    }

    // 创建菜单
    async createMenu(name) {
        const id = 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        return await this.request('/test-cases/menu', {
            method: 'POST',
            body: JSON.stringify({ id, name })
        });
    }

    // 更新菜单名称
    async updateMenu(menuId, name) {
        return await this.request(`/test-cases/menu/${menuId}`, {
            method: 'PUT',
            body: JSON.stringify({ name })
        });
    }

    // 删除菜单
    async deleteMenu(menuId) {
        return await this.request(`/test-cases/menu/${menuId}`, {
            method: 'DELETE'
        });
    }

    // ==================== 测试用例相关 ====================

    // 创建测试用例
    async createTestCase(testCase) {
        return await this.request('/test-cases', {
            method: 'POST',
            body: JSON.stringify(testCase)
        });
    }

    // 批量创建测试用例
    async createTestCasesBatch(testCases) {
        return await this.request('/test-cases/batch', {
            method: 'POST',
            body: JSON.stringify({ testCases })
        });
    }

    // 更新测试用例
    async updateTestCase(id, updates) {
        return await this.request(`/test-cases/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    // 更新测试用例状态
    async updateTestCaseStatus(id, platform, status, failReason = '') {
        return await this.request(`/test-cases/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ platform, status, fail_reason: failReason })
        });
    }

    // 移动测试用例到其他菜单
    async moveTestCase(id, targetMenuId) {
        return await this.request(`/test-cases/${id}/move`, {
            method: 'PATCH',
            body: JSON.stringify({ targetMenuId })
        });
    }

    // 删除测试用例
    async deleteTestCase(id) {
        return await this.request(`/test-cases/${id}`, {
            method: 'DELETE'
        });
    }

    // 上传测试用例文件（带超时和重试）
    async uploadTestCases(menuId, file, options = {}) {
        const {
            timeout = 300000,  // 默认超时5分钟（大量用例需要更长时间）
            retries = 0,        // 默认不重试（用户手动重试）
            onProgress = null   // 进度回调
        } = options;

        const formData = new FormData();
        formData.append('menuId', menuId);
        formData.append('file', file);

        let lastError = null;

        // 重试逻辑
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`重试上传 (${attempt}/${retries})...`);
                    if (onProgress) {
                        onProgress({ status: 'retrying', attempt, total: retries });
                    }
                    // 重试前等待一下
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                // 创建 AbortController 用于超时控制
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeout);

                try {
                    const response = await fetch(`${this.baseURL}/test-cases/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                            // 不设置 Content-Type，让浏览器自动处理
                        },
                        body: formData,
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || `HTTP ${response.status}`);
                    }

                    return data;
                } catch (fetchError) {
                    clearTimeout(timeoutId);

                    // 判断是否是超时错误
                    if (fetchError.name === 'AbortError') {
                        throw new Error(`上传超时（超过${timeout/1000}秒），请检查网络或减少用例数量`);
                    }

                    throw fetchError;
                }
            } catch (error) {
                lastError = error;

                // 如果不是最后一次尝试，继续重试
                if (attempt < retries) {
                    console.warn(`上传失败，准备重试: ${error.message}`);
                    continue;
                }

                // 最后一次失败，抛出错误
                console.error('Upload Error:', error);
                throw error;
            }
        }

        // 理论上不会到这里，但为了安全
        throw lastError || new Error('上传失败');
    }

    // 搜索失败的测试用例（根据失败原因）
    async searchFailedTestCases(keyword, menuId = null) {
        const params = new URLSearchParams();
        if (keyword) params.append('keyword', keyword);
        if (menuId) params.append('menuId', menuId);

        const queryString = params.toString();
        const endpoint = `/test-cases/search${queryString ? '?' + queryString : ''}`;

        return await this.request(endpoint);
    }

    // 获取统计数据
    async getStats(menuId = null) {
        const params = new URLSearchParams();
        if (menuId) params.append('menuId', menuId);

        const queryString = params.toString();
        const endpoint = `/test-cases/stats${queryString ? '?' + queryString : ''}`;

        return await this.request(endpoint);
    }

    // 获取冒烟用例菜单
    async getSmokeMenus(level = 1) {
        return await this.request(`/test-cases/smoke-menus?level=${level}`);
    }

    // 获取冒烟用例子菜单
    async getSmokeMenuChildren(parentId) {
        return await this.request(`/test-cases/smoke-menus/${parentId}/children`);
    }

    // 获取冒烟用例列表（Plan A新增）
    async getSmokeTestCasesByMenu(menuId) {
        return await this.request(`/test-cases/menus/${menuId}/smoke-test-cases`);
    }

    // 获取冒烟用例详情
    async getSmokeTestCaseDetail(id) {
        return await this.request(`/test-cases/smoke-test-cases/${id}/detail`);
    }

    // ==================== 自动化执行相关 ====================

    // 执行单条测试用例
    async executeTestCase(testCaseId, platform, deviceId = null) {
        return await this.request(`/test-cases/${testCaseId}/execute`, {
            method: 'POST',
            body: JSON.stringify({ platform, deviceId })
        });
    }

    // 批量执行测试用例
    async executeBatchTestCases(testCaseIds, platform, deviceId = null) {
        return await this.request(`/automation/execute/batch`, {
            method: 'POST',
            body: JSON.stringify({ testCaseIds, platform, deviceId })
        });
    }

    // 获取执行状态
    async getExecutionStatus(executionId) {
        return await this.request(`/test-cases/executions/${executionId}`);
    }

    // 获取执行历史
    async getExecutionHistory(testCaseId, limit = 10) {
        return await this.request(`/test-cases/${testCaseId}/executions?limit=${limit}`);
    }

    // ==================== 用例仓库相关 ====================

    // 获取菜单列表（支持仓库过滤）
    async getMenus(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.is_repository !== undefined) {
            queryParams.append('is_repository', params.is_repository);
        }
        if (params.level !== undefined) {
            queryParams.append('level', params.level);
        }

        const queryString = queryParams.toString();
        const endpoint = `/menus${queryString ? '?' + queryString : ''}`;

        return await this.request(endpoint);
    }

    // 获取菜单下的测试用例
    async getTestCases(menuId) {
        return await this.request(`/test-cases/menus/${menuId}/test-cases`);
    }

    // 创建版本（从仓库复制）
    async createVersion(data) {
        return await this.request('/versions/create', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ==================== 用户相关 ====================

    // 获取当前用户信息
    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    // 登出
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        window.location.href = 'index.html';
    }
}

// 导出单例
const apiService = new APIService();
