/**
 * 检查多维表格的实际字段名称
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'JXC5bfmVvanhBjsityecT5ffnne';

async function checkFields() {
    console.log('=== 检查多维表格字段 ===\n');
    
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
    
    // 获取表格元数据
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${APP_TOKEN}/tables`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('响应:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            const tables = response.data.data.items || [];
            console.log('\n📋 找到的表格:');
            
            tables.forEach(table => {
                console.log(`\n表格名称：${table.name}`);
                console.log(`表格 ID: ${table.id}`);
                
                if (table.fields && table.fields.length > 0) {
                    console.log('字段列表:');
                    table.fields.forEach(field => {
                        console.log(`  - ${field.name} (${field.type})`);
                    });
                }
            });
        } else {
            console.error('❌ 获取表格列表失败:', response.data.msg);
        }
    } catch (error) {
        console.error('❌ 异常:', error.response?.data || error.message);
    }
}

checkFields().catch(console.error);
