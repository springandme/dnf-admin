#!/bin/bash

# DNF Admin 多架构构建脚本
# 用于本地测试多架构 Docker 镜像构建

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 和 buildx
check_prerequisites() {
    log_info "检查构建环境..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装或不在 PATH 中"
        exit 1
    fi
    
    if ! docker buildx version &> /dev/null; then
        log_error "Docker Buildx 未安装或不可用"
        exit 1
    fi
    
    log_success "构建环境检查通过"
}

# 创建 buildx builder
setup_builder() {
    log_info "设置多架构构建器..."
    
    # 创建新的 builder 实例（如果不存在）
    if ! docker buildx ls | grep -q "dnf-admin-builder"; then
        docker buildx create --name dnf-admin-builder --driver docker-container --bootstrap
        log_success "创建构建器 dnf-admin-builder"
    else
        log_info "构建器 dnf-admin-builder 已存在"
    fi
    
    # 使用构建器
    docker buildx use dnf-admin-builder
    log_success "切换到构建器 dnf-admin-builder"
}

# 构建多架构镜像
build_image() {
    local image_name=${1:-"dnf-admin"}
    local tag=${2:-"latest"}
    local push=${3:-false}
    
    log_info "开始构建多架构镜像: ${image_name}:${tag}"
    
    local build_args=""
    if [ "$push" = true ]; then
        build_args="--push"
        log_info "将推送镜像到仓库"
    else
        build_args="--load"
        log_warning "仅构建本地镜像（不推送）"
    fi
    
    # 构建命令
    docker buildx build \
        --platform linux/amd64,linux/arm64 \
        --tag "${image_name}:${tag}" \
        --tag "${image_name}:latest" \
        ${build_args} \
        --cache-from type=local,src=/tmp/.buildx-cache \
        --cache-to type=local,dest=/tmp/.buildx-cache-new,mode=max \
        .
    
    # 更新缓存
    if [ -d "/tmp/.buildx-cache-new" ]; then
        rm -rf /tmp/.buildx-cache
        mv /tmp/.buildx-cache-new /tmp/.buildx-cache
    fi
    
    log_success "镜像构建完成: ${image_name}:${tag}"
}

# 测试镜像
test_image() {
    local image_name=${1:-"dnf-admin:latest"}
    
    log_info "测试镜像: ${image_name}"
    
    # 检查镜像是否存在
    if ! docker image inspect "${image_name}" &> /dev/null; then
        log_error "镜像 ${image_name} 不存在"
        return 1
    fi
    
    # 运行容器测试
    log_info "启动测试容器..."
    local container_id=$(docker run -d --rm -p 18888:8888 "${image_name}")
    
    # 等待应用启动
    log_info "等待应用启动..."
    sleep 30
    
    # 健康检查
    if curl -f http://localhost:18888/actuator/health &> /dev/null; then
        log_success "健康检查通过"
        docker stop "${container_id}"
        return 0
    else
        log_error "健康检查失败"
        docker logs "${container_id}"
        docker stop "${container_id}"
        return 1
    fi
}

# 清理资源
cleanup() {
    log_info "清理构建资源..."
    
    # 清理构建缓存
    docker buildx prune -f
    
    # 清理悬空镜像
    docker image prune -f
    
    log_success "清理完成"
}

# 显示帮助信息
show_help() {
    echo "DNF Admin 多架构构建脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -n, --name NAME     镜像名称 (默认: dnf-admin)"
    echo "  -t, --tag TAG       镜像标签 (默认: latest)"
    echo "  -p, --push          推送到仓库"
    echo "  --test              构建后测试镜像"
    echo "  --cleanup           清理构建资源"
    echo "  -h, --help          显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                           # 构建本地镜像"
    echo "  $0 -n myrepo/dnf-admin -t v1.0.0 -p  # 构建并推送"
    echo "  $0 --test                    # 构建并测试"
}

# 主函数
main() {
    local image_name="dnf-admin"
    local tag="latest"
    local push=false
    local test=false
    local cleanup_only=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -n|--name)
                image_name="$2"
                shift 2
                ;;
            -t|--tag)
                tag="$2"
                shift 2
                ;;
            -p|--push)
                push=true
                shift
                ;;
            --test)
                test=true
                shift
                ;;
            --cleanup)
                cleanup_only=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 仅清理
    if [ "$cleanup_only" = true ]; then
        cleanup
        exit 0
    fi
    
    log_info "开始 DNF Admin 多架构构建流程"
    
    # 执行构建流程
    check_prerequisites
    setup_builder
    build_image "$image_name" "$tag" "$push"
    
    # 测试镜像
    if [ "$test" = true ] && [ "$push" = false ]; then
        test_image "${image_name}:${tag}"
    fi
    
    log_success "构建流程完成！"
    
    # 显示使用说明
    echo ""
    log_info "使用说明:"
    echo "  docker run -d -p 8888:8888 ${image_name}:${tag}"
}

# 执行主函数
main "$@"
