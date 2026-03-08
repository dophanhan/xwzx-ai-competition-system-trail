/**
 * 测试飞书文件上传的不同参数组合
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testParams() {
    console.log('=== 测试飞书文件上传参数 ===\n');
    
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
    
    // 测试 1: 使用 FormData + folder_token 参数
    console.log('测试 1: FormData + folder_token 参数');
    const form1 = new FormData();
    form1.append('file', fileBuffer, {
        filename: 'test1.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    try {
        const response1 = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files/upload_all',
            form1,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form1.getHeaders()
                },
                params: {
                    folder_token: 'root'
                }
            }
        );
        console.log('✅ 成功:', JSON.stringify(response1.data, null, 2));
        return;
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
        console.log('错误代码:', error.response?.data?.code);
    }
    
    // 测试 2: 使用 FormData + parent_folder 参数
    console.log('\n测试 2: FormData + parent_folder 参数');
    const form2 = new FormData();
    form2.append('file', fs.readFileSync(testFilePath), {
        filename: 'test2.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    try {
        const response2 = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files/upload_all',
            form2,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...form2.getHeaders()
                },
                params: {
                    parent_folder: 'root'
                }
            }
        );
        console.log('✅ 成功:', JSON.stringify(response2.data, null, 2));
        return;
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
    }
    
    // 测试 3: 使用 JSON body + file_token
    console.log('\n测试 3: 先创建文件，再上传内容');
    console.log('步骤 1: 创建文件元数据');
    
    try {
        const createResponse = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/files',
            {
                folder_token: 'root',
                name: 'test3.docx',
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
            
            // 步骤 2: 上传文件内容
            console.log('\n步骤 2: 上传文件内容');
            const form3 = new FormData();
            form3.append('file', fs.readFileSync(testFilePath));
            
            const uploadResponse = await axios.post(
                `https://open.feishu.cn/open-apis/drive/v1/medias/resumable_upload`,
                form3,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...form3.getHeaders()
                    },
                    params: {
                        file_token: fileToken
                    }
                }
            );
            
            console.log('上传响应:', JSON.stringify(uploadResponse.data, null, 2));
        }
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
    }
    
    console.log('\n\n请检查飞书官方文档确认正确的 API 用法');
    console.log('文档链接：https://open.feishu.cn/document/server-docs/docs/drive-v1');
}

testParams().catch(console.error);
