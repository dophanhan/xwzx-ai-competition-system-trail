/**
 * 测试飞书云文档上传权限
 */

const axios = require('axios');
const fs = require('fs');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testDriveUpload() {
    console.log('=== 测试飞书云文档上传权限 ===\n');
    
    // 获取租户 access_token
    console.log('正在获取 token...');
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
    console.log('✅ Token 获取成功:', token.substring(0, 30) + '...\n');
    
    // 检查应用权限
    console.log('正在检查应用权限...');
    const permsUrl = 'https://open.feishu.cn/open-apis/application/v6/applications/me/permissions';
    const permsResponse = await axios.get(permsUrl, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    console.log('\n应用权限:');
    if (permsResponse.data.code === 0) {
        const permissions = permsResponse.data.data.permissions || [];
        permissions.forEach(perm => {
            const status = perm.status === 'enabled' ? '✅' : '❌';
            console.log(`  ${status} ${perm.name} (${perm.code})`);
        });
    }
    
    // 测试上传文件
    console.log('\n正在测试文件上传...');
    const testFilePath = '/tmp/test_upload.txt';
    fs.writeFileSync(testFilePath, '这是一个测试文件');
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(testFilePath), {
        filename: 'test_upload.txt',
        contentType: 'text/plain'
    });
    
    const uploadUrl = 'https://open.feishu.cn/open-apis/drive/v1/medias/upload';
    console.log('上传 URL:', uploadUrl);
    
    try {
        const uploadResponse = await axios.post(uploadUrl, form, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            params: {
                parent_type: 'drive',
                folder_token: 'root'
            }
        });
        
        console.log('\n上传响应:', JSON.stringify(uploadResponse.data, null, 2));
        
        if (uploadResponse.data.code === 0) {
            console.log('\n✅ 文件上传成功！');
            console.log('文件 Token:', uploadResponse.data.data.file_token);
            console.log('文件名:', uploadResponse.data.data.name);
        } else {
            console.log('\n❌ 文件上传失败:', uploadResponse.data.msg);
        }
    } catch (error) {
        console.error('\n❌ 上传异常:');
        console.error('状态码:', error.response?.status);
        console.error('错误代码:', error.response?.data?.code);
        console.error('错误信息:', error.response?.data?.msg);
        console.error('错误详情:', JSON.stringify(error.response?.data?.error, null, 2));
        
        if (error.response?.status === 404) {
            console.log('\n⚠️  404 错误可能的原因:');
            console.log('1. 应用没有云文档上传权限 (drive:file:upload)');
            console.log('2. API 版本或路径不正确');
            console.log('3. 应用身份未配置');
        }
    }
}

testDriveUpload().catch(console.error);
