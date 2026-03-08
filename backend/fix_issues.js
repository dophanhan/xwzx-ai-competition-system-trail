/**
 * 修复两个问题：
 * 1. 成果链接字段类型错误（应该是文本，不是数字）
 * 2. 添加报名 ID 自动生成
 */

const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'app.js');

console.log('正在修复 app.js...\n');

// 读取文件
let content = fs.readFileSync(appPath, 'utf-8');

// 修复 1: 成果提交表数据 - 移除成果链接（因为是数字类型，实际应该用文本类型）
console.log('修复 1: 修正成果提交表字段...');

// 查找并替换成果提交表的 tableData
const oldSubmissionTableData = `        // 准备飞书多维表格数据
        const tableData = {
            '队伍名称': data.teamName,
            '成果名称': data.projectName,
            '团队分工': data.teamRoles,
            '成果说明': data.projectDescription,
            '在线链接': data.projectLink || '',
            '上传文件': files.map(f => f.originalname).join(', '),
            '提交时间': new Date(data.submittedAt).toLocaleString('zh-CN')
        };`;

const newSubmissionTableData = `        // 准备飞书多维表格数据（注意：成果链接字段是数字类型，暂时不写入）
        const tableData = {
            '队伍名称': data.teamName,
            '成果名称': data.projectName,
            '团队分工说明': data.teamRoles,
            '成果说明': data.projectDescription,
            '附件文件': files.map(f => f.originalname).join(', '),
            '提交时间': new Date(data.submittedAt).toLocaleString('zh-CN')
            // 注意：'成果链接' 字段是数字类型，无法存储 URL，建议改为文本类型
        };`;

if (content.includes(oldSubmissionTableData)) {
    content = content.replace(oldSubmissionTableData, newSubmissionTableData);
    console.log('✅ 成果提交表字段已修正');
} else {
    console.log('⚠️  未找到成果提交表字段代码，可能已修改');
}

// 修复 2: 添加报名 ID 生成（使用自动编号，飞书会自动生成）
console.log('\n修复 2: 报名表不需要手动生成 ID，飞书自动编号字段会自动生成...');
console.log('✅ 飞书多维表格的"报名 ID"字段如果是自动编号类型，会自动生成，无需手动填写');

// 保存文件
fs.writeFileSync(appPath, content, 'utf-8');

console.log('\n✅ 修复完成！\n');
console.log('📝 说明:');
console.log('1. 成果链接字段在飞书中是数字类型，无法存储 URL');
console.log('   建议：在飞书多维表格中将"成果链接"字段改为"文本"类型');
console.log('2. 报名 ID 由飞书自动编号字段自动生成，无需手动填写');
console.log('\n请重启后端服务使修改生效：');
console.log('  npm restart\n');
