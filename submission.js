// 成果提交表单处理脚本
// 功能：处理文件上传和表单提交

// 从配置文件加载 API 地址，如果没有则使用默认值
const API_BASE = window.API_CONFIG?.BASE_URL || 'http://localhost:3000/api';
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
let uploadedFiles = [];
let isSubmitting = false; // 防止重复提交

/**
 * 加载已报名的队伍列表
 */
async function loadTeams() {
    const loadingEl = document.getElementById('loadingTeams');
    const selectEl = document.getElementById('teamName');
    
    try {
        console.log('正在加载队伍列表，API:', `${API_BASE}/teams`);
        const response = await fetch(`${API_BASE}/teams`);
        console.log('响应状态:', response.status);
        
        const result = await response.json();
        console.log('响应数据:', result);
        
        loadingEl.style.display = 'none';
        
        if (result.success) {
            console.log('队伍数量:', result.data.length);
            result.data.forEach(team => {
                const option = document.createElement('option');
                option.value = team.name;
                option.textContent = team.name;
                selectEl.appendChild(option);
            });
            
            if (result.data.length === 0) {
                loadingEl.textContent = '暂无已报名的队伍';
                loadingEl.style.display = 'block';
            }
        } else {
            console.error('加载失败:', result.message);
            loadingEl.textContent = '加载失败，请手动输入';
            loadingEl.style.display = 'block';
        }
    } catch (error) {
        console.error('加载队伍列表异常:', error);
        loadingEl.textContent = '加载失败，请手动输入';
        loadingEl.style.display = 'block';
    }
}

/**
 * 设置字数统计功能
 */
function setupCharCount() {
    const fields = [
        { id: 'projectName', limit: 100 },
        { id: 'teamRoles', limit: 500 },
        { id: 'projectDescription', limit: 1000 }
    ];
    
    fields.forEach(field => {
        const input = document.getElementById(field.id);
        const countDisplay = document.getElementById(field.id + 'Count');
        
        input.addEventListener('input', () => {
            const count = input.value.length;
            countDisplay.textContent = count;
            
            // 更新样式
            countDisplay.parentElement.classList.remove('warning', 'danger');
            if (count > field.limit * 0.9) {
                countDisplay.parentElement.classList.add('danger');
            } else if (count > field.limit * 0.7) {
                countDisplay.parentElement.classList.add('warning');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    setupFileUpload();
    loadTeams();  // 加载队伍列表
    setupCharCount();  // 设置字数统计
    document.getElementById('submission-form').addEventListener('submit', handleSubmit);
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
 * 处理选择的文件
 * @param {FileList} files - 文件列表
 */
function handleFiles(files) {
    for (let file of files) {
        if (file.size > MAX_FILE_SIZE) {
            showError(`文件 "${file.name}" 超出 500MB 限制`);
            continue;
        }
        
        if (!uploadedFiles.find(f => f.name === file.name && f.size === file.size)) {
            uploadedFiles.push(file);
            simulateUpload(file);
        }
    }
    
    updateFileList();
}

/**
 * 模拟上传进度显示
 * @param {File} file - 文件对象
 */
function simulateUpload(file) {
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    progressBar.classList.add('active');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                progressBar.classList.remove('active');
                progressFill.style.width = '0%';
            }, 500);
        }
        progressFill.style.width = progress + '%';
    }, 100);
}

/**
 * 更新文件列表显示
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    
    uploadedFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
            <button type="button" class="btn-delete-file" onclick="removeFile(${index})">×</button>
        `;
        fileList.appendChild(fileItem);
    });
}

/**
 * 删除已上传的文件
 * @param {number} index - 文件索引
 */
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    updateFileList();
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 处理表单提交
 * @param {Event} e - 提交事件
 */
function handleSubmit(e) {
    e.preventDefault();
    
    // 防止重复提交
    if (isSubmitting) {
        console.log('正在提交中，请勿重复点击');
        return;
    }
    
    hideMessages();
    
    // 获取表单数据
    const teamName = document.getElementById('teamName').value.trim();
    const projectName = document.getElementById('projectName').value.trim();
    const teamRoles = document.getElementById('teamRoles').value.trim();
    const projectDescription = document.getElementById('projectDescription').value.trim();
    const projectLink = document.getElementById('projectLink').value.trim();
    
    // 验证必填字段
    if (!teamName) {
        showError('请输入队伍名称');
        return;
    }
    if (!projectName) {
        showError('请输入成果名称');
        return;
    }
    if (!teamRoles) {
        showError('请填写团队简要分工');
        return;
    }
    if (!projectDescription) {
        showError('请填写成果简要说明');
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
    
    // 验证至少有一个成果（链接或文件）
    if (uploadedFiles.length === 0 && !projectLink) {
        showError('请至少提供成果在线链接或上传本地附件');
        return;
    }
    
    // 使用 FormData 提交数据（支持文件上传）
    const formData = new FormData();
    formData.append('teamName', teamName);
    formData.append('projectName', projectName);
    formData.append('teamRoles', teamRoles);
    formData.append('projectDescription', projectDescription);
    formData.append('projectLink', projectLink);
    formData.append('submittedAt', new Date().toISOString());
    
    // 添加文件到 FormData
    uploadedFiles.forEach((file, index) => {
        formData.append('files', file);
    });
    
    submitSubmission(formData);
}

/**
 * 验证 URL 格式
 * @param {string} url - 待验证的 URL
 * @returns {boolean} 是否有效
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * 提交成果到后端
 * @param {FormData} formData - 表单数据
 */
async function submitSubmission(formData) {
    // 设置提交中状态
    isSubmitting = true;
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '提交中...';
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/submission`, {
            method: 'POST',
            // 注意：使用 FormData 时不需要设置 Content-Type，浏览器会自动设置
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('成果提交成功！');
            setTimeout(() => {
                document.getElementById('success-modal').classList.add('active');
            }, 500);
        } else {
            showError(result.message || '提交失败，请稍后重试');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('网络错误，请检查后端服务是否启动');
    } finally {
        // 重置提交状态
        isSubmitting = false;
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '提交成果';
        }
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
