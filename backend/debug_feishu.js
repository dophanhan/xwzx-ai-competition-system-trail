/**
 * 测试飞书 API 调用
 */

const axios = require('axios');

// 配置
const FEISHU_APP_ID = 'cli_a9283c06df79dcda';
const FEISHU_APP_SECRET = 'kzKzcU8ijOFBDwHSGU6RhcvhQn0t60Vj';
const REGISTRATION_APP_TOKEN = 'JXC5bfmVvanhBjsityecT5ffnne';
const REGISTRATION_TABLE_ID = 'tbltDHBoAs72cFnh';

// 获取租户 access_token
async function getTenantAccessToken() {
    try {
        const response = await axios.post(
            'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
            {
                app_id: FEISHU_APP_ID,
                app_secret: FEISHU_APP_SECRET
            }
        );
        
        console.log('获取 token 响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            return response.data.tenant_access_token;
        } else {
            console.error('获取 token 失败:', response.data.msg);
            return null;
        }
    } catch (error) {
        console.error('获取 token 异常:', error.response?.data || error.message);
        return null;
    }
}

// 测试创建记录
async function testCreateRecord(token) {
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${REGISTRATION_APP_TOKEN}/tables/${REGISTRATION_TABLE_ID}/records`;
    
    const testData = {
        fields: {
            '队伍名称': 'API 测试队伍',
            '队伍人数': 2,
            '队员 1 姓名': '张三',
            '队员 2 姓名': '李四',
            '提交时间': new Date().toLocaleString('zh-CN')
        }
    };
    
    console.log('\n请求 URL:', url);
    console.log('请求数据:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await axios.post(url, testData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('\n创建记录响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            console.log('✅ 创建成功！');
            return true;
        } else {
            console.error('❌ 创建失败:', response.data.msg);
            return false;
        }
    } catch (error) {
        console.error('\n❌ 创建记录异常:');
        console.error('状态码:', error.response?.status);
        console.error('错误信息:', error.response?.data);
        console.error('完整错误:', error.message);
        return false;
    }
}

// 主函数
async function main() {
    console.log('=== 飞书 API 调试测试 ===\n');
    console.log('应用 ID:', FEISHU_APP_ID);
    console.log('应用 Token:', REGISTRATION_APP_TOKEN);
    console.log('表格 ID:', REGISTRATION_TABLE_ID);
    console.log('=' .repeat(50));
    
    const token = await getTenantAccessToken();
    if (!token) {
        console.log('\n❌ 无法获取 token，测试终止');
        return;
    }
    
    console.log('\n✅ Token 获取成功:', token.substring(0, 20) + '...');
    
    await testCreateRecord(token);
}

main().catch(console.error);
