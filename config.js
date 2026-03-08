/**
 * 前端配置文件
 * 可根据部署环境修改 API 地址等配置
 */

window.API_CONFIG = {
    // API 基础地址 - 阿里云函数计算
    BASE_URL: 'https://ai-compfunction-tgjkehyvsz.cn-hangzhou.fcapp.run',
    
    // 请求超时时间（毫秒）
    TIMEOUT: 30000,
    
    // 是否启用调试模式
    DEBUG: true
};

// 打印配置信息（调试模式）
if (window.API_CONFIG.DEBUG) {
    console.log('API 配置:', window.API_CONFIG);
}
