// 阿里云函数计算入口文件
// 支持标准 Node.js 运行时和自定义运行时

const app = require('./app.js');

// 如果是标准 Node.js 运行时，监听环境变量指定的端口
const PORT = process.env.PORT || process.env.FC_SERVER_PORT || 9000;

// 启动服务器
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Function started on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// 优雅退出
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// 导出 app（供 bootstrap 使用）
module.exports = app;
