/**
 * 测试新的飞书应用凭证
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'JXC5bfmVvanhBjsityecT5ffnne';
const TABLE_ID = 'tbltDHBoAs72cFnh';

async function testNewApp() {
    console.log('=== 测试新的飞书应用凭证 ===\n');
    console.log('应用 ID:', FEISHU_APP_ID);
    console.log('应用 Token:', APP_TOKEN);
    console.log('表格 ID:', TABLE_ID);
    console.log('=' .repeat(50));
    
    // 获取租户 access_token
    console.log('\n正在获取 token...');
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
            '队伍名称': '新应用测试队伍',
            '队伍人数': 2,
            '队员 1 姓名': '张三',
            '队员 2 姓名': '李四',
            '提交时间': new Date().toLocaleString('zh-CN')
        }
    };
    
    console.log('正在创建记录...');
    console.log('URL:', url);
    console.log('数据:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await axios.post(url, testData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            console.log('\n✅ 创建成功！新应用可以正常使用！');
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

testNewApp().catch(console.error);
