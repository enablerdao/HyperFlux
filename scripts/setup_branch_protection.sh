#!/bin/bash

# GitHub APIを使用してブランチ保護ルールを設定するスクリプト
# 使用方法: GITHUB_TOKEN=your_token ./setup_branch_protection.sh

# 設定
REPO_OWNER="enablerdao"
REPO_NAME="HyperFlux"
BRANCH="main"

# GitHub APIエンドポイント
API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection"

# トークンチェック
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  echo "Usage: GITHUB_TOKEN=your_token $0"
  exit 1
fi

# ブランチ保護ルールを設定
curl -X PUT $API_URL \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token $GITHUB_TOKEN" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": [
        "Test",
        "Docker Build Test"
      ]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismissal_restrictions": {},
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_approving_review_count": 1
    },
    "restrictions": null
  }'

echo -e "\nブランチ保護ルールが設定されました。"
echo "以下の条件が適用されます："
echo "- プルリクエストのマージ前にすべてのステータスチェック（テスト）が成功する必要があります"
echo "- プルリクエストのマージ前に少なくとも1人のレビュー承認が必要です"
echo "- 管理者もこれらのルールに従う必要があります"