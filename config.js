/**
 * Frontend runtime config.
 *
 * Cloudflare Pages serves only static files, so API requests must point to the
 * deployed backend instead of the pages.dev origin.
 */
(function () {
    const loc = window.location;
    const hostname = loc.hostname;
    const port = loc.port || (loc.protocol === 'https:' ? '443' : '80');

    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    const isPagesDev = /\.pages\.dev$/.test(hostname) || /\.github\.io$/.test(hostname);

    const PROD_API_BASE = 'https://test-management-backend-3fib.onrender.com/api';

    let envLabel = 'UNKNOWN';
    if (isPagesDev) envLabel = 'PAGES';
    else if (port === '3000') envLabel = 'DEV';
    else if (port === '3100') envLabel = 'TEST';

    const apiBase = isPagesDev
        ? PROD_API_BASE
        : `${loc.protocol}//${hostname}:${port}/api`;

    const controllerBase = isPagesDev ? '' : `${loc.protocol}//${hostname}:8888`;

    window.AppConfig = {
        isLocal,
        isPagesDev,
        hostname,
        port,
        envLabel,
        apiBase,
        controllerBase,
        hasController: !!controllerBase
    };

    if (window.console && console.info) {
        console.info(`[AppConfig] env=${envLabel}`, window.AppConfig);
    }
})();
