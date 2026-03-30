/**
 * 前端配置文件
 * 可根据部署环境修改 API 地址等配置
 * 
 * 使用方法：
 * 1. 开发环境：保持默认配置或使用本地地址
 * 2. 生产环境：修改 BASE_URL 为实际后端地址
 * 3. 也可以通过 window.API_CONFIG 在 HTML 中覆盖配置
 */

window.API_CONFIG = {
    // API 基础地址
    // 开发环境：http://localhost:3000/api
    // 生产环境：https://your-domain.com/api
    BASE_URL: 'http://localhost:3000/api',
    
    // 请求超时时间（毫秒）
    TIMEOUT: 30000,
    
    // 是否启用调试模式
    DEBUG: false
};

// 打印配置信息（调试模式）
if (window.API_CONFIG.DEBUG) {
    console.log('API 配置:', window.API_CONFIG);
}
