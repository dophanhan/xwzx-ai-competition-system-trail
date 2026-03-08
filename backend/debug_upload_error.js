/**
 * 调试文件上传错误 - 获取详细错误信息
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function debugUpload() {
    console.log('=== 调试文件上传错误 ===\n');
    
    // 1. 获取 token
    console.log('1. 获取租户 access_token...');
    const tokenResponse = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        }
    );
    
    if (tokenResponse.data.code !== 0) {
        console.error('❌ Token 获取失败:', tokenResponse.data);
        return;
    }
    
    const token = tokenResponse.data.tenant_access_token;
    console.log('✅ Token:', token);
    console.log();
    
    // 2. 准备测试文件
    console.log('2. 准备测试文件...');
    const testFilePath = '/tmp/test_upload.docx';
    fs.writeFileSync(testFilePath, '测试文件内容');
    console.log('✅ 测试文件已创建:', testFilePath);
    console.log();
    
    // 3. 上传到飞书云文档
    console.log('3. 上传到飞书云文档...');
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), {
        filename: 'test_upload.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    const uploadUrl = 'https://open.feishu.cn/open-apis/drive/v1/medias/upload';
    console.log('请求 URL:', uploadUrl);
    console.log('请求方法：POST');
    console.log('请求头:');
    console.log('  Authorization: Bearer', token.substring(0, 30) + '...');
    console.log('  Content-Type: multipart/form-data');
    console.log('请求参数:');
    console.log('  parent_type: drive');
    console.log('  folder_token: root');
    console.log();
    
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
        console.log('响应状态码:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('❌ 上传失败！');
        console.error('错误状态码:', error.response?.status);
        console.error('错误代码:', error.response?.data?.code);
        console.error('错误消息:', error.response?.data?.msg);
        console.error('错误详情:', JSON.stringify(error.response?.data?.error, null, 2));
        console.error('完整响应头:', JSON.stringify(error.response?.headers, null, 2));
        console.error('请求 URL:', error.config?.url);
        console.error('请求方法:', error.config?.method);
        
        // 解析错误响应
        if (error.response?.data) {
            console.log('\n📋 错误分析:');
            const errData = error.response.data;
            
            if (errData.code === 99991672) {
                console.log('  → 权限不足，需要申请 drive:file:upload 权限');
            } else if (error.response?.status === 404) {
                console.log('  → API 路径错误或应用身份未配置');
            } else if (errData.code === 91403) {
                console.log('  → 禁止访问，权限问题');
            }
        }
    }
    
    console.log('\n\n📋 排查建议:');
    console.log('1. 检查应用是否配置了应用身份');
    console.log('2. 检查是否申请了 drive:file:upload 权限');
    console.log('3. 检查权限是否已审批通过');
    console.log('4. 检查 API endpoint 是否正确');
    console.log('\n飞书开放平台应用地址:');
    console.log('https://open.feishu.cn/app/cli_a90abd1ceff99cc4');
}

debugUpload().catch(console.error);
