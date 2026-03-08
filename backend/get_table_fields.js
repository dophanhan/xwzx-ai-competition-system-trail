/**
 * 获取多维表格的字段详情
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'L3yMbpiBNajDg9sPYU6cwQOunSc';  // 成果提交表应用
const TABLE_ID = 'tblxYsQVComD9wRW';  // 成果提交表

async function getTableFields() {
    console.log('=== 获取多维表格字段详情 ===\n');
    
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
    
    // 获取表格的字段
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables/${TABLE_ID}/fields`;
    console.log('URL:', url);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('\n响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            const fields = response.data.data.items || [];
            console.log('\n📋 表格字段列表:\n');
            
            fields.forEach(field => {
                console.log(`字段名：${field.field_name}`);
                console.log(`  类型：${field.type}`);
                console.log(`  ID: ${field.id}`);
                console.log();
            });
            
            console.log('\n✅ 共找到', fields.length, '个字段');
        } else {
            console.error('❌ 获取字段失败:', response.data.msg);
        }
    } catch (error) {
        console.error('❌ 异常:', error.response?.data || error.message);
    }
}

getTableFields().catch(console.error);
