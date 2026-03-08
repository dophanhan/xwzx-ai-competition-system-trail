/**
 * 测试上传文件到多维表格
 * 多维表格本身就是一种云文档
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'L3yMbpiBNajDg9sPYU6cwQOunSc';  // 成果提交表

async function testUploadToBitable() {
    console.log('=== 测试上传文件到多维表格 ===\n');
    console.log('多维表格 App Token:', APP_TOKEN);
    
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
    const testFilePath = '/tmp/test_bitable.docx';
    fs.writeFileSync(testFilePath, '测试文件内容 - 上传到多维表格');
    const fileSize = fs.statSync(testFilePath).size;
    const fileName = 'test_bitable.docx';
    
    console.log('文件大小:', fileSize, 'bytes');
    console.log('文件名:', fileName, '\n');
    
    // 方法 1: 使用多维表格的 app_token 作为 parent_node
    console.log('方法 1: 使用 app_token 作为 parent_node, parent_type=bitable_file');
    const form1 = new FormData();
    form1.append('file_name', fileName);
    form1.append('parent_type', 'bitable_file');  // 多维表格文件
    form1.append('parent_node', APP_TOKEN);  // 多维表格的 app_token
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
        
        if (response1.data.code === 0) {
            console.log('\n🎉 上传成功！');
            console.log('文件 Token:', response1.data.data?.file_token);
            console.log('文件名:', response1.data.data?.name);
            
            // 测试将这个文件写入多维表格的附件字段
            console.log('\n正在测试写入多维表格...');
            const tableId = 'tblxYsQVComD9wRW';
            const recordData = {
                fields: {
                    '队伍名称': '测试队伍',
                    '成果名称': '测试成果',
                    '团队分工说明': '测试分工',
                    '成果说明': '测试说明',
                    '成果链接': 'https://test.com',
                    '附件文件': [
                        {
                            file_token: response1.data.data.file_token,
                            name: response1.data.data.name
                        }
                    ],
                    '提交时间': new Date().toLocaleString('zh-CN')
                }
            };
            
            const createRecordUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`;
            const createResponse = await axios.post(createRecordUrl, recordData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('创建记录响应:', JSON.stringify(createResponse.data, null, 2));
            
            if (createResponse.data.code === 0) {
                console.log('\n✅ 记录创建成功！');
                console.log('记录 ID:', createResponse.data.data.id);
            }
        }
        
        return;
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.status);
        console.log('错误代码:', error.response?.data?.code);
        console.log('错误消息:', error.response?.data?.msg);
        console.log('错误详情:', JSON.stringify(error.response?.data?.error, null, 2));
    }
    
    // 方法 2: 尝试使用 docx_file 作为 parent_type
    console.log('\n方法 2: 使用 parent_type=docx_file');
    const form2 = new FormData();
    form2.append('file_name', fileName);
    form2.append('parent_type', 'docx_file');
    form2.append('parent_node', APP_TOKEN);
    form2.append('size', fileSize.toString());
    form2.append('file', fs.createReadStream(testFilePath));
    
    try {
        const response2 = await axios.post(
            'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all',
            form2,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        
        console.log('✅ 成功！');
        console.log('响应:', JSON.stringify(response2.data, null, 2));
        
    } catch (error) {
        console.log('❌ 失败:', error.response?.data?.msg || error.message);
    }
}

testUploadToBitable().catch(console.error);
