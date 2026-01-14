/**
 * API 服务模块 - 处理所有后端 API 调用
 */

class APIService {
    constructor() {
        this.baseURL = 'https://backend-production-2050.up.railway.app/api';
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
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== 菜单相关 ====================

    // 获取所有菜单和测试用例
    async getAllData() {
        return await this.request('/test-cases');
    }

    // 创建菜单
    async createMenu(name) {
        const id = 'menu_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        return await this.request('/test-cases/menu', {
            method: 'POST',
            body: JSON.stringify({ id, name })
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
            body: JSON.stringify({ platform, status, failReason })
        });
    }

    // 删除测试用例
    async deleteTestCase(id) {
        return await this.request(`/test-cases/${id}`, {
            method: 'DELETE'
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
