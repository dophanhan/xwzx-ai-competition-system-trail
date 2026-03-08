/**
 * 表单提交测试脚本
 * 用于测试后端 API 是否正常工作
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

/**
 * 测试报名接口
 */
async function testRegistration() {
    console.log('\n=== 测试报名接口 ===\n');
    
    const testData = {
        teamName: '测试队伍',
        members: [
            { name: '队员一' },
            { name: '队员二' }
        ],
        memberCount: 2,
        submittedAt: new Date().toISOString()
    };
    
    try {
        const response = await axios.post(`${API_BASE}/registration`, testData);
        console.log('✅ 报名成功:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ 报名失败:', error.response.data);
        } else {
            console.log('❌ 网络错误:', error.message);
            console.log('提示：请确保后端服务已启动 (npm start)');
        }
    }
}

/**
 * 测试成果提交接口
 */
async function testSubmission() {
    console.log('\n=== 测试成果提交接口 ===\n');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('teamName', '测试队伍');
    formData.append('projectName', '测试项目');
    formData.append('teamRoles', '测试分工');
    formData.append('projectDescription', '测试说明');
    formData.append('projectLink', 'https://example.com');
    formData.append('submittedAt', new Date().toISOString());
    
    try {
        const response = await axios.post(`${API_BASE}/submission`, formData, {
            headers: formData.getHeaders()
        });
        console.log('✅ 成果提交成功:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('❌ 成果提交失败:', error.response.data);
        } else {
            console.log('❌ 网络错误:', error.message);
            console.log('提示：请确保后端服务已启动 (npm start)');
        }
    }
}

/**
 * 测试健康检查接口
 */
async function testHealth() {
    console.log('\n=== 测试健康检查接口 ===\n');
    
    try {
        const response = await axios.get(`${API_BASE}/health`);
        console.log('✅ 健康检查通过:', response.data);
    } catch (error) {
        console.log('❌ 健康检查失败:', error.message);
        console.log('提示：请确保后端服务已启动 (npm start)');
    }
}

/**
 * 测试字段验证
 */
async function testValidation() {
    console.log('\n=== 测试字段验证 ===\n');
    
    // 测试空队伍名称
    console.log('测试 1: 空队伍名称');
    try {
        await axios.post(`${API_BASE}/registration`, {
            teamName: '',
            members: [{ name: '队员一' }],
            submittedAt: new Date().toISOString()
        });
        console.log('❌ 验证失败：应该拒绝空队伍名称');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ 验证通过:', error.response.data.message);
        } else {
            console.log('❌ 错误:', error.message);
        }
    }
    
    // 测试超出人数限制
    console.log('\n测试 2: 超出人数限制');
    try {
        await axios.post(`${API_BASE}/registration`, {
            teamName: '测试队伍',
            members: [
                { name: '队员一' },
                { name: '队员二' },
                { name: '队员三' },
                { name: '队员四' }
            ],
            submittedAt: new Date().toISOString()
        });
        console.log('❌ 验证失败：应该拒绝超过 3 人的队伍');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ 验证通过:', error.response.data.message);
        } else {
            console.log('❌ 错误:', error.message);
        }
    }
    
    // 测试空成果名称
    console.log('\n测试 3: 空成果名称');
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('teamName', '测试队伍');
    formData.append('projectName', '');
    formData.append('teamRoles', '测试分工');
    formData.append('projectDescription', '测试说明');
    formData.append('submittedAt', new Date().toISOString());
    
    try {
        await axios.post(`${API_BASE}/submission`, formData, {
            headers: formData.getHeaders()
        });
        console.log('❌ 验证失败：应该拒绝空成果名称');
    } catch (error) {
        if (error.response && error.response.status === 400) {
            console.log('✅ 验证通过:', error.response.data.message);
        } else {
            console.log('❌ 错误:', error.message);
        }
    }
}

// 主函数
async function main() {
    console.log('🦞 AI 大赛报名系统 - 测试脚本');
    console.log('================================');
    
    await testHealth();
    await testRegistration();
    await testSubmission();
    await testValidation();
    
    console.log('\n================================');
    console.log('测试完成！\n');
}

main();
