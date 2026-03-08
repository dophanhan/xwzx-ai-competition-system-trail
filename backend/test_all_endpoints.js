/**
 * 测试所有可能的 endpoint 变体
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testAllEndpoints() {
    console.log('=== 测试所有可能的 endpoint ===\n');
    
    // 获取 token
    const tokenResponse = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        }
    );
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('✅ Token 获取成功\n');
    
    // 准备测试文件
    const testFilePath = '/tmp/test.docx';
    fs.writeFileSync(testFilePath, '测试');
    
    // 所有可能的 endpoint 变体
    const endpoints = [
        // Drive v1
        'https://open.feishu.cn/open-apis/drive/v1/media/upload_all',
        'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
        'https://open.feishu.cn/open-apis/drive/v1/files/upload_all',
        'https://open.feishu.cn/open-apis/drive/v1/media/upload',
        'https://open.feishu.cn/open-apis/drive/v1/medias/upload',
        'https://open.feishu.cn/open-apis/drive/v1/files/upload',
        
        // Drive (无版本号)
        'https://open.feishu.cn/open-apis/drive/media/upload_all',
        'https://open.feishu.cn/open-apis/drive/medias/upload_all',
        'https://open.feishu.cn/open-apis/drive/files/upload_all',
        
        // Drive v2
        'https://open.feishu.cn/open-apis/drive/v2/media/upload_all',
        'https://open.feishu.cn/open-apis/drive/v2/files/upload_all',
    ];
    
    for (const url of endpoints) {
        console.log(`测试：${url}`);
        
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath), {
            filename: 'test.docx'
        });
        
        try {
            const response = await axios.post(url, form, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form.getHeaders()
                },
                params: {
                    parent_type: 'drive',
                    folder_token: 'root'
                }
            });
            
            console.log('✅ 成功！');
            console.log('响应:', JSON.stringify(response.data, null, 2));
            console.log('\n🎉 找到正确的 API 了！\n');
            return url;
            
        } catch (error) {
            const status = error.response?.status;
            const msg = error.response?.data?.msg || error.message;
            console.log(`❌ ${status}: ${msg}\n`);
        }
    }
    
    console.log('\n所有 endpoint 都失败了。');
    console.log('可能需要：');
    console.log('1. 使用飞书官方 SDK');
    console.log('2. 检查应用权限配置');
    console.log('3. 联系飞书技术支持');
}

testAllEndpoints().catch(console.error);
