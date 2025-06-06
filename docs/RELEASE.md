# 版本发布指南

本文档说明如何发布 DNF Admin 的新版本，包括语义化版本控制、自动化构建和发布流程。

## 📋 目录

- [版本控制策略](#版本控制策略)
- [发布流程](#发布流程)
- [自动化构建](#自动化构建)
- [版本标签规范](#版本标签规范)
- [发布检查清单](#发布检查清单)

## 📊 版本控制策略

### 语义化版本控制 (SemVer)

我们遵循 [语义化版本控制 2.0.0](https://semver.org/lang/zh-CN/) 规范：

```
主版本号.次版本号.修订号 (MAJOR.MINOR.PATCH)
```

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 版本示例

- `v1.0.0` - 首个稳定版本
- `v1.1.0` - 新增功能
- `v1.1.1` - Bug 修复
- `v2.0.0` - 重大更新，可能包含破坏性变更

### 预发布版本

- `v1.1.0-alpha.1` - Alpha 版本
- `v1.1.0-beta.1` - Beta 版本
- `v1.1.0-rc.1` - Release Candidate

## 🚀 发布流程

### 1. 准备发布

#### 更新版本号

1. **更新 pom.xml**
   ```xml
   <version>1.1.0</version>
   ```

2. **更新 package.json**
   ```json
   {
     "version": "1.1.0"
   }
   ```

3. **更新 README.md**
   - 更新版本徽章
   - 更新示例中的版本号

#### 更新变更日志

创建或更新 `CHANGELOG.md`：

```markdown
# 变更日志

## [1.1.0] - 2024-01-15

### 新增
- 多架构 Docker 支持 (ARM64/AMD64)
- GitHub Actions 自动化部署
- 健康检查端点

### 改进
- 优化 Docker 镜像大小
- 提升构建性能

### 修复
- 修复内存泄漏问题
- 修复配置文件加载错误
```

### 2. 代码审查

1. **创建 Pull Request**
   ```bash
   git checkout -b release/v1.1.0
   git add .
   git commit -m "chore: prepare release v1.1.0"
   git push origin release/v1.1.0
   ```

2. **代码审查**
   - 确保所有测试通过
   - 代码质量检查
   - 安全扫描

3. **合并到主分支**
   ```bash
   git checkout main
   git merge release/v1.1.0
   git push origin main
   ```

### 3. 创建发布标签

```bash
# 创建带注释的标签
git tag -a v1.1.0 -m "Release version 1.1.0

新增功能:
- 多架构 Docker 支持
- GitHub Actions 自动化部署

改进:
- 优化 Docker 镜像大小
- 提升构建性能"

# 推送标签到远程仓库
git push origin v1.1.0
```

### 4. 自动化构建触发

推送标签后，GitHub Actions 将自动：

1. 构建多架构 Docker 镜像
2. 推送到 Docker Hub
3. 创建 GitHub Release
4. 生成构建报告

## 🤖 自动化构建

### GitHub Actions 工作流

当推送版本标签时，会触发以下流程：

```yaml
name: Build and Push Multi-Architecture Docker Images

on:
  push:
    tags:
      - 'v*.*.*'  # 匹配 v1.0.0 格式的标签
```

### 构建产物

每次发布会生成：

1. **Docker 镜像**
   - `your-dockerhub-username/dnf-admin:v1.1.0`
   - `your-dockerhub-username/dnf-admin:latest`
   - 支持 `linux/amd64` 和 `linux/arm64`

2. **GitHub Release**
   - 自动生成的发布说明
   - 构建日志和报告

### 镜像标签策略

| 标签类型 | 示例 | 说明 |
|----------|------|------|
| 完整版本 | `v1.1.0` | 精确版本号 |
| 主次版本 | `v1.1` | 最新修订版 |
| 主版本 | `v1` | 最新次版本 |
| Latest | `latest` | 最新稳定版 |

## 🏷️ 版本标签规范

### 标签命名规则

- ✅ `v1.0.0` - 正确格式
- ✅ `v1.1.0-beta.1` - 预发布版本
- ❌ `1.0.0` - 缺少 'v' 前缀
- ❌ `v1.0` - 缺少修订号

### 创建标签

#### 轻量标签（不推荐）
```bash
git tag v1.1.0
```

#### 带注释标签（推荐）
```bash
git tag -a v1.1.0 -m "Release version 1.1.0"
```

#### 签名标签（高安全要求）
```bash
git tag -s v1.1.0 -m "Release version 1.1.0"
```

### 标签管理

#### 查看标签
```bash
# 列出所有标签
git tag

# 查看特定标签信息
git show v1.1.0

# 按模式过滤
git tag -l "v1.*"
```

#### 删除标签
```bash
# 删除本地标签
git tag -d v1.1.0

# 删除远程标签
git push origin --delete v1.1.0
```

## ✅ 发布检查清单

### 发布前检查

- [ ] 所有测试通过
- [ ] 代码审查完成
- [ ] 文档更新完成
- [ ] 版本号已更新
- [ ] 变更日志已更新
- [ ] 安全扫描通过
- [ ] 性能测试通过

### 发布过程检查

- [ ] 标签创建成功
- [ ] GitHub Actions 构建成功
- [ ] Docker 镜像推送成功
- [ ] 多架构支持验证
- [ ] GitHub Release 创建成功

### 发布后检查

- [ ] 镜像可正常拉取
- [ ] 应用可正常启动
- [ ] 健康检查通过
- [ ] 文档链接有效
- [ ] 社区通知发送

## 🔄 回滚流程

如果发现发布有问题，可以按以下步骤回滚：

### 1. 快速回滚

```bash
# 回滚到上一个稳定版本
docker pull your-dockerhub-username/dnf-admin:v1.0.0
docker-compose down
docker-compose up -d
```

### 2. 标签回滚

```bash
# 删除有问题的标签
git tag -d v1.1.0
git push origin --delete v1.1.0

# 重新创建修复后的标签
git tag -a v1.1.0 -m "Release version 1.1.0 (hotfix)"
git push origin v1.1.0
```

### 3. 热修复发布

```bash
# 创建热修复分支
git checkout -b hotfix/v1.1.1

# 修复问题并提交
git commit -m "fix: critical bug fix"

# 发布热修复版本
git tag -a v1.1.1 -m "Hotfix version 1.1.1"
git push origin v1.1.1
```

## 📊 发布指标

### 跟踪指标

- 构建时间
- 镜像大小
- 下载次数
- 部署成功率
- 回滚频率

### 监控工具

- GitHub Actions 构建报告
- Docker Hub 下载统计
- 应用性能监控
- 错误追踪系统

## 📞 发布支持

### 发布团队

- **发布经理**: 负责整体发布流程
- **开发团队**: 代码开发和测试
- **运维团队**: 部署和监控
- **QA 团队**: 质量保证

### 沟通渠道

- **发布通知**: GitHub Releases
- **技术讨论**: GitHub Issues
- **即时沟通**: 交流群 154213998
- **紧急联系**: 防失联频道

## 🎯 最佳实践

1. **小步快跑**: 频繁发布小版本
2. **自动化优先**: 减少人工操作
3. **测试驱动**: 确保质量
4. **文档同步**: 保持文档更新
5. **监控告警**: 及时发现问题
6. **用户反馈**: 收集使用体验
