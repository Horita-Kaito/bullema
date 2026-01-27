#
# bullema - PHP-FPM イメージ (本番用)
#
# ベース: php:8.4-fpm-alpine (軽量)
# Laravel に必要な拡張機能をインストール
#

FROM php:8.4-fpm-alpine

# 必要なパッケージをインストール
RUN apk add --no-cache \
    bash \
    git \
    curl \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    libxml2-dev \
    mysql-client

# PHP 拡張機能をインストール
# - pdo_mysql: MySQL接続
# - intl: 国際化 (日付フォーマット等)
# - mbstring: マルチバイト文字列
# - xml: XML処理
# - opcache: パフォーマンス最適化
RUN docker-php-ext-install -j1 \
    pdo_mysql \
    intl \
    mbstring \
    xml \
    opcache

# Composer をコピー
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www
