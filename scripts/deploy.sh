#!/usr/bin/env bash
set -Eeuo pipefail

#############################################
# bullema deploy script
#
# 使い方:
#   ./scripts/deploy.sh          # 通常デプロイ
#   ./scripts/deploy.sh --build  # Dockerfile変更時（イメージ再ビルド）
#
# CIから呼び出される前提:
#   - コードは既に転送済み
#   - vendor/ は既にインストール済み
#   - public/build/ は既にビルド済み
#
# このスクリプトの役割:
#   .env設定 → docker compose → artisan tasks
#############################################

# オプション解析
BUILD_IMAGE=false
for arg in "$@"; do
  case $arg in
    --build) BUILD_IMAGE=true ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
APP_ROOT="$(dirname "$REPO_DIR")"
DATA_DIR="${APP_ROOT}/data"
LOG_DIR="${APP_ROOT}/logs"

COMPOSE_FILE="${REPO_DIR}/docker/docker-compose.prod.yml"
ENV_FILE="${DATA_DIR}/.env"
LOG_FILE="${LOG_DIR}/deploy_$(date +%Y%m%d_%H%M%S).log"

mkdir -p "$LOG_DIR"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "==> Deploy start: bullema"
echo "==> Build image: ${BUILD_IMAGE}"
echo "==> Log: ${LOG_FILE}"

trap 'echo "!! Deploy failed at line $LINENO. Check log: $LOG_FILE"' ERR

# コマンド存在チェック
command -v docker >/dev/null 2>&1 || { echo "!! Required command not found: docker"; exit 1; }

# ディレクトリ・ファイル存在チェック
[ -d "$REPO_DIR" ] || { echo "!! Repo dir not found: $REPO_DIR"; exit 1; }
[ -f "$COMPOSE_FILE" ] || { echo "!! Compose file not found: $COMPOSE_FILE"; exit 1; }
[ -f "$ENV_FILE" ] || { echo "!! .env not found: $ENV_FILE"; exit 1; }
[ -d "${REPO_DIR}/vendor" ] || { echo "!! vendor/ not found (CI should have installed it)"; exit 1; }
[ -f "${REPO_DIR}/public/build/manifest.json" ] || { echo "!! Vite manifest not found (CI should have built it)"; exit 1; }

docker info >/dev/null 2>&1 || { echo "!! docker is not available"; exit 1; }

# ----------------------------------------------------------
# 1. .env 設定
# ----------------------------------------------------------
echo ""
echo "==> [1/4] .env setup"

# data/.env を repo/.env にコピー
cp "$ENV_FILE" "${REPO_DIR}/.env"
echo "--> Copied .env from data/"

# 必須項目チェック
missing=0
for k in APP_KEY APP_ENV APP_URL DB_HOST DB_DATABASE DB_USERNAME DB_PASSWORD; do
  if ! grep -qE "^${k}=" "${REPO_DIR}/.env"; then
    echo "!! Missing env: ${k}"
    missing=1
  fi
done
[ "$missing" -eq 1 ] && { echo "!! Fix data/.env then re-run deploy."; exit 1; }

# ----------------------------------------------------------
# 2. Docker
# ----------------------------------------------------------
echo ""
echo "==> [2/4] docker compose"
cd "$REPO_DIR"

# Docker Compose の変数展開用に必要な環境変数をエクスポート
# (env_file はコンテナ内用であり、compose ファイルの ${VAR} 展開には効かない)
export DB_DATABASE DB_USERNAME DB_PASSWORD DB_ROOT_PASSWORD
eval "$(grep -E '^(DB_DATABASE|DB_USERNAME|DB_PASSWORD|DB_ROOT_PASSWORD)=' "${REPO_DIR}/.env")"

PROJECT_NAME="bullema"

if [ "$BUILD_IMAGE" = true ]; then
  echo "--> Building images..."
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" build
fi
# MySQLは維持、nginx/appは強制再作成（ボリュームマウント更新のため）
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d mysql
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" up -d --force-recreate app nginx

# ストレージ権限修正（www-dataが書き込めるように）
echo "--> Fixing storage permissions..."
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T app chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache
docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T app chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# ----------------------------------------------------------
# 3. MySQL 接続待ち
# ----------------------------------------------------------
echo ""
echo "==> [3/4] wait mysql ready (max 60s)"
timeout=60
start_ts="$(date +%s)"
while true; do
  if docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T app php -r 'exit((@fsockopen(getenv("DB_HOST") ?: "mysql", 3306, $e, $s, 1)) ? 0 : 1);' 2>/dev/null; then
    echo "==> MySQL is reachable"
    break
  fi
  elapsed=$(( $(date +%s) - start_ts ))
  [ "$elapsed" -ge "$timeout" ] && { echo "!! MySQL not reachable within ${timeout}s"; exit 1; }
  echo "waiting mysql... (${elapsed}s)"
  sleep 2
done

# ----------------------------------------------------------
# 4. Artisan tasks
# ----------------------------------------------------------
echo ""
echo "==> [4/4] artisan tasks"

for cmd in \
  "php artisan migrate --force" \
  "php artisan config:clear" \
  "php artisan config:cache" \
  "php artisan route:cache" \
  "php artisan view:clear"
do
  echo "--> $cmd"
  docker compose -p "$PROJECT_NAME" -f "$COMPOSE_FILE" exec -T app sh -lc "$cmd"
done

# ----------------------------------------------------------
# Health check
# ----------------------------------------------------------
echo ""
echo "==> health check"
code="$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/ || true)"
echo "==> HTTP status: $code"
if [ "$code" != "200" ] && [ "$code" != "301" ] && [ "$code" != "302" ] && [ "$code" != "308" ]; then
  echo "!! Unexpected status: $code"
  exit 1
fi

echo ""
echo "============================================"
echo "  Deploy finished successfully!"
echo "  Log: $LOG_FILE"
echo "============================================"
