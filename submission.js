/**
 * 成果提交页面脚本
 */

let isSubmitting = false;
let selectedFiles = [];

// 从配置文件加载 API 地址
const API_BASE = window.API_CONFIG?.BASE_URL || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');
    
    // 加载队伍列表
    loadTeams();
    
    // 设置文件上传
    setupFileUpload();
    
    // 绑定表单提交事件
    const form = document.getElementById('submission-form');
    console.log('表单元素:', form);
    if (form) {
        form.addEventListener('submit', handleSubmit);
        console.log('表单提交事件已绑定');
    } else {
        console.error('表单元素未找到!');
    }
});

/**
 * 加载已报名的队伍列表
 */
async function loadTeams() {
    const dropdown = document.getElementById('teamDropdown');
    const loadingEl = document.getElementById('loadingTeams');
    
    try {
        const response = await fetch(`${API_BASE}/api/teams`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            // 去重和去空
            const uniqueTeams = [...new Set(result.data.map(t => t.name))]
                .filter(name => name && name.trim());
            
            if (uniqueTeams.length === 0) {
                dropdown.innerHTML = '<div class="no-teams">暂无报名队伍</div>';
                return;
            }
            
            // 生成下拉选项
            dropdown.innerHTML = uniqueTeams.map(name => 
                `<div class="team-option" data-team="${escapeHtml(name)}">${escapeHtml(name)}</div>`
            ).join('');
            
            // 绑定选择事件
            dropdown.querySelectorAll('.team-option').forEach(option => {
                option.addEventListener('click', function() {
                    const teamName = this.getAttribute('data-team');
                    selectTeam(teamName);
                });
            });
        } else {
            dropdown.innerHTML = '<div class="no-teams">暂无报名队伍，请先报名</div>';
        }
    } catch (error) {
        console.error('加载队伍列表失败:', error);
        dropdown.innerHTML = '<div class="no-teams">加载失败，请刷新重试</div>';
    }
}

/**
 * 选择队伍
 */
function selectTeam(teamName) {
    document.getElementById('teamName').value = teamName;
    document.getElementById('selectedTeamText').textContent = teamName;
    document.getElementById('teamDropdown').classList.remove('show');
}

/**
 * 切换下拉菜单显示
 */
document.getElementById('teamSelectBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('teamDropdown').classList.toggle('show');
});

// 点击其他地方关闭下拉菜单
document.addEventListener('click', function() {
    document.getElementById('teamDropdown').classList.remove('show');
});

// 阻止下拉菜单内部点击冒泡
document.getElementById('teamDropdown').addEventListener('click', function(e) {
    e.stopPropagation();
});

/**
 * 设置文件上传区域事件
 */
function setupFileUpload() {
    const uploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

/**
 * 处理选中的文件
 */
async function handleFiles(files) {
    const maxFileSize = 20 * 1024 * 1024; // 20MB
    
    for (let file of files) {
        if (file.size > maxFileSize) {
            showError(`文件 ${file.name} 超过 20MB 限制`);
            continue;
        }
        
        try {
            // 读取文件为 base64
            const base64 = await fileToBase64(file);
            
            selectedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type,
                base64: base64
            });
        } catch (error) {
            console.error('文件读取失败:', error);
            showError(`文件 ${file.name} 读取失败`);
        }
    }
    
    updateFileList();
}

/**
 * 文件转 base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * 更新文件列表显示
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <span>📎 ${file.name} (${formatFileSize(file.size)})</span>
            <button type="button" class="btn-remove-file" onclick="removeFile(${index})">✕</button>
        </div>
    `).join('');
}

/**
 * 删除文件
 */
function removeFile(index) {
    selectedFiles.splice(index, 1);
    updateFileList();
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * 验证 URL（支持无协议格式）
 */
function isValidUrl(string) {
    // 如果是空字符串，认为是有效的（可选字段）
    if (!string || !string.trim()) {
        console.log('URL 为空，验证通过');
        return true;
    }
    
    const trimmed = string.trim();
    console.log('验证 URL:', trimmed);
    
    // 简单验证：包含点号且没有空格
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
        console.log('URL 格式验证通过');
        return true;
    }
    
    // 尝试添加 https:// 前缀
    try {
        if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
            new URL('https://' + trimmed);
        } else {
            new URL(trimmed);
        }
        console.log('URL 验证通过');
        return true;
    } catch (e) {
        console.log('URL 验证失败:', e.message);
        return false;
    }
}

/**
 * HTML 转义
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 提交表单
 */
function handleSubmit(e) {
    e.preventDefault();
    
    console.log('表单提交触发');
    
    if (isSubmitting) {
        console.log('正在提交中，请勿重复点击');
        return;
    }
    
    hideMessages();
    
    // 验证队伍名称
    const teamName = document.getElementById('teamName').value.trim();
    console.log('队伍名称:', teamName);
    if (!teamName) {
        showError('请选择队伍名称');
        return;
    }
    
    // 获取表单数据
    const projectName = document.getElementById('projectName').value.trim();
    const teamRoles = document.getElementById('teamRoles').value.trim();
    const projectDescription = document.getElementById('projectDescription').value.trim();
    const projectLink = document.getElementById('projectLink').value.trim();
    
    console.log('表单数据:', { projectName, teamRoles, projectDescription, projectLink });
    
    // 验证必填字段
    if (!projectName) {
        showError('请输入成果名称');
        return;
    }
    if (!teamRoles) {
        showError('请填写团队分工说明');
        return;
    }
    if (!projectDescription) {
        showError('请填写成果说明');
        return;
    }
    
    // 验证链接格式
    if (projectLink && !isValidUrl(projectLink)) {
        showError('请输入有效的在线链接');
        return;
    }
    
    // 验证字数
    if (projectName.length > 100) {
        showError('成果名称不能超过 100 字');
        return;
    }
    if (teamRoles.length > 500) {
        showError('团队分工说明不能超过 500 字');
        return;
    }
    if (projectDescription.length > 1000) {
        showError('成果说明不能超过 1000 字');
        return;
    }
    
    // 准备提交数据
    const submissionData = {
        teamName: teamName,
        projectName: projectName,
        teamRoles: teamRoles,
        projectDescription: projectDescription,
        projectLink: projectLink,
        files: selectedFiles
    };
    
    console.log('准备提交:', submissionData);
    
    // 提交到后端
    submitSubmission(submissionData);
}

/**
 * 提交成果到后端
 */
async function submitSubmission(data) {
    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    
    console.log('提交数据:', data);
    console.log('API 地址:', `${API_BASE}/api/submission`);
    
    try {
        const response = await fetch(`${API_BASE}/api/submission`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        console.log('响应状态:', response.status);
        
        const result = await response.json();
        console.log('响应结果:', result);
        
        if (result.success) {
            showSuccess('成果提交成功！');
            // 重置表单
            document.getElementById('submission-form').reset();
            document.getElementById('teamName').value = '';
            document.getElementById('selectedTeamText').textContent = '请选择已报名的队伍';
            selectedFiles = [];
            updateFileList();
        } else {
            throw new Error(result.message || result.error || '提交失败');
        }
    } catch (error) {
        console.error('提交失败:', error);
        showError(error.message || '提交失败，请稍后重试');
    } finally {
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * 显示成功消息
 */
function showSuccess(message) {
    const modal = document.getElementById('success-modal');
    modal.querySelector('h2').textContent = message;
    modal.style.display = 'flex';
}

/**
 * 显示错误消息
 */
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #ef4444; padding: 12px; border-radius: 8px; margin-bottom: 20px;';
    
    const form = document.getElementById('submission-form');
    const existingError = form.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    form.insertBefore(errorDiv, form.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * 隐藏错误消息
 */
function hideMessages() {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) errorDiv.remove();
}

/**
 * 关闭模态框并返回首页
 */
function closeModalAndRedirect() {
    const modal = document.getElementById('success-modal');
    modal.style.display = 'none';
    window.location.href = 'index.html';
}
