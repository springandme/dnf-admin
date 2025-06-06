# 多阶段构建 - 前端构建阶段
FROM node:16.20.2-alpine AS frontend-builder

WORKDIR /app/frontend

# 复制前端源码
COPY antd/package*.json ./
RUN npm ci --only=production --silent

COPY antd/ ./
RUN npm run build

# 多阶段构建 - 后端构建阶段
FROM maven:3.9.4-eclipse-temurin-17 AS backend-builder

WORKDIR /app/backend

# 复制后端源码
COPY be/pom.xml ./
RUN mvn dependency:go-offline -B

COPY be/src ./src

# 复制前端构建产物到后端静态资源目录
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static/

# 构建后端应用
RUN mvn clean package -DskipTests -B

# 最终运行阶段 - 使用官方多架构 OpenJDK 镜像
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="hliushi@foxmail.com"
LABEL description="DNF Admin - Multi-architecture support"
LABEL version="1.0.3"

# 设置时区
ENV TZ=Asia/Shanghai
RUN apk add --no-cache tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 创建应用用户
RUN addgroup -g 1000 appgroup && \
    adduser -u 1000 -G appgroup -s /bin/sh -D appuser

# 设置工作目录
WORKDIR /app

# 复制应用 JAR 文件
COPY --from=backend-builder /app/backend/target/app.jar ./app.jar

# 修改文件所有者
RUN chown -R appuser:appgroup /app

# 切换到非 root 用户
USER appuser

# 设置 JVM 参数
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:+UseContainerSupport"
ENV PARAMS=""

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8888/actuator/health || exit 1

# 暴露端口
EXPOSE 8888

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar $PARAMS"]
