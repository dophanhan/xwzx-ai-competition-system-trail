/**
 * 测试使用飞书官方 SDK 上传文件
 */

const { Client } = require('@lark-base-open/js-sdk');
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
    const testFilePath = '/tmp/test_sdk.docx';
    fs.writeFileSync(testFilePath, '测试文件内容 - SDK 上传');
    console.log('✅ 测试文件已创建:', testFilePath, '\n');
    
    try {
        console.log('正在上传文件...');
        
        // 使用 SDK 上传文件
        const result = await client.drive.files.uploadAll({
            file: fs.createReadStream(testFilePath),
            folder_token: 'root'
        });
        
        console.log('✅ 上传成功！');
        console.log('响应:', JSON.stringify(result, null, 2));
        
        if (result.code === 0) {
            console.log('\n🎉 成功！');
            console.log('文件 Token:', result.data?.file_token);
            console.log('文件名:', result.data?.name);
        }
        
    } catch (error) {
        console.error('❌ 上传失败！');
        console.error('错误:', error.message);
        console.error('堆栈:', error.stack);
        
        if (error.response) {
            console.error('响应状态码:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testSDKUpload().catch(console.error);
