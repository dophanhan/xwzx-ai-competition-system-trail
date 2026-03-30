#!/bin/bash
# 阿里云函数计算部署脚本

set -e

echo "🚀 开始部署到阿里云函数计算..."

# 配置
REGION="cn-hangzhou"
SERVICE_NAME="ai-compfunction"
FUNCTION_NAME="ai-compfunction"
ZIP_FILE="./backend-deploy.zip"

# 检查 ZIP 文件是否存在
if [ ! -f "$ZIP_FILE" ]; then
    echo "❌ 错误：找不到部署包 $ZIP_FILE"
    echo "请先运行：cd backend && npm install --production"
    exit 1
fi

# 获取阿里云凭证（从环境变量或配置文件）
if [ -z "$ALIYUN_ACCESS_KEY_ID" ] || [ -z "$ALIYUN_ACCESS_KEY_SECRET" ]; then
    echo "⚠️  未配置阿里云凭证，请手动部署"
    echo ""
    echo "部署步骤："
    echo "1. 登录阿里云函数计算控制台："
    echo "   https://fcnext.console.aliyun.com/"
    echo ""
    echo "2. 进入服务：$SERVICE_NAME"
    echo ""
    echo "3. 点击函数：$FUNCTION_NAME"
    echo ""
    echo "4. 点击'代码'标签页"
    echo ""
    echo "5. 点击'上传 ZIP 包'"
    echo "   选择文件：$ZIP_FILE"
    echo ""
    echo "6. 点击'保存并部署'"
    echo ""
    exit 1
fi

# 使用阿里云 CLI 更新函数
echo "📦 上传代码到阿里云函数计算..."

aliyun fc function update \
    --region $REGION \
    --service-name $SERVICE_NAME \
    --function-name $FUNCTION_NAME \
    --code-file $ZIP_FILE

echo "✅ 部署完成！"
echo ""
echo "📊 函数信息："
echo "   区域：$REGION"
echo "   服务：$SERVICE_NAME"
echo "   函数：$FUNCTION_NAME"
echo "   URL: https://$FUNCTION_NAME-tgjkehyvsz.$REGION.fcapp.run"
echo ""
