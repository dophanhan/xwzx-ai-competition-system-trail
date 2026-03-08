# 学位中心 AI 创新大赛报名与成果提交系统

一个轻量化的线上报名与成果提交系统，支持参赛队伍报名、赛事成果提交，并集成飞书机器人消息推送和多维表格数据归档功能。

## 项目结构

```
ai_competition_system/
├── frontend/              # 前端页面
│   ├── index.html        # 系统首页
│   ├── registration.html # 参赛报名页面
│   ├── submission.html   # 成果提交页面
│   ├── styles.css        # 样式文件
│   ├── config.js         # 前端配置文件（API 地址等）
│   ├── registration.js   # 报名页面逻辑
│   └── submission.js     # 成果提交页面逻辑
├── backend/              # 后端服务
│   ├── app.js           # 主应用文件
│   ├── package.json     # 依赖配置
│   ├── .env.example     # 环境变量示例
│   └── uploads/         # 文件上传目录（自动创建）
└── README.md
```

## 功能特性

### 前端功能
1. **系统首页** - 简洁直观的导航入口，提供参赛报名和成果提交两个功能按钮
2. **参赛报名** - 支持 1-3 人队伍报名，仅需填写队伍名称和队员姓名，自动计算队伍人数
3. **成果提交** - 支持在线链接和本地附件上传（最大 500MB），使用 FormData 真实上传文件
4. **可配置 API 地址** - 通过 config.js 灵活配置后端地址，支持开发和生产环境

### 后端功能
1. **RESTful API** - 提供报名和成果提交接口
2. **字段验证** - 完整的后端验证逻辑（队伍名称、人数、必填字段等）
3. **文件上传** - 支持大文件上传（最大 500MB）
4. **飞书集成**
   - 机器人实时消息推送
   - 多维表格数据自动归档（使用正确的表格 ID）

## 快速开始

### 前置要求
- Node.js 16.x 或更高版本
- npm 或 yarn 包管理器

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

复制 `.env.example` 文件并重命名为 `.env`：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，配置以下参数：

```env
# 服务器端口
PORT=3000

# 飞书机器人 Webhook（可选）
FEISHU_BOT_WEBHOOK=你的飞书机器人 Webhook 地址

# 飞书应用凭证
FEISHU_APP_ID=你的飞书应用 App ID
FEISHU_APP_SECRET=你的飞书应用 App Secret

# 飞书多维表格应用 ID（必须配置）
FEISHU_REGISTRATION_TABLE=tbltDHBoAs72cFnh
FEISHU_SUBMISSION_TABLE=tblxYsQVComD9wRW
```

### 配置前端 API 地址

编辑 `frontend/config.js`：

```javascript
window.API_CONFIG = {
    // 开发环境
    BASE_URL: 'http://localhost:3000/api',
    
    // 生产环境示例
    // BASE_URL: 'https://your-domain.com/api',
    
    TIMEOUT: 30000,
    DEBUG: false
};
```

### 启动后端服务

```bash
cd backend
npm start
```

开发模式（自动重启）：

```bash
npm run dev
```

### 启动前端页面

直接在浏览器中打开 `frontend/index.html` 文件，或使用本地服务器：

```bash
cd frontend
# 使用 Python
python -m http.server 8080

# 或使用 Node.js (http-server)
npx http-server -p 8080
```

然后访问 `http://localhost:8080`

## 飞书配置指南

### 1. 创建飞书机器人

1. 访问 [飞书开放平台](https://open.feishu.cn)
2. 创建企业自建应用
3. 在"机器人"功能中启用机器人
4. 在"凭证与基础信息"中获取 App ID 和 App Secret
5. 在"事件订阅"中配置相关权限

### 2. 获取 Webhook 地址

1. 在飞书群聊中添加自定义机器人
2. 复制机器人的 Webhook 地址

### 3. 创建多维表格

创建两个多维表格，并配置相应字段：

**报名表表格（ID: tbltDHBoAs72cFnh）**
- 队伍名称（文本）
- 队伍人数（数字）
- 队员 1 姓名（文本）
- 队员 2 姓名（文本）
- 队员 3 姓名（文本）
- 提交时间（文本/日期）

**成果提交表格（ID: tblxYsQVComD9wRW）**
- 队伍名称（文本）
- 成果名称（文本）
- 团队分工（文本）
- 成果说明（文本）
- 在线链接（URL）
- 上传文件（文本）
- 提交时间（文本/日期）

## API 接口

### 健康检查
```
GET /api/health
```

### 提交报名
```
POST /api/registration
Content-Type: application/json

{
  "teamName": "队伍名称",
  "members": [
    { "name": "队员 1" },
    { "name": "队员 2" }
  ],
  "memberCount": 2,
  "submittedAt": "2026-03-06T08:00:00.000Z"
}
```

**验证规则：**
- 队伍名称：必填，不能为空
- 队员列表：必填，数组格式
- 队伍人数：1-3 人
- 队员姓名：每个队员姓名必填

### 提交成果
```
POST /api/submission
Content-Type: multipart/form-data

teamName: 队伍名称
projectName: 成果名称
teamRoles: 团队分工
projectDescription: 成果说明
projectLink: 在线链接（可选）
files: 上传文件（可选，多个）
submittedAt: 提交时间
```

**验证规则：**
- 队伍名称：必填
- 成果名称：必填
- 团队分工：必填
- 成果说明：必填
- 在线链接或附件：至少提供一个

## 主要修改记录

### 前端修改
- ✅ 移除报名表单中的邮箱输入字段
- ✅ 报名表单仅保留：队伍名称、队员 1-3 姓名
- ✅ 自动计算并提交队伍人数
- ✅ 成果提交使用 FormData 真实上传文件
- ✅ 使用 config.js 配置 API 地址，移除硬编码

### 后端修改
- ✅ 修复飞书 API 调用，使用正确的表格 ID
- ✅ 添加完整的字段验证逻辑
- ✅ 正确处理 FormData 文件上传
- ✅ 更新环境变量配置和说明

## 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **后端**: Node.js, Express.js
- **文件上传**: Multer
- **HTTP 客户端**: Axios
- **飞书集成**: 飞书开放平台 API

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

ISC

<!-- 触发 Vercel 部署 -->
