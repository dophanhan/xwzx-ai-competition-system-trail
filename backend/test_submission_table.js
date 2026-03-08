/**
 * 测试成果提交表
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'L3yMbpiBNajDg9sPYU6cwQOunSc';  // 成果提交表应用
const TABLE_ID = 'tblxYsQVComD9wRW';

async function testSubmissionTable() {
    console.log('=== 测试成果提交表 ===\n');
    console.log('应用 ID:', FEISHU_APP_ID);
    console.log('应用 Token:', APP_TOKEN);
    console.log('表格 ID:', TABLE_ID);
    console.log('=' .repeat(50));
    
    // 获取租户 access_token
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
    console.log('✅ Token 获取成功:', token.substring(0, 20) + '...\n');
    
    // 测试创建记录
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/records`;
    
    const testData = {
        fields: {
            '队伍名称': 'API 测试队伍',
            '成果名称': '智能测试系统',
            '团队分工说明': '张三负责开发',
            '成果说明': '自动化测试系统',
            '成果链接': 'https://github.com/test',
            '提交时间': new Date().toLocaleString('zh-CN')
        }
    };
    
    console.log('正在创建记录...');
    
    try {
        const response = await axios.post(url, testData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            console.log('\n✅ 创建成功！成果提交表可以正常使用！');
            console.log('记录 ID:', response.data.data.id);
            return true;
        } else {
            console.log('\n❌ 创建失败:', response.data.msg);
            return false;
        }
    } catch (error) {
        console.error('\n❌ 创建记录异常:');
        console.error('状态码:', error.response?.status);
        console.error('错误信息:', JSON.stringify(error.response?.data, null, 2));
        return false;
    }
}

testSubmissionTable().catch(console.error);
