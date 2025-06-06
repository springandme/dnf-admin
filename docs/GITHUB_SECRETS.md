# GitHub Secrets 配置指南

本文档详细说明如何配置 GitHub Secrets 以启用自动化 CI/CD 流程。

## 📋 目录

- [什么是 GitHub Secrets](#什么是-github-secrets)
- [必需的 Secrets](#必需的-secrets)
- [配置步骤](#配置步骤)
- [Docker Hub 设置](#docker-hub-设置)
- [验证配置](#验证配置)
- [故障排除](#故障排除)

## 🔐 什么是 GitHub Secrets

GitHub Secrets 是一种安全存储敏感信息（如 API 密钥、密码等）的方式，这些信息可以在 GitHub Actions 工作流中使用，而不会在代码中暴露。

## 📝 必需的 Secrets

为了启用自动化构建和部署，您需要配置以下 Secrets：

| Secret 名称 | 描述 | 示例值 |
|-------------|------|--------|
| `DOCKERHUB_USERNAME` | Docker Hub 用户名 | `your-username` |
| `DOCKERHUB_TOKEN` | Docker Hub 访问令牌 | `dckr_pat_xxxxx` |

## 🛠️ 配置步骤

### 1. 访问仓库设置

1. 打开您的 GitHub 仓库
2. 点击 **Settings** 选项卡
3. 在左侧菜单中找到 **Secrets and variables**
4. 点击 **Actions**

### 2. 添加 Repository Secrets

点击 **New repository secret** 按钮，然后按照以下步骤添加每个 Secret：

#### 添加 DOCKERHUB_USERNAME

1. **Name**: `DOCKERHUB_USERNAME`
2. **Secret**: 输入您的 Docker Hub 用户名
3. 点击 **Add secret**

#### 添加 DOCKERHUB_TOKEN

1. **Name**: `DOCKERHUB_TOKEN`
2. **Secret**: 输入您的 Docker Hub 访问令牌（见下方获取方法）
3. 点击 **Add secret**

## 🐳 Docker Hub 设置

### 创建 Docker Hub 访问令牌

1. **登录 Docker Hub**
   - 访问 [Docker Hub](https://hub.docker.com/)
   - 使用您的账户登录

2. **访问安全设置**
   - 点击右上角的用户头像
   - 选择 **Account Settings**
   - 点击 **Security** 选项卡

3. **创建访问令牌**
   - 点击 **New Access Token**
   - 输入令牌描述：`GitHub Actions - DNF Admin`
   - 选择权限：**Read, Write, Delete**
   - 点击 **Generate**

4. **复制令牌**
   - ⚠️ **重要**: 立即复制生成的令牌，它只会显示一次
   - 将此令牌用作 `DOCKERHUB_TOKEN` 的值

### 创建 Docker Hub 仓库

1. **创建新仓库**
   - 在 Docker Hub 中点击 **Create Repository**
   - 仓库名称：`dnf-admin`
   - 可见性：选择 **Public** 或 **Private**
   - 点击 **Create**

2. **更新配置**
   - 在 GitHub Actions 工作流文件中更新镜像名称
   - 将 `your-dockerhub-username` 替换为您的实际用户名

## ✅ 验证配置

### 1. 检查 Secrets 配置

在仓库的 **Settings > Secrets and variables > Actions** 页面，确认您可以看到：

- ✅ `DOCKERHUB_USERNAME`
- ✅ `DOCKERHUB_TOKEN`

### 2. 测试工作流

1. **创建测试标签**
   ```bash
   git tag v1.0.0-test
   git push origin v1.0.0-test
   ```

2. **查看 Actions 执行**
   - 访问仓库的 **Actions** 选项卡
   - 查看是否有新的工作流运行
   - 检查构建日志是否正常

3. **验证镜像推送**
   - 访问您的 Docker Hub 仓库
   - 确认新镜像已成功推送

## 🔧 故障排除

### 常见错误及解决方案

#### 1. 认证失败

**错误信息**:
```
Error: buildx failed with: ERROR: failed to solve: failed to authorize: failed to fetch anonymous token
```

**解决方案**:
- 检查 `DOCKERHUB_USERNAME` 是否正确
- 确认 `DOCKERHUB_TOKEN` 是有效的访问令牌
- 验证令牌权限包含 **Write** 权限

#### 2. 仓库不存在

**错误信息**:
```
Error: buildx failed with: ERROR: failed to solve: failed to push: repository does not exist
```

**解决方案**:
- 在 Docker Hub 中创建对应的仓库
- 确认仓库名称与工作流中的配置一致

#### 3. 权限不足

**错误信息**:
```
Error: buildx failed with: ERROR: failed to solve: failed to authorize: insufficient_scope
```

**解决方案**:
- 重新生成 Docker Hub 访问令牌
- 确保令牌权限包含 **Read, Write, Delete**

### 调试技巧

#### 1. 启用调试日志

在工作流文件中添加调试步骤：

```yaml
- name: Debug Docker Login
  run: |
    echo "Username: ${{ secrets.DOCKERHUB_USERNAME }}"
    echo "Token length: ${#DOCKERHUB_TOKEN}"
  env:
    DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}
```

#### 2. 测试 Docker 登录

```yaml
- name: Test Docker Login
  run: |
    echo "${{ secrets.DOCKERHUB_TOKEN }}" | docker login -u "${{ secrets.DOCKERHUB_USERNAME }}" --password-stdin
    docker info
```

#### 3. 验证镜像构建

```yaml
- name: Test Image Build
  run: |
    docker buildx build --platform linux/amd64 -t test-image .
    docker images
```

## 🔄 更新 Secrets

### 轮换访问令牌

建议定期更新 Docker Hub 访问令牌：

1. **生成新令牌**
   - 在 Docker Hub 中创建新的访问令牌
   - 复制新令牌

2. **更新 GitHub Secret**
   - 在 GitHub 仓库设置中找到 `DOCKERHUB_TOKEN`
   - 点击 **Update**
   - 输入新的令牌值

3. **删除旧令牌**
   - 在 Docker Hub 中删除旧的访问令牌

### 批量更新

如果您有多个仓库使用相同的 Docker Hub 账户，考虑使用 GitHub Organization Secrets：

1. 在 Organization 设置中添加 Secrets
2. 在仓库中引用 Organization Secrets
3. 一次更新即可影响所有仓库

## 📞 获取帮助

如果在配置过程中遇到问题：

1. 查看 [GitHub Actions 文档](https://docs.github.com/en/actions)
2. 查看 [Docker Hub 文档](https://docs.docker.com/docker-hub/)
3. 提交 [Issue](https://github.com/easy-do/dnf-admin/issues/new)
4. 加入交流群：154213998

## 🔒 安全最佳实践

1. **最小权限原则**: 只授予必要的权限
2. **定期轮换**: 定期更新访问令牌
3. **监控使用**: 定期检查令牌使用情况
4. **及时撤销**: 发现异常时立即撤销令牌
5. **分离环境**: 生产和测试环境使用不同的令牌
