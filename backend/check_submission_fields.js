/**
 * 检查成果提交表的字段
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';
const APP_TOKEN = 'L3yMbpiBNajDg9sPYU6cwQOunSc';
const TABLE_ID = 'tblxYsQVComD9wRW';

async function checkFields() {
    console.log('=== 检查成果提交表字段 ===\n');
    
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
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.data.code === 0) {
            const fields = response.data.data.items || [];
            console.log('📋 表格字段列表:\n');
            
            fields.forEach((field, index) => {
                console.log(`${index + 1}. ${field.field_name} (${field.type})`);
            });
            
            console.log('\n✅ 共找到', fields.length, '个字段');
            
            // 检查是否有"附件文件"字段
            const attachmentField = fields.find(f => f.field_name === '附件文件');
            if (attachmentField) {
                console.log('\n✅ 找到"附件文件"字段');
                console.log('   类型:', attachmentField.type);
                console.log('   UI 类型:', attachmentField.ui_type);
            } else {
                console.log('\n❌ 未找到"附件文件"字段');
                console.log('   可能字段名称不匹配！');
            }
        } else {
            console.error('❌ 获取字段失败:', response.data.msg);
        }
    } catch (error) {
        console.error('❌ 异常:', error.response?.data || error.message);
    }
}

checkFields().catch(console.error);
