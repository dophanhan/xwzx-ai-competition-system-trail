/**
 * 测试飞书 Drive API 的正确用法
 * 参考：https://open.feishu.cn/document/server-docs/docs/drive-v1
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testDriveAPI() {
    console.log('=== 测试飞书 Drive API ===\n');
    
    // 获取 token
    const tokenResponse = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        }
    );
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('✅ Token:', token.substring(0, 30) + '...\n');
    
    // 准备测试文件
    const testFilePath = '/tmp/test_drive.docx';
    fs.writeFileSync(testFilePath, '测试文件内容');
    
    // 测试不同的 API endpoint
    const endpoints = [
        {
            name: 'Drive API v1 - files/upload',
            url: 'https://open.feishu.cn/open-apis/drive/v1/files/upload',
            params: { folder_token: 'root' }
        },
        {
            name: 'Drive API v1 - files/upload_all',
            url: 'https://open.feishu.cn/open-apis/drive/v1/files/upload_all',
            params: { folder_token: 'root' }
        },
        {
            name: 'Drive API - medias/upload (旧版)',
            url: 'https://open.feishu.cn/open-apis/drive/medias/upload',
            params: { parent_type: 'drive', folder_token: 'root' }
        }
    ];
    
    for (const endpoint of endpoints) {
        console.log(`\n测试：${endpoint.name}`);
        console.log(`URL: ${endpoint.url}`);
        
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath), {
            filename: 'test_drive.docx',
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        
        try {
            const response = await axios.post(endpoint.url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                },
                params: endpoint.params
            });
            
            console.log('✅ 成功！');
            console.log('响应:', JSON.stringify(response.data, null, 2));
            return; // 成功后退出
            
        } catch (error) {
            console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
        }
    }
    
    console.log('\n\n所有 endpoint 都失败了。请检查：');
    console.log('1. 应用是否配置了应用身份');
    console.log('2. 是否申请了 drive:file:upload 权限');
    console.log('3. 权限是否已审批通过');
}

testDriveAPI().catch(console.error);
