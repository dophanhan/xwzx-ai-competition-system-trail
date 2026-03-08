/**
 * 检查飞书云文档权限
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function checkDrivePerm() {
    console.log('=== 检查飞书云文档权限 ===\n');
    
    // 获取租户 access_token
    const tokenResponse = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        }
    );
    
    if (tokenResponse.data.code !== 0) {
        console.error('❌ 获取 token 失败:', tokenResponse.data.msg);
        return;
    }
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('✅ Token 获取成功\n');
    
    // 尝试获取应用信息
    console.log('正在获取应用信息...');
    const appInfoUrl = 'https://open.feishu.cn/open-apis/application/v4/applications/me';
    
    try {
        const appResponse = await axios.get(appInfoUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('应用信息:', JSON.stringify(appResponse.data, null, 2));
    } catch (error) {
        console.log('应用信息接口不可用:', error.response?.status);
    }
    
    // 测试云文档上传 API（使用正确的 endpoint）
    console.log('\n=== 测试云文档上传 API ===\n');
    
    const fs = require('fs');
    const FormData = require('form-data');
    
    // 创建测试文件
    const testFilePath = '/tmp/test_drive.txt';
    fs.writeFileSync(testFilePath, '测试文件内容');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), {
        filename: 'test_drive.txt',
        contentType: 'text/plain'
    });
    
    // 尝试不同的 API endpoint
    const endpoints = [
        'https://open.feishu.cn/open-apis/drive/v1/medias/upload',
        'https://open.feishu.cn/open-apis/drive/medias/upload',
        'https://open.feishu.cn/open-apis/drive/v1/files/upload'
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n尝试 endpoint: ${endpoint}`);
        
        try {
            const response = await axios.post(endpoint, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                },
                params: {
                    parent_type: 'drive',
                    folder_token: 'root'
                }
            });
            
            console.log('✅ 成功！响应:', JSON.stringify(response.data, null, 2));
            break;
        } catch (error) {
            console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
        }
    }
    
    console.log('\n\n📋 需要申请的权限:');
    console.log('1. drive:file - 获取或更新云文档资源');
    console.log('2. drive:file:upload - 上传云文档');
    console.log('3. drive:file:readonly - 读取云文档');
    console.log('\n申请链接:');
    console.log('https://open.feishu.cn/app/cli_a90abd1ceff99cc4/auth?q=drive:file,drive:file:upload,drive:file:readonly&op_from=openapi&token_type=tenant');
}

checkDrivePerm().catch(console.error);
