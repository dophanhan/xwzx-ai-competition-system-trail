# 🚀 后端部署到阿里云函数计算

## 📦 部署包已准备

**文件位置**: `/home/admin/openclaw/workspace/xwzx-ai-competition-system-trail/backend-deploy.zip`
**文件大小**: ~4.2MB

---

## 🔧 部署步骤

### 方法一：阿里云控制台（推荐）

1. **登录阿里云函数计算控制台**
   ```
   https://fcnext.console.aliyun.com/
   ```

2. **进入服务**
   - 服务名称：`ai-compfunction`
   - 地域：`华东 1（杭州）`

3. **选择函数**
   - 函数名称：`ai-compfunction`

4. **上传代码**
   - 点击"代码"标签页
   - 点击"上传 ZIP 包"按钮
   - 选择文件：`backend-deploy.zip`
   - 点击"保存并部署"

5. **等待部署完成**
   - 大约需要 1-2 分钟
   - 状态变为"部署成功"即可

6. **测试验证**
   ```bash
   # 健康检查
   curl https://ai-compfunction-tgjkehyvsz.cn-hangzhou.fcapp.run/api/health
   
   # 测试提交（JSON 格式）
   curl -X POST https://ai-compfunction-tgjkehyvsz.cn-hangzhou.fcapp.run/api/submission \
     -H "Content-Type: application/json" \
     -d '{"teamName":"测试","projectName":"AI 系统","teamRoles":"开发","projectDescription":"测试","projectLink":"https://test.com","submittedAt":"2026-03-30T10:00:00.000Z"}'
   ```

---

### 方法二：使用 Funcraft CLI

```bash
# 1. 配置阿里云凭证
fun config

# 需要输入:
# - Account ID
# - Access Key ID
# - Access Key Secret
# - Default Region: cn-hangzhou

# 2. 部署
cd backend
fun deploy

# 或者使用部署脚本
cd ..
chmod +x deploy-to-aliyun.sh
./deploy-to-aliyun.sh
```

---

## 📋 部署前检查

### 1. 环境变量配置

确保阿里云函数计算已配置以下环境变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `FEISHU_APP_ID` | 飞书应用 ID | `cli_xxxxx` |
| `FEISHU_APP_SECRET` | 飞书应用密钥 | `xxxxx` |
| `FEISHU_BITABLE_APP_TOKEN` | 多维表格应用 Token | `xxxxx` |
| `FEISHU_REGISTRATION_TABLE_ID` | 报名表表格 ID | `tbltDHBoAs72cFnh` |
| `FEISHU_SUBMISSION_TABLE_ID` | 提交表表格 ID | `tblxYsQVComD9wRW` |
| `FEISHU_BOT_WEBHOOK` | 飞书机器人 Webhook（可选） | `https://...` |

### 2. 飞书应用权限

确保飞书应用已开通以下权限：
- ✅ 获取租户 access_token
- ✅ 多维表格数据读写
- ✅ 发送消息到群组
- ✅ 云文档权限（用于文件上传）

---

## 🔍 故障排查

### 问题 1：部署后仍然报错

**症状**: 提交时仍然报 `Unexpected number in JSON`

**解决方案**:
1. 确认 ZIP 包已正确上传
2. 检查函数日志：
   ```bash
   fun logs ai-compfunction ai-compfunction --tail
   ```
3. 确认环境变量已配置

### 问题 2：文件上传失败

**症状**: 提交时报飞书 API 错误

**解决方案**:
1. 检查飞书应用是否有云文档权限
2. 检查 `FEISHU_BITABLE_APP_TOKEN` 是否正确
3. 查看后端日志中的详细错误信息

### 问题 3：健康检查失败

**症状**: `/api/health` 返回 500 错误

**解决方案**:
1. 检查函数是否成功启动
2. 查看函数日志
3. 确认依赖包已正确安装

---

## 📊 部署验证

部署完成后，按以下顺序验证：

### 1. 健康检查
```bash
curl https://ai-compfunction-tgjkehyvsz.cn-hangzhou.fcapp.run/api/health
# 应返回：{"status":"ok","timestamp":...}
```

### 2. 测试 JSON 提交
```bash
curl -X POST https://ai-compfunction-tgjkehyvsz.cn-hangzhou.fcapp.run/api/submission \
  -H "Content-Type: application/json" \
  -d '{"teamName":"测试队伍","projectName":"AI 系统","teamRoles":"开发","projectDescription":"测试","projectLink":"https://test.com","submittedAt":"2026-03-30T10:00:00.000Z"}'
# 应返回：{"success":true,"message":"提交成功"}
```

### 3. 测试文件上传（可选）
```bash
# 创建一个测试文件
echo "test" > test.txt

# 使用 FormData 提交
curl -X POST https://ai-compfunction-tgjkehyvsz.cn-hangzhou.fcapp.run/api/submission \
  -F "teamName=测试队伍" \
  -F "projectName=AI 系统" \
  -F "teamRoles=开发" \
  -F "projectDescription=测试" \
  -F "projectLink=https://test.com" \
  -F "submittedAt=2026-03-30T10:00:00.000Z" \
  -F "files=@test.txt"
# 应返回：{"success":true,"message":"提交成功"}
```

### 4. 前端测试
1. 打开前端页面
2. 填写表单
3. 上传文件（可选）
4. 点击提交
5. 应看到成功提示

---

## 📝 注意事项

1. **部署包大小**: 当前 ZIP 包约 4.2MB，在阿里云函数计算限制内（50MB）
2. **冷启动**: 首次调用可能需要 2-3 秒启动时间
3. **超时设置**: 建议设置函数超时时间为 30 秒
4. **内存配置**: 建议配置 512MB 内存
5. **日志查看**: 可在阿里云控制台查看函数执行日志

---

## 🔗 相关链接

- 阿里云函数计算控制台：https://fcnext.console.aliyun.com/
- 阿里云函数计算文档：https://help.aliyun.com/product/50980.html
- Funcraft 文档：https://github.com/alibaba/funcraft

---

**部署完成后，前端文件上传功能将恢复正常！** ✅
