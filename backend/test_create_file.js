/**
 * 测试创建文件到云空间
 * 根据飞书文档，上传文件到云空间需要先创建文件元数据
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testCreateFile() {
    console.log('=== 测试创建文件到云空间 ===\n');
    
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
    const testFilePath = '/tmp/test_create.docx';
    fs.writeFileSync(testFilePath, '测试文件内容');
    const fileSize = fs.statSync(testFilePath).size;
    const fileName = 'test_create.docx';
    
    console.log('文件大小:', fileSize, 'bytes');
    console.log('文件名:', fileName, '\n');
    
    // 尝试 1: 使用 Drive API v1 - files 创建文件
    console.log('尝试 1: POST /drive/v1/files');
    try {
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files',
            {
                folder_token: 'root',
                name: fileName,
                parent_type: 'drive'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('响应:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
    }
    
    // 尝试 2: 使用 Drive API v1 - folders/{folder_token}/files/upload
    console.log('\n尝试 2: POST /drive/v1/folders/{folder_token}/files/upload');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath));
        
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/folders/root/files/upload',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        console.log('✅ 成功！');
        console.log('响应:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
    }
    
    // 尝试 3: 使用 Drive API v1 - files/upload (简单上传)
    console.log('\n尝试 3: POST /drive/v1/files/upload');
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath));
        form.append('folder_token', 'root');
        
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files/upload',
            form,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        console.log('✅ 成功！');
        console.log('响应:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.status, error.response?.data?.msg || error.message);
    }
}

testCreateFile().catch(console.error);
