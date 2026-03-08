/**
 * 测试上传文件到云空间（不是云文档）
 * 根据飞书文档，应该使用不同的 API
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testUploadToSpace() {
    console.log('=== 测试上传文件到云空间 ===\n');
    
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
    const testFilePath = '/tmp/test_space.docx';
    fs.writeFileSync(testFilePath, '测试文件内容 - 云空间上传');
    const fileSize = fs.statSync(testFilePath).size;
    const fileName = 'test_space.docx';
    
    console.log('文件大小:', fileSize, 'bytes');
    console.log('文件名:', fileName, '\n');
    
    // 方法 1: 使用上传素材 API，但 parent_type 使用 drive_file（上传到云空间）
    console.log('方法 1: 使用 drive_file 作为 parent_type');
    const form1 = new FormData();
    form1.append('file_name', fileName);
    form1.append('parent_type', 'drive_file');  // 上传到云空间
    form1.append('parent_node', 'root');  // 根目录
    form1.append('size', fileSize.toString());
    form1.append('file', fs.createReadStream(testFilePath));
    
    try {
        const response1 = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
            form1,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        console.log('✅ 成功！');
        console.log('响应:', JSON.stringify(response1.data, null, 2));
        return;
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
        console.log('错误代码:', error.response?.data?.code);
        console.log('错误详情:', JSON.stringify(error.response?.data?.error, null, 2));
    }
    
    // 方法 2: 先创建文件元数据，再上传内容
    console.log('\n方法 2: 先创建文件，再上传内容');
    
    try {
        // 步骤 1: 创建文件
        const createResponse = await axios.post(
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
        
        console.log('创建文件响应:', JSON.stringify(createResponse.data, null, 2));
        
        if (createResponse.data.code === 0) {
            const fileToken = createResponse.data.data.file_token;
            console.log('文件 Token:', fileToken);
            
            // 步骤 2: 上传内容
            const form2 = new FormData();
            form2.append('file_name', fileName);
            form2.append('parent_type', 'drive_file');
            form2.append('parent_node', fileToken);
            form2.append('size', fileSize.toString());
            form2.append('file', fs.createReadStream(testFilePath));
            
            const uploadResponse = await axios.post(
                'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
                form2,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            console.log('上传响应:', JSON.stringify(uploadResponse.data, null, 2));
        }
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
    }
}

testUploadToSpace().catch(console.error);
