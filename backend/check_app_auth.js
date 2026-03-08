/**
 * 检查飞书应用身份和权限
 */

const axios = require('axios');

const FEISHU_APP_ID = 'cli_a9283c06df79dcda';
const FEISHU_APP_SECRET = 'kzKzcU8ijOFBDwHSGU6RhcvhQn0t60Vj';

async function checkAppAuth() {
    console.log('=== 检查飞书应用身份 ===\n');
    
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
    console.log('✅ 租户 access_token 获取成功\n');
    
    // 获取应用信息
    console.log('正在获取应用信息...');
    const appResponse = await axios.get(
        'https://open.feishu.cn/open-apis/application/v4/applications/me',
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    
    if (appResponse.data.code === 0) {
        console.log('\n📋 应用信息:');
        console.log('应用 ID:', appResponse.data.data.app_id);
        console.log('应用名称:', appResponse.data.data.name);
        console.log('应用类型:', appResponse.data.data.type);
        console.log('创建者:', appResponse.data.data.creator_id);
        
        // 检查应用身份
        console.log('\n🔐 应用身份:');
        if (appResponse.data.data.app_identity) {
            console.log('已配置应用身份：✅');
        } else {
            console.log('未配置应用身份：❌');
            console.log('\n⚠️  需要在飞书开放平台配置应用身份！');
            console.log('路径：应用详情 → 应用身份 → 添加身份（选择企业）');
        }
    } else {
        console.error('❌ 获取应用信息失败:', appResponse.data.msg);
    }
    
    // 获取权限列表
    console.log('\n\n📋 正在获取已开通的权限...');
    const authResponse = await axios.get(
        'https://open.feishu.cn/open-apis/application/v6/applications/me/permissions',
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    );
    
    if (authResponse.data.code === 0) {
        console.log('\n✅ 已开通的权限:');
        const permissions = authResponse.data.data.items || [];
        
        const requiredPermissions = [
            'bitable:app',
            'base:record:create',
            'im:message'
        ];
        
        console.log('\n必需权限检查:');
        requiredPermissions.forEach(perm => {
            const hasPermission = permissions.some(p => p.code === perm && p.status === 1);
            console.log(`${hasPermission ? '✅' : '❌'} ${perm}`);
        });
        
        console.log('\n所有已开通权限列表:');
        permissions.forEach(p => {
            if (p.status === 1) {
                console.log(`  - ${p.code} (${p.name})`);
            }
        });
    } else {
        console.error('❌ 获取权限列表失败:', authResponse.data.msg);
    }
}

checkAppAuth().catch(console.error);
