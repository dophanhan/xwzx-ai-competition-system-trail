/**
 * AI 大赛报名系统 - API 测试脚本
 * 测试报名和成果提交功能
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 测试健康检查
async function testHealth() {
    console.log('\n=== 测试 1: 健康检查 ===');
    try {
        const response = await axios.get(`${API_BASE}/health`);
        console.log('✅ 健康检查通过:', response.data);
        return true;
    } catch (error) {
        console.log('❌ 健康检查失败:', error.message);
        return false;
    }
}

// 测试报名功能
async function testRegistration() {
    console.log('\n=== 测试 2: 报名功能 ===');
    try {
        const testData = {
            teamName: '测试队伍-' + Date.now(),
            members: [
                { name: '张三' },
                { name: '李四' },
                { name: '王五' }
            ],
            submittedAt: new Date().toISOString()
        };
        
        console.log('提交数据:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post(`${API_BASE}/registration`, testData);
        console.log('✅ 报名成功:', response.data);
        return true;
    } catch (error) {
        console.log('❌ 报名失败:', error.response?.data || error.message);
        return false;
    }
}

// 测试成果提交功能
async function testSubmission() {
    console.log('\n=== 测试 3: 成果提交功能 ===');
    try {
        const FormData = require('form-data');
        const form = new FormData();
        
        form.append('teamName', '测试队伍 - 成果提交');
        form.append('projectName', '智能测试系统');
        form.append('teamRoles', '张三负责开发，李四负责测试');
        form.append('projectDescription', '这是一个自动化测试系统');
        form.append('projectLink', 'https://github.com/test/demo');
        form.append('submittedAt', new Date().toISOString());
        
        console.log('提交数据：成果提交（无文件）');
        
        const response = await axios.post(`${API_BASE}/submission`, form, {
            headers: form.getHeaders()
        });
        
        console.log('✅ 成果提交成功:', response.data);
        return true;
    } catch (error) {
        console.log('❌ 成果提交失败:', error.response?.data || error.message);
        return false;
    }
}

// 测试数据验证
async function testValidation() {
    console.log('\n=== 测试 4: 数据验证 ===');
    try {
        // 测试空队伍名称
        await axios.post(`${API_BASE}/registration`, {
            teamName: '',
            members: [{ name: '张三' }],
            submittedAt: new Date().toISOString()
        });
        console.log('❌ 验证失败：应该拒绝空队伍名称');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ 验证通过：正确拒绝了空队伍名称');
            console.log('   错误信息:', error.response.data.message);
            return true;
        } else {
            console.log('❌ 验证异常:', error.message);
            return false;
        }
    }
}

// 主函数
async function main() {
    console.log('🚀 AI 大赛报名系统 - API 测试开始');
    console.log('=' .repeat(50));
    
    const results = {
        health: await testHealth(),
        registration: await testRegistration(),
        submission: await testSubmission(),
        validation: await testValidation()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 测试结果汇总:');
    console.log('=' .repeat(50));
    console.log(`健康检查：${results.health ? '✅ 通过' : '❌ 失败'}`);
    console.log(`报名功能：${results.registration ? '✅ 通过' : '❌ 失败'}`);
    console.log(`成果提交：${results.submission ? '✅ 通过' : '❌ 失败'}`);
    console.log(`数据验证：${results.validation ? '✅ 通过' : '❌ 失败'}`);
    console.log('=' .repeat(50));
    
    const allPassed = Object.values(results).every(r => r === true);
    if (allPassed) {
        console.log('🎉 所有测试通过！系统运行正常！');
    } else {
        console.log('⚠️  部分测试失败，请检查日志和配置。');
    }
}

// 运行测试
main().catch(console.error);
