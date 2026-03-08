/**
 * 测试使用飞书官方 SDK 上传文件
 * SDK: @larksuiteoapi/node-sdk
 */

const { Client } = require('@larksuiteoapi/node-sdk');
const fs = require('fs');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testSDKUpload() {
    console.log('=== 测试飞书官方 SDK 上传文件 ===\n');
    
    // 创建客户端
    const client = new Client({
        appId: FEISHU_APP_ID,
        appSecret: FEISHU_APP_SECRET
    });
    
    console.log('✅ SDK 客户端已创建\n');
    
    // 准备测试文件
    const testFilePath = '/tmp/test_sdk_v2.docx';
    fs.writeFileSync(testFilePath, '测试文件内容 - SDK v2');
    console.log('✅ 测试文件已创建:', testFilePath, '\n');
    
    try {
        console.log('正在使用 SDK 上传文件...');
        
        // 使用 SDK 的 drive 接口上传文件
        const result = await client.drive.files.uploadAll({
            file: fs.createReadStream(testFilePath),
            folder_token: 'root'
        });
        
        console.log('✅ 上传成功！');
        console.log('响应:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ 上传失败！');
        console.error('错误:', error.message);
        
        if (error.response) {
            console.error('响应状态码:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
    
    // 如果 SDK 方式失败，尝试直接使用 SDK 的 request 方法
    console.log('\n\n尝试使用 SDK 的 request 方法...');
    
    try {
        const token = await client.auth.tenantAccessToken.internal();
        console.log('Token:', token);
        
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', fs.createReadStream(testFilePath), {
            filename: 'test_sdk_v2.docx'
        });
        
        const result = await client.request({
            method: 'post',
            url: '/open-apis/drive/v1/files/upload_all',
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            data: form,
            params: {
                folder_token: 'root'
            }
        });
        
        console.log('✅ request 方式成功！');
        console.log('响应:', JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('❌ request 方式失败:', error.message);
    }
}

testSDKUpload().catch(console.error);
