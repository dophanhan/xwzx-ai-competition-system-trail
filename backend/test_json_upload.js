/**
 * 测试使用 JSON body 上传文件
 */

const axios = require('axios');
const fs = require('fs');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testJSONUpload() {
    console.log('=== 测试 JSON 方式上传文件 ===\n');
    
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
    const testFilePath = '/tmp/test_upload.docx';
    fs.writeFileSync(testFilePath, '测试文件内容');
    const fileBuffer = fs.readFileSync(testFilePath);
    const base64Content = fileBuffer.toString('base64');
    
    console.log('文件大小:', fileBuffer.length, 'bytes');
    console.log('Base64 长度:', base64Content.length, 'chars\n');
    
    // 尝试 1: 使用 JSON body + base64
    console.log('尝试 1: JSON body + base64 content');
    try {
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files/upload_all',
            {
                folder_token: 'root',
                parent_type: 'drive',
                content: base64Content,
                name: 'test_upload.docx'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ 成功！');
        console.log('响应:', JSON.stringify(response.data, null, 2));
        return;
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
        console.log('错误代码:', error.response?.data?.code);
    }
    
    // 尝试 2: 分片上传 - 初始化
    console.log('\n尝试 2: 分片上传初始化');
    try {
        const initResponse = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files/init_upload',
            {
                folder_token: 'root',
                parent_type: 'drive',
                file_name: 'test_upload.docx',
                file_size: fileBuffer.length
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('初始化响应:', JSON.stringify(initResponse.data, null, 2));
        
        if (initResponse.data.code === 0) {
            const fileToken = initResponse.data.data.file_token;
            console.log('文件 Token:', fileToken);
            
            // 继续上传内容...
        }
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
    }
}

testJSONUpload().catch(console.error);
