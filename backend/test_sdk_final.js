/**
 * 测试使用飞书官方 SDK 上传文件 - 最终版本
 */

const lark = require('@larksuiteoapi/node-sdk');
const fs = require('fs');
const path = require('path');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

async function testSDKUpload() {
    console.log('=== 测试飞书官方 SDK 上传文件 ===\n');
    
    // 创建客户端
    const client = new lark.Client({
        appId: FEISHU_APP_ID,
        appSecret: FEISHU_APP_SECRET
    });
    
    console.log('✅ SDK 客户端已创建\n');
    
    // 准备测试文件
    const testFilePath = path.join(__dirname, '..', 'test_upload.docx');
    fs.writeFileSync(testFilePath, '测试文件内容 - SDK Final');
    console.log('✅ 测试文件已创建:', testFilePath, '\n');
    
    try {
        console.log('正在使用 SDK 上传文件...');
        console.log('API: client.drive.media.uploadAll');
        
        // 使用 SDK 的 drive.media.uploadAll 接口
        const result = await client.drive.media.uploadAll({
            data: {
                file: fs.createReadStream(testFilePath),
                parent_type: 'drive',
                folder_token: 'root'
            }
        });
        
        console.log('\n✅ 上传成功！');
        console.log('响应:', JSON.stringify(result, null, 2));
        
        if (result.code === 0) {
            console.log('\n🎉 成功！');
            console.log('文件 Token:', result.data?.file_token);
            console.log('文件名:', result.data?.name);
            console.log('文件大小:', result.data?.size);
        }
        
        // 清理测试文件
        fs.unlinkSync(testFilePath);
        
    } catch (error) {
        console.error('\n❌ 上传失败！');
        console.error('错误消息:', error.message);
        console.error('错误代码:', error.code);
        
        if (error.response) {
            console.error('响应状态码:', error.response.status);
            console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
        }
        
        if (error.data) {
            console.error('错误详情:', error.data);
        }
        
        // 清理测试文件
        if (fs.existsSync(testFilePath)) {
            fs.unlinkSync(testFilePath);
        }
    }
}

testSDKUpload().catch(console.error);
