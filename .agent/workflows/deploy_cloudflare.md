---
description: Deploy Portable Objection to Cloudflare Pages
---

# 部署到 Cloudflare Pages (Deployment Guide)

由于您的本地路径包含中文导致构建工具报错，**最推荐**的方式是通过 **GitHub + Cloudflare Pages 自动构建**。这样 Cloudflare 的云端服务器（Linux 环境）可以完美编译您的代码。

## 准备工作
确保您拥有一个 GitHub 账号和 Cloudflare 账号。

## 第一步：提交代码到 GitHub
1.  **初始化 Git (如果尚未初始化)**
    ```bash
    git init
    git add .
    git commit -m "Refactor: React + Tailwind v4 upgrade"
    ```

2.  **创建 GitHub 仓库**
    - 登录 GitHub，创建一个新仓库（例如 `portable-objection`）。
    - **不要**勾选 "Initialize with README" 或 .gitignore。

3.  **推送到远程仓库**
    ```bash
    # 请将其中的 URL 替换为您刚才创建的仓库地址
    git remote add origin https://github.com/YOUR_USERNAME/portable-objection.git
    git branch -M main
    git push -u origin main
    ```

## 第二步：在 Cloudflare Pages 设置
1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  进入 **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**。
3.  选择您的 GitHub 仓库 `portable-objection`。
4.  **构建配置 (Build Settings)**:
    - **Framework Preset**: 选择 `Vite` (Cloudflare 会自动识别，如果没有请手动选择)
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
    - **Root directory**: `/` (默认即可，留空)
    
    > **注意**: 记得在配置界面选择您刚才推送的分支（例如 `feature/ui-polish-fixes` 而不是默认的 `main`，或者先在 GitHub 将其合并到 main）。

5.  **环境变量 (Environment Variables)** (建议设置):
    - 变量名: `NODE_VERSION`
    - 值: `20` (确保使用较新的 Node.js 版本以支持 Tailwind v4)

6.  点击 **Save and Deploy**。

## 为什么选择这种方式？
- ✅ **避开中文路径问题**: Cloudflare 的构建环境是标准的纯英文 Linux 环境，不会出现本地的 `undefined:NaN` 错误。
- ✅ **自动部署**: 以后您只需 `git push`，网站就会自动更新。
- ✅ **全球加速**: Cloudflare 提供全球 CDN。

## 替代方案 (本地构建上传)
如果您**必须**从本地上传（不使用 Git），您需要：
1.  将整个项目移动到**全英文路径**（如 `D:\Projects\obj`）。
2.  运行 `npm run build` 成功生成 `dist` 文件夹。
3.  运行 `npx wrangler pages deploy dist` 并按提示登录。
