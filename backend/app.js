/**
 * AI 大赛报名系统后端服务
 * 功能：处理报名和成果提交，同步到飞书多维表格
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置文件上传目录
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置文件上传存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB
    }
});

// 飞书配置
const FEISHU_BOT_WEBHOOK = process.env.FEISHU_BOT_WEBHOOK || '';
const FEISHU_APP_ID = process.env.FEISHU_APP_ID || '';
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET || '';
// 报名表和成果提交表的应用 token（可能在不同的应用中）
const FEISHU_REGISTRATION_APP_TOKEN = process.env.FEISHU_BITABLE_APP_TOKEN || '';
const FEISHU_REGISTRATION_TABLE_ID = process.env.FEISHU_REGISTRATION_TABLE_ID || '';
const FEISHU_SUBMISSION_APP_TOKEN = process.env.FEISHU_SUBMISSION_APP_TOKEN || '';
const FEISHU_SUBMISSION_TABLE_ID = process.env.FEISHU_SUBMISSION_TABLE_ID || '';

// 飞书访问令牌缓存
let feishuTenantAccessToken = '';
let tokenExpireTime = 0;

/**
 * 获取飞书租户访问令牌
 * @returns {Promise<string|null>} 访问令牌
 */
async function getFeishuTenantAccessToken() {
    const now = Date.now();
    if (feishuTenantAccessToken && now < tokenExpireTime - 60000) {
        return feishuTenantAccessToken;
    }
    
    try {
        const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        });
        
        if (response.data.code === 0) {
            feishuTenantAccessToken = response.data.tenant_access_token;
            tokenExpireTime = now + response.data.expire * 1000;
            return feishuTenantAccessToken;
        }
        throw new Error(response.data.msg);
    } catch (error) {
        console.error('获取飞书访问令牌失败:', error.message);
        return null;
    }
}

/**
 * 发送飞书机器人消息
 * @param {Object} content - 消息卡片内容
 * @returns {Promise<boolean>} 是否成功
 */
async function sendFeishuMessage(content) {
    if (!FEISHU_BOT_WEBHOOK) {
        console.log('未配置飞书机器人 Webhook，跳过消息推送');
        return true;
    }
    
    try {
        const response = await axios.post(FEISHU_BOT_WEBHOOK, {
            msg_type: 'interactive',
            card: content
        });
        console.log('飞书消息推送成功');
        return true;
    } catch (error) {
        console.error('飞书消息推送失败:', error.message);
        return false;
    }
}

/**
 * 添加数据到飞书多维表格
 * @param {string} appToken - 应用 token（从 URL 的/base/后面获取）
 * @param {string} tableId - 表格 ID（以 tbl 开头）
 * @param {Object} recordData - 记录数据
 * @returns {Promise<boolean>} 是否成功
 */
async function addToFeishuTable(appToken, tableId, recordData) {
    if (!appToken || !FEISHU_APP_ID || !FEISHU_APP_SECRET || !tableId) {
        console.log('未配置飞书多维表格相关参数，跳过数据归档');
        return true;
    }
    
    try {
        const token = await getFeishuTenantAccessToken();
        if (!token) {
            throw new Error('无法获取飞书访问令牌');
        }
        
        // ✅ 正确的 API 格式：https://open.feishu.cn/open-apis/bitable/v1/apps/{app_token}/tables/{table_id}/records
        const response = await axios.post(
            `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
            {
                fields: recordData
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.data.code === 0) {
            console.log('数据写入飞书多维表格成功');
            return true;
        }
        throw new Error(response.data.msg);
    } catch (error) {
        console.error('数据写入飞书多维表格失败:', error.message);
        return false;
    }
}

/**
 * 构建报名通知卡片
 * @param {Object} data - 报名数据
 * @returns {Object} 卡片内容
 */
function buildRegistrationCard(data) {
    const membersText = data.members.map((m, i) => `${i + 1}. ${m.name}`).join('\n');
    
    return {
        config: {
            wide_screen_mode: true
        },
        header: {
            title: {
                tag: 'plain_text',
                content: '🎉 新参赛队伍报名'
            },
            template: 'blue'
        },
        elements: [
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**队伍名称：** ${data.teamName}`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**队伍人数：** ${data.memberCount || data.members.length} 人`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**队伍成员：**\n${membersText}`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**提交时间：** ${new Date(data.submittedAt).toLocaleString('zh-CN')}`
                }
            }
        ]
    };
}

/**
 * 构建成果提交通知卡片
 * @param {Object} data - 成果数据
 * @returns {Object} 卡片内容
 */
function buildSubmissionCard(data) {
    let filesText = data.files && data.files.length > 0 
        ? data.files.map(f => `- ${f.name} (${formatFileSize(f.size)})`).join('\n')
        : '无';
    
    return {
        config: {
            wide_screen_mode: true
        },
        header: {
            title: {
                tag: 'plain_text',
                content: '📤 新赛事成果提交'
            },
            template: 'green'
        },
        elements: [
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**队伍名称：** ${data.teamName}`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**成果名称：** ${data.projectName}`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**团队分工：** ${data.teamRoles}`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**成果说明：** ${data.projectDescription}`
                }
            },
            data.projectLink ? {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**在线链接：** ${data.projectLink}`
                }
            } : null,
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**上传文件：**\n${filesText}`
                }
            },
            {
                tag: 'div',
                text: {
                    tag: 'lark_md',
                    content: `**提交时间：** ${new Date(data.submittedAt).toLocaleString('zh-CN')}`
                }
            }
        ].filter(Boolean)
    };
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 验证报名数据
 * @param {Object} data - 报名数据
 * @returns {Object} 验证结果
 */
function validateRegistrationData(data) {
    // 验证队伍名称
    if (!data.teamName || data.teamName.trim() === '') {
        return { valid: false, message: '队伍名称不能为空' };
    }
    
    // 验证队员列表
    if (!data.members || !Array.isArray(data.members)) {
        return { valid: false, message: '队员信息格式错误' };
    }
    
    // 验证队伍人数
    if (data.members.length < 1 || data.members.length > 3) {
        return { valid: false, message: '队伍人数必须在 1-3 人之间' };
    }
    
    // 验证每个队员的姓名
    for (let i = 0; i < data.members.length; i++) {
        if (!data.members[i].name || data.members[i].name.trim() === '') {
            return { valid: false, message: `队员 ${i + 1} 的姓名不能为空` };
        }
    }
    
    return { valid: true };
}

/**
 * 验证成果提交数据
 * @param {Object} data - 成果数据
 * @returns {Object} 验证结果
 */
function validateSubmissionData(data) {
    // 验证队伍名称
    if (!data.teamName || data.teamName.trim() === '') {
        return { valid: false, message: '队伍名称不能为空' };
    }
    
    // 验证成果名称
    if (!data.projectName || data.projectName.trim() === '') {
        return { valid: false, message: '成果名称不能为空' };
    }
    if (data.projectName.length > 100) {
        return { valid: false, message: '成果名称不能超过 100 字' };
    }
    
    // 验证团队分工
    if (!data.teamRoles || data.teamRoles.trim() === '') {
        return { valid: false, message: '团队分工不能为空' };
    }
    if (data.teamRoles.length > 500) {
        return { valid: false, message: '团队分工说明不能超过 500 字' };
    }
    
    // 验证成果说明
    if (!data.projectDescription || data.projectDescription.trim() === '') {
        return { valid: false, message: '成果说明不能为空' };
    }
    if (data.projectDescription.length > 1000) {
        return { valid: false, message: '成果说明不能超过 1000 字' };
    }
    
    return { valid: true };
}

// ==================== API 路由 ====================

/**
 * 处理报名请求
 */
app.post('/api/registration', async (req, res) => {
    try {
        const data = req.body;
        
        console.log('收到报名数据:', data);
        
        // 验证数据
        const validation = validateRegistrationData(data);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }
        
        // 发送飞书通知
        const card = buildRegistrationCard(data);
        await sendFeishuMessage(card);
        
        // 准备飞书多维表格数据（使用正确的字段名称）
        const tableData = {
            '队伍名称': data.teamName,
            '队伍人数': data.memberCount || data.members.length,
            '队员 1 姓名': data.members[0]?.name || '',
            '队员 2 姓名': data.members[1]?.name || '',
            '队员 3 姓名': data.members[2]?.name || '',
            '报名时间': new Date(data.submittedAt).toLocaleString('zh-CN')
        };
        
        // 写入飞书多维表格（使用报名表的应用 token 和表格 ID）
        await addToFeishuTable(FEISHU_REGISTRATION_APP_TOKEN, FEISHU_REGISTRATION_TABLE_ID, tableData);
        
        res.json({ success: true, message: '报名成功' });
    } catch (error) {
        console.error('报名处理失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 获取已报名的队伍列表
 */
app.get('/api/teams', async (req, res) => {
    try {
        const token = await getFeishuTenantAccessToken();
        const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${FEISHU_REGISTRATION_APP_TOKEN}/tables/${FEISHU_REGISTRATION_TABLE_ID}/records`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.code === 0) {
            const teams = response.data.data.items
                .filter(record => record.fields['队伍名称'])  // 过滤掉没有队伍名称的记录
                .map(record => ({
                    id: record.id,
                    name: record.fields['队伍名称']
                }));
            res.json({ success: true, data: teams });
        } else {
            res.status(500).json({ success: false, message: '获取队伍列表失败' });
        }
    } catch (error) {
        console.error('获取队伍列表失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 处理成果提交请求
 */
app.post('/api/submission', upload.array('files', 10), async (req, res) => {
    try {
        const data = req.body;
        const files = req.files || [];
        
        console.log('收到成果提交数据:', data);
        console.log('上传文件:', files);
        
        // 验证数据
        const validation = validateSubmissionData(data);
        if (!validation.valid) {
            return res.status(400).json({ success: false, message: validation.message });
        }
        
        // 发送飞书通知
        const card = buildSubmissionCard({
            ...data,
            files: files.map(f => ({ name: f.originalname, size: f.size }))
        });
        await sendFeishuMessage(card);
        
        // 准备飞书多维表格数据
        const tableData = {
            '队伍名称': data.teamName,
            '成果名称': data.projectName,
            '团队分工说明': data.teamRoles,
            '成果说明': data.projectDescription,
            '成果链接': data.projectLink || '',
            '提交时间': new Date(data.submittedAt).toLocaleString('zh-CN')
        };
        
        // 如果有文件上传，必须上传到飞书云文档
        if (files.length > 0) {
            console.log('正在上传附件到飞书云文档...');
            const { uploadFilesAndCreateRecord } = require('./attachment_upload');
            
            await uploadFilesAndCreateRecord(
                FEISHU_SUBMISSION_APP_TOKEN,
                FEISHU_SUBMISSION_TABLE_ID,
                tableData,
                files
            );
            
            console.log('✅ 附件上传成功，记录已创建');
        } else {
            // 没有文件，直接写入表格
            await addToFeishuTable(FEISHU_SUBMISSION_APP_TOKEN, FEISHU_SUBMISSION_TABLE_ID, tableData);
        }
        
        res.json({ success: true, message: '提交成功' });
    } catch (error) {
        console.error('成果提交处理失败:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
});

/**
 * 错误处理中间件
 */
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            success: false, 
            message: '单个文件大小不能超过 20MB' 
        });
    }
    console.error('服务器错误:', err);
    res.status(500).json({ success: false, message: '服务器错误' });
});

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '服务运行正常' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('健康检查：http://localhost:3000/api/health');
    console.log(`报名表应用 Token: ${FEISHU_REGISTRATION_APP_TOKEN ? '已配置' : '未配置'}`);
    console.log(`报名表表格 ID: ${FEISHU_REGISTRATION_TABLE_ID || '未配置'}`);
    console.log(`成果提交表应用 Token: ${FEISHU_SUBMISSION_APP_TOKEN ? '已配置' : '未配置'}`);
    console.log(`成果提交表格 ID: ${FEISHU_SUBMISSION_TABLE_ID || '未配置'}`);
});
