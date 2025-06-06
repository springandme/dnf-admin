# DNF Admin 部署指南

本文档详细介绍了 DNF Admin 的各种部署方式和配置选项。

## 📋 目录

- [系统要求](#系统要求)
- [Docker 部署](#docker-部署)
- [多架构支持](#多架构支持)
- [环境配置](#环境配置)
- [监控与日志](#监控与日志)
- [故障排除](#故障排除)

## 🔧 系统要求

### 最低配置
- **CPU**: 2 核心
- **内存**: 4GB RAM
- **存储**: 20GB 可用空间
- **操作系统**: Linux (Ubuntu 20.04+, CentOS 8+, Debian 11+)

### 推荐配置
- **CPU**: 4 核心
- **内存**: 8GB RAM
- **存储**: 50GB SSD
- **网络**: 100Mbps

### 软件依赖
- Docker 20.10+
- Docker Compose 2.0+

## 🐳 Docker 部署

### 快速部署

```bash
# 1. 创建部署目录
mkdir -p /opt/dnf-admin
cd /opt/dnf-admin

# 2. 下载配置文件
wget https://raw.githubusercontent.com/easy-do/dnf-admin/main/docker-compose.yaml

# 3. 配置环境变量
cp docker-compose.yaml docker-compose.prod.yaml
# 编辑配置文件...

# 4. 启动服务
docker-compose -f docker-compose.prod.yaml up -d
```

### 完整部署流程

#### 1. 准备环境

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 创建目录结构

```bash
mkdir -p /opt/dnf-admin/{data,logs,config}
cd /opt/dnf-admin
```

#### 3. 配置文件

创建 `docker-compose.prod.yaml`:

```yaml
version: "3.8"

services:
  dnf-admin:
    image: your-dockerhub-username/dnf-admin:latest
    container_name: dnf-admin
    restart: unless-stopped
    ports:
      - "8888:8888"
    environment:
      - TZ=Asia/Shanghai
      - SPRING_PROFILES_ACTIVE=prod
      - JAVA_OPTS=-Xmx4g -Xms1g -XX:+UseG1GC
      - MYSQL_HOST=mysql
      - MYSQL_PORT=3306
      - MYSQL_DATABASE=dnf_admin
      - MYSQL_USERNAME=dnf_admin
      - MYSQL_PASSWORD=your_secure_password
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    depends_on:
      - mysql
    networks:
      - dnf-network

  mysql:
    image: mysql:8.0
    container_name: dnf-mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=your_root_password
      - MYSQL_DATABASE=dnf_admin
      - MYSQL_USER=dnf_admin
      - MYSQL_PASSWORD=your_secure_password
    volumes:
      - ./data/mysql:/var/lib/mysql
    networks:
      - dnf-network

networks:
  dnf-network:
    driver: bridge
```

#### 4. 启动服务

```bash
# 启动服务
docker-compose -f docker-compose.prod.yaml up -d

# 查看日志
docker-compose -f docker-compose.prod.yaml logs -f

# 检查服务状态
docker-compose -f docker-compose.prod.yaml ps
```

## 🏗️ 多架构支持

### 支持的架构

- **linux/amd64**: Intel/AMD x86_64 处理器
- **linux/arm64**: ARM64/AArch64 处理器（如 Apple M1/M2, AWS Graviton）

### 架构选择

Docker 会自动选择适合您系统的镜像架构：

```bash
# 查看镜像架构信息
docker manifest inspect your-dockerhub-username/dnf-admin:latest

# 强制指定架构（如需要）
docker pull --platform linux/arm64 your-dockerhub-username/dnf-admin:latest
```

### ARM64 部署注意事项

在 ARM64 系统上部署时，请注意：

1. **性能优化**: ARM64 处理器可能需要不同的 JVM 参数
2. **依赖兼容性**: 确保所有依赖都支持 ARM64
3. **监控调整**: 某些监控工具可能需要 ARM64 版本

## ⚙️ 环境配置

### 核心环境变量

| 变量名 | 默认值 | 说明 | 示例 |
|--------|--------|------|------|
| `TZ` | `Asia/Shanghai` | 时区设置 | `Asia/Shanghai` |
| `JAVA_OPTS` | `-Xmx1g -Xms512m` | JVM 参数 | `-Xmx4g -Xms1g` |
| `SPRING_PROFILES_ACTIVE` | `prod` | Spring 配置文件 | `prod,mysql` |

### 数据库配置

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `MYSQL_HOST` | MySQL 主机地址 | `mysql` |
| `MYSQL_PORT` | MySQL 端口 | `3306` |
| `MYSQL_DATABASE` | 数据库名 | `dnf_admin` |
| `MYSQL_USERNAME` | 数据库用户名 | `dnf_admin` |
| `MYSQL_PASSWORD` | 数据库密码 | `secure_password` |

### 性能调优

#### JVM 参数优化

```bash
# 生产环境推荐配置
JAVA_OPTS="-Xmx4g -Xms1g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseContainerSupport"

# 内存受限环境
JAVA_OPTS="-Xmx2g -Xms512m -XX:+UseSerialGC"

# 高并发环境
JAVA_OPTS="-Xmx8g -Xms2g -XX:+UseG1GC -XX:+UnlockExperimentalVMOptions -XX:+UseZGC"
```

## 📊 监控与日志

### 健康检查

```bash
# 检查应用健康状态
curl http://localhost:8888/actuator/health

# 检查详细信息
curl http://localhost:8888/actuator/info
```

### 日志管理

```bash
# 查看应用日志
docker logs -f dnf-admin

# 查看最近 100 行日志
docker logs --tail 100 dnf-admin

# 日志轮转配置
docker-compose.yaml 中添加:
logging:
  driver: "json-file"
  options:
    max-size: "100m"
    max-file: "3"
```

### 监控指标

应用提供以下监控端点：

- `/actuator/health` - 健康检查
- `/actuator/metrics` - 应用指标
- `/actuator/prometheus` - Prometheus 指标

## 🔧 故障排除

### 常见问题

#### 1. 容器启动失败

```bash
# 检查容器状态
docker ps -a

# 查看启动日志
docker logs dnf-admin

# 检查资源使用
docker stats dnf-admin
```

#### 2. 内存不足

```bash
# 调整 JVM 内存参数
JAVA_OPTS="-Xmx2g -Xms512m"

# 检查系统内存
free -h
```

#### 3. 数据库连接失败

```bash
# 检查数据库容器
docker logs dnf-mysql

# 测试数据库连接
docker exec -it dnf-mysql mysql -u root -p

# 检查网络连接
docker network ls
docker network inspect dnf-admin_dnf-network
```

#### 4. 端口冲突

```bash
# 检查端口占用
netstat -tulpn | grep 8888

# 修改端口映射
ports:
  - "18888:8888"  # 使用其他端口
```

### 性能问题诊断

```bash
# 查看 JVM 内存使用
curl http://localhost:8888/actuator/metrics/jvm.memory.used

# 查看 GC 信息
curl http://localhost:8888/actuator/metrics/jvm.gc.pause

# 查看线程信息
curl http://localhost:8888/actuator/threaddump
```

### 数据备份与恢复

```bash
# 备份数据
docker exec dnf-mysql mysqldump -u root -p dnf_admin > backup.sql

# 恢复数据
docker exec -i dnf-mysql mysql -u root -p dnf_admin < backup.sql
```

## 📞 获取帮助

如果遇到问题，请：

1. 查看 [FAQ](FAQ.md)
2. 搜索 [Issues](https://github.com/easy-do/dnf-admin/issues)
3. 提交新的 [Issue](https://github.com/easy-do/dnf-admin/issues/new)
4. 加入交流群：154213998
