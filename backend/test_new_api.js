/**
 * 测试新的飞书文件上传 API
 * https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testNewAPI() {
    console.log('=== 测试新的飞书文件上传 API ===\n');
    console.log('API 文档：https://open.feishu.cn/document/server-docs/docs/drive-v1/media/upload_all\n');
    
    // 获取 token
    const tokenResponse = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        }
    );
    
    if (tokenResponse.data.code !== 0) {
        console.error('❌ Token 获取失败:', tokenResponse.data.msg);
        return;
    }
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('✅ Token 获取成功:', token.substring(0, 30) + '...\n');
    
    // 准备测试文件
    const testFilePath = '/tmp/test_new_api.docx';
    fs.writeFileSync(testFilePath, '测试文件内容 - 新 API');
    console.log('✅ 测试文件已创建:', testFilePath, '\n');
    
    // 使用新的 API endpoint
    const uploadUrl = 'https://open.feishu.cn/open-apis/drive/v1/media/upload_all';
    console.log('请求 URL:', uploadUrl);
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), {
        filename: 'test_new_api.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    console.log('请求方法：POST');
    console.log('Content-Type: multipart/form-data');
    console.log('参数：parent_type=drive, folder_token=root\n');
    
    try {
        const response = await axios.post(uploadUrl, form, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            params: {
                parent_type: 'drive',
                folder_token: 'root'
            }
        });
        
        console.log('✅ 上传成功！');
        console.log('状态码:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            console.log('\n🎉 成功！');
            console.log('文件 Token:', response.data.data?.file_token);
            console.log('文件名:', response.data.data?.name);
        }
        
    } catch (error) {
        console.error('❌ 上传失败！');
        console.error('状态码:', error.response?.status);
        console.error('错误代码:', error.response?.data?.code);
        console.error('错误消息:', error.response?.data?.msg);
        console.error('错误详情:', JSON.stringify(error.response?.data?.error, null, 2));
        
        if (error.response?.status === 404) {
            console.log('\n⚠️  404 错误 - API endpoint 可能不存在');
        } else if (error.response?.status === 400) {
            console.log('\n⚠️  400 错误 - 参数可能有误');
        }
    }
}

testNewAPI().catch(console.error);
