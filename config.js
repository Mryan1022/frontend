/**
 * 前端运行时配置
 *
 * 按"当前访问源"自动决定 API 和控制器地址。同源调用，零硬编码。
 *
 * 三种场景：
 *   1) http://localhost:3000/...      → dev backend，你自己调试用
 *   2) http://<你IP>:3100/...          → test backend，同事在内网访问
 *   3) https://test-management-58v.pages.dev/...  → 无可用 backend（仅保留做 UI 预览）
 *
 * 端口 3000 = 开发环境（代码改就生效）
 * 端口 3100 = 测试环境（推 GitHub + pm2 reload 后才生效）
 */
(function () {
    const loc = window.location;
    const hostname = loc.hostname;
    const port = loc.port || (loc.protocol === 'https:' ? '443' : '80');

    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    const isPagesDev = /\.pages\.dev$/.test(hostname) || /\.github\.io$/.test(hostname);

    // 环境标签（仅据端口判断；访问 pages.dev 无 backend）
    let envLabel = 'UNKNOWN';
    if (isPagesDev) envLabel = 'PAGES-NO-BACKEND';
    else if (port === '3000') envLabel = 'DEV';
    else if (port === '3100') envLabel = 'TEST';

    // 主 API：同源就行（backend 和 frontend 是同一个 express 实例）
    // pages.dev 情形没有可用后端，apiBase 留空，由调用方容错
    const apiBase = isPagesDev ? '' : `${loc.protocol}//${hostname}:${port}/api`;

    // 控制器：固定跑在承载测试环境的那台机器上，端口 8888
    // - 本地访问：localhost:8888
    // - 同事访问 3100：走同一个 hostname（即你这台机的 IP）的 8888
    // - pages.dev：无法跨源访问本地，置空
    const controllerBase = isPagesDev ? '' : `${loc.protocol}//${hostname}:8888`;

    window.AppConfig = {
        isLocal,
        isPagesDev,
        hostname,
        port,
        envLabel,
        apiBase,
        controllerBase,
        hasController: !!controllerBase,
    };

    if (window.console && console.info) {
        console.info(`[AppConfig] 环境=${envLabel}`, window.AppConfig);
    }
})();
