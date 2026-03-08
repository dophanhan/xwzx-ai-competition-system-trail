/**
 * 附件上传模块 - 上传文件到飞书多维表格
 * 支持中文文件名
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const FEISHU_APP_ID = 'cli_a90abd1ceff99cc4';
const FEISHU_APP_SECRET = 'oyvAMYAyZnYf76CKMRixbgcnynTO6kPB';

/**
 * 获取租户 access_token
 */
async function getTenantAccessToken() {
    const response = await axios.post(
        'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
        {
            app_id: FEISHU_APP_ID,
            app_secret: FEISHU_APP_SECRET
        }
    );
    
    if (response.data.code === 0) {
        return response.data.tenant_access_token;
    }
    throw new Error(`获取 token 失败：${response.data.msg}`);
}

/**
 * 上传单个文件到多维表格
 */
async function uploadFileToBitable(filePath, fileName, appToken) {
    const token = await getTenantAccessToken();
    
    console.log('[附件上传] 开始上传文件:', fileName);
    console.log('[附件上传] 多维表格 App Token:', appToken);
    
    // 读取文件
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;
    console.log('[附件上传] 文件大小:', fileSize, 'bytes');
    
    // 创建 FormData
    const form = new FormData();
    
    form.append('file_name', fileName);
    form.append('parent_type', 'bitable_file');
    form.append('parent_node', appToken);
    form.append('size', fileSize.toString());
    
    // 上传文件 - 使用 Buffer 并指定正确的 filename
    const fileItem = {
        value: fileBuffer,
        options: {
            filename: fileName,
            contentType: 'application/octet-stream'
        }
    };
    form.append('file', fileItem.value, fileItem.options);
    
    const uploadUrl = 'https://open.feishu.cn/open-apis/drive/v1/medias/upload_all';
    
    try {
        const headers = form.getHeaders();
        
        // 关键：在 Content-Type 中指定 charset=utf-8
        const contentType = headers['content-type'];
        headers['content-type'] = contentType.replace('multipart/form-data', 'multipart/form-data; charset=utf-8');
        
        const response = await axios.post(uploadUrl, form, {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...headers
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        
        console.log('[附件上传] 响应状态码:', response.status);
        console.log('[附件上传] 响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data.code === 0) {
            return {
                fileToken: response.data.data.file_token,
                fileName: fileName
            };
        }
        
        throw new Error(response.data.msg || '上传失败');
        
    } catch (error) {
        console.error('[附件上传] 错误详情:');
        console.error('  状态码:', error.response?.status);
        console.error('  错误代码:', error.response?.data?.code);
        console.error('  错误消息:', error.response?.data?.msg);
        throw error;
    }
}

/**
 * 上传多个文件并创建记录
 */
async function uploadFilesAndCreateRecord(appToken, tableId, recordData, files) {
    const token = await getTenantAccessToken();
    
    console.log('[附件上传] 开始上传', files.length, '个文件');
    
    // 上传所有文件
    const attachmentList = [];
    
    for (const file of files) {
        const uploadResult = await uploadFileToBitable(file.path, file.originalname, appToken);
        
        attachmentList.push({
            file_token: uploadResult.fileToken,
            name: uploadResult.fileName
        });
        
        console.log('[附件上传] 文件上传成功:', file.originalname);
    }
    
    // 准备记录数据
    const fields = {
        ...recordData,
        '附件文件': attachmentList
    };
    
    // 创建记录
    const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;
    
    console.log('[附件上传] 正在创建记录...');
    const response = await axios.post(url, {
        fields: fields
    }, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (response.data.code !== 0) {
        throw new Error(`创建记录失败：${response.data.msg}`);
    }
    
    console.log('[附件上传] 记录创建成功:', response.data.data.record?.id || response.data.data.record?.record_id);
    
    return response.data.data.record?.id || response.data.data.record?.record_id;
}

module.exports = {
    getTenantAccessToken,
    uploadFileToBitable,
    uploadFilesAndCreateRecord
};
