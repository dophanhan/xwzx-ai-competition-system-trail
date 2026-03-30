// 报名表单处理脚本
// 功能：管理队员信息添加/删除，处理表单提交

let memberCount = 0;
const MAX_MEMBERS = 3;

// 从配置文件加载 API 地址，如果没有则使用默认值
const API_BASE = window.API_CONFIG?.BASE_URL || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('报名页面加载完成');
    
    // 初始化：添加第一个队员
    addMember();
    
    // 检查元素是否存在
    const addBtn = document.getElementById('addMemberBtn');
    const formEl = document.getElementById('registration-form');
    
    if (!addBtn) {
        console.error('找不到添加队员按钮');
        return;
    }
    
    if (!formEl) {
        console.error('找不到报名表单');
        return;
    }
    
    // 绑定事件
    addBtn.addEventListener('click', addMember);
    formEl.addEventListener('submit', handleSubmit);
    updateAddButton();
    
    console.log('事件绑定完成');
});

/**
 * 添加队员输入框
 */
function addMember() {
    if (memberCount >= MAX_MEMBERS) return;
    
    memberCount++;
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member-item';
    memberDiv.id = `member-${memberCount}`;
    
    memberDiv.innerHTML = `
        <div class="member-header">
            <h4>队员 ${memberCount}</h4>
            ${memberCount > 1 ? `<button type="button" class="btn-remove" onclick="removeMember(${memberCount})">删除</button>` : ''}
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label>姓名 <span class="required">*</span></label>
            <input type="text" id="member-name-${memberCount}" placeholder="请输入队员姓名" required>
        </div>
    `;
    
    document.getElementById('teamMembers').appendChild(memberDiv);
    updateAddButton();
}

/**
 * 删除队员
 * @param {number} id - 队员 ID
 */
function removeMember(id) {
    const memberDiv = document.getElementById(`member-${id}`);
    if (memberDiv) {
        memberDiv.remove();
        renumberMembers();
        updateAddButton();
    }
}

/**
 * 重新编号队员（删除中间某个队员后）
 */
function renumberMembers() {
    const members = document.querySelectorAll('.member-item');
    memberCount = 0;
    members.forEach((member, index) => {
        memberCount++;
        member.id = `member-${memberCount}`;
        member.querySelector('h4').textContent = `队员 ${memberCount}`;
        
        const nameInput = member.querySelector('input[type="text"]');
        nameInput.id = `member-name-${memberCount}`;
        
        const removeBtn = member.querySelector('.btn-remove');
        if (removeBtn) {
            if (memberCount === 1) {
                removeBtn.remove();
            } else {
                removeBtn.setAttribute('onclick', `removeMember(${memberCount})`);
            }
        }
    });
}

/**
 * 更新添加按钮状态
 */
function updateAddButton() {
    const addBtn = document.getElementById('addMemberBtn');
    if (memberCount >= MAX_MEMBERS) {
        addBtn.disabled = true;
        addBtn.textContent = '已达人数上限（3 人）';
    } else {
        addBtn.disabled = false;
        addBtn.textContent = '+ 添加队员';
    }
}

/**
 * 处理表单提交
 * @param {Event} e - 提交事件
 */
function handleSubmit(e) {
    e.preventDefault();
    hideMessages();
    
    // 验证队伍名称
    const teamName = document.getElementById('teamName').value.trim();
    if (!teamName) {
        showError('请输入队伍名称');
        return;
    }
    
    // 收集队员信息 - 直接从 DOM 获取实际队员数量
    const members = [];
    const memberElements = document.querySelectorAll('.member-item');
    for (let i = 0; i < memberElements.length; i++) {
        const member = memberElements[i];
        const nameInput = member.querySelector('input[type="text"]');
        const name = nameInput.value.trim();
        
        if (!name) {
            showError(`请输入队员 ${i + 1} 的姓名`);
            return;
        }
        
        members.push({ name });
    }
    
    // 验证队伍人数
    if (members.length < 1 || members.length > 3) {
        showError('队伍人数必须在 1-3 人之间');
        return;
    }
    
    // 准备提交数据
    const formData = {
        teamName,
        members,
        memberCount: members.length,  // 自动计算队伍人数
        submittedAt: new Date().toISOString()
    };
    
    submitRegistration(formData);
}

/**
 * 提交报名表单到后端
 * @param {Object} data - 报名数据
 */
async function submitRegistration(data) {
    try {
        const response = await fetch(`${API_BASE}/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('报名信息提交成功！');
            setTimeout(() => {
                document.getElementById('success-modal').classList.add('active');
            }, 500);
        } else {
            showError(result.message || '提交失败，请稍后重试');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('网络错误，请检查后端服务是否启动');
    }
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.add('active');
}

/**
 * 显示成功消息
 * @param {string} message - 成功消息
 */
function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.classList.add('active');
}

/**
 * 隐藏所有消息
 */
function hideMessages() {
    document.getElementById('error-message').classList.remove('active');
    document.getElementById('success-message').classList.remove('active');
}

/**
 * 关闭弹窗并跳转首页
 */
function closeModalAndRedirect() {
    document.getElementById('success-modal').classList.remove('active');
    window.location.href = 'index.html';
}
