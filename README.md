# DNF Admin

[![Docker Build](https://github.com/easy-do/dnf-admin/actions/workflows/docker-build-and-push.yml/badge.svg)](https://github.com/easy-do/dnf-admin/actions/workflows/docker-build-and-push.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/your-dockerhub-username/dnf-admin)](https://hub.docker.com/r/your-dockerhub-username/dnf-admin)
[![License](https://img.shields.io/github/license/easy-do/dnf-admin)](LICENSE)

## 📖 介绍

DNF Admin 是一个功能强大的勇士游戏后台管理系统，支持多架构部署。

## 🏗️ 软件架构

- **服务端**: Spring Boot 3.x
  - JDK 17
  - Maven 3.9+
- **前端**: Ant Design Pro
  - Node.js 16.20.2
  - React + TypeScript
- **插件**: Frida
- **容器化**: Docker + Docker Compose

## 🚀 快速开始

### 使用 Docker（推荐）

#### 单机部署

```bash
# 拉取最新镜像
docker pull your-dockerhub-username/dnf-admin:latest

# 运行容器
docker run -d \
  --name dnf-admin \
  -p 8888:8888 \
  -e TZ=Asia/Shanghai \
  -e JAVA_OPTS="-Xmx2g -Xms512m" \
  your-dockerhub-username/dnf-admin:latest
```

#### 使用 Docker Compose

```bash
# 克隆仓库
git clone https://github.com/easy-do/dnf-admin.git
cd dnf-admin

# 启动服务
docker-compose up -d
```

### 多架构支持

本项目支持以下架构：
- `linux/amd64` (x86_64)
- `linux/arm64` (ARM64/AArch64)

Docker 会自动选择适合您系统架构的镜像。

## 🛠️ 开发环境

### 前置要求

- JDK 17+
- Node.js 16.20.2
- Maven 3.9+
- Docker & Docker Compose

### 本地开发

1. **克隆项目**
   ```bash
   git clone https://github.com/easy-do/dnf-admin.git
   cd dnf-admin
   ```

2. **后端开发**
   ```bash
   cd be
   mvn spring-boot:run
   ```

3. **前端开发**
   ```bash
   cd antd
   npm install
   npm start
   ```

### 构建 Docker 镜像

#### 本地构建

```bash
# 使用构建脚本（推荐）
./scripts/build-multiarch.sh

# 或手动构建
docker buildx build --platform linux/amd64,linux/arm64 -t dnf-admin:latest .
```

#### 测试构建

```bash
# 构建并测试
./scripts/build-multiarch.sh --test

# 开发环境测试
docker-compose -f docker-compose.dev.yml up
```

## 📦 部署指南

### 生产环境部署

1. **配置环境变量**
   ```bash
   cp docker-compose.yaml docker-compose.prod.yaml
   # 编辑 docker-compose.prod.yaml 中的环境变量
   ```

2. **启动服务**
   ```bash
   docker-compose -f docker-compose.prod.yaml up -d
   ```

### 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `TZ` | `Asia/Shanghai` | 时区设置 |
| `JAVA_OPTS` | `-Xmx1g -Xms512m` | JVM 参数 |
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring 配置文件 |
| `MYSQL_HOST` | `localhost` | MySQL 主机地址 |
| `MYSQL_PORT` | `3306` | MySQL 端口 |

## 🔄 CI/CD

### GitHub Actions

项目配置了自动化 CI/CD 流程：

1. **触发条件**: 推送语义化版本标签（如 `v1.0.0`）
2. **构建流程**:
   - 多架构 Docker 镜像构建
   - 自动推送到 Docker Hub
   - 生成构建报告

### 发布新版本

```bash
# 创建并推送标签
git tag v1.0.0
git push origin v1.0.0
```

### Docker Hub 配置

在 GitHub 仓库设置中添加以下 Secrets：

- `DOCKERHUB_USERNAME`: Docker Hub 用户名
- `DOCKERHUB_TOKEN`: Docker Hub 访问令牌

## 📚 使用文档

详细文档请访问: http://blog.easydo.plus/

## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📞 反馈与支持

- 🐛 **Bug 报告**: [提交 Issue](https://github.com/easy-do/dnf-admin/issues)
- 💡 **功能建议**: [提交 Issue](https://github.com/easy-do/dnf-admin/issues)
- 💬 **交流群**: 154213998
- 📢 **防失联频道**: https://im.easydo.plus/invite/l_7xH88A

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。
