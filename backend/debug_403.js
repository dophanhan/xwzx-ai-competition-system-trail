/**
 * 调试 403 错误的详细原因
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'L3yMbpiBNajDg9sPYU6cwQOunSc';
const TABLE_ID = 'tblxYsQVComD9wRW';

async function debug403() {
    console.log('=== 调试 403 错误 ===\n');
    
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
    console.log('✅ Token:', token);
    console.log('应用 Token:', APP_TOKEN);
    console.log('表格 ID:', TABLE_ID);
    
    // 尝试 1：先获取表格信息
    console.log('\n--- 尝试 1: 获取表格信息 ---');
    const tableUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}`;
    console.log('URL:', tableUrl);
    
    try {
        const tableResponse = await axios.get(tableUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('表格响应:', JSON.stringify(tableResponse.data, null, 2));
    } catch (error) {
        console.error('表格请求失败:', error.response?.status, error.response?.data);
    }
    
    // 尝试 2：测试创建记录
    console.log('\n--- 尝试 2: 创建记录 ---');
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
    
    console.log('请求数据:', JSON.stringify(testData, null, 2));
    
    try {
        const response = await axios.post(url, testData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            console.log('\n✅ 创建成功！');
        } else {
            console.log('\n❌ 创建失败:', response.data.msg);
            console.log('错误详情:', response.data.error);
        }
    } catch (error) {
        console.error('\n❌ 异常详情:');
        console.error('状态码:', error.response?.status);
        console.error('错误代码:', error.response?.data?.code);
        console.error('错误信息:', error.response?.data?.msg);
        console.error('错误详情:', JSON.stringify(error.response?.data?.error, null, 2));
        
        // 检查是否是应用身份问题
        if (error.response?.status === 403) {
            console.log('\n⚠️ 403 错误可能的原因:');
            console.log('1. 应用没有该表格的访问权限');
            console.log('2. 应用身份未配置或配置错误');
            console.log('3. 表格不属于该应用');
            console.log('4. 应用被禁用或限制');
        }
    }
}

debug403().catch(console.error);
