/**
 * 检查多维表格是否可访问
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a9283c06df79dcda';
const FEISHU_APP_SECRET = 'kzKzcU8ijOFBDwHSGU6RhcvhQn0t60Vj';
const APP_TOKEN = 'JXC5bfmVvanhBjsityecT5ffnne';
const TABLE_ID = 'tbltDHBoAs72cFnh';

async function checkTable() {
    console.log('=== 检查多维表格可访问性 ===\n');
    
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
    console.log('✅ Token 获取成功\n');
    
    // 尝试获取表格信息
    console.log('正在获取表格信息...');
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}`;
    console.log('URL:', url);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('\n响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            console.log('\n✅ 表格可访问！');
            console.log('表格名称:', response.data.data.name);
        } else {
            console.log('\n❌ 表格访问失败:', response.data.msg);
        }
    } catch (error) {
        console.error('\n❌ 访问表格异常:');
        console.error('状态码:', error.response?.status);
        console.error('错误信息:', JSON.stringify(error.response?.data, null, 2));
        
        // 尝试获取应用信息
        console.log('\n\n尝试获取应用信息...');
        const appUrl = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}`;
        console.log('URL:', appUrl);
        
        try {
            const appResponse = await axios.get(appUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('\n应用响应:', JSON.stringify(appResponse.data, null, 2));
            
            if (appResponse.data.code === 0) {
                console.log('\n✅ 应用可访问！');
                console.log('应用名称:', appResponse.data.data.name);
            } else {
                console.log('\n❌ 应用访问失败:', appResponse.data.msg);
            }
        } catch (appError) {
            console.error('\n❌ 访问应用也失败:');
            console.error('状态码:', appError.response?.status);
            console.error('错误信息:', JSON.stringify(appError.response?.data, null, 2));
        }
    }
}

checkTable().catch(console.error);
