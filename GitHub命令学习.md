# GitHub 命令学习笔记

本项目从零开始推送到 GitHub 所用到的全部命令。

---

## 第一步：初始化本地仓库

```bash
git init
```

**作用**：在当前文件夹创建一个新的 Git 仓库（生成隐藏的 `.git` 目录）。
只需要执行一次，之后这个文件夹就被 Git 管理了。

---

## 第二步：查看当前状态

```bash
git status
```

**作用**：查看哪些文件被修改、哪些文件已暂存、哪些文件未被追踪。
养成习惯：每次操作前后都 `git status` 确认一下。

---

## 第三步：暂存文件（添加到"待提交区"）

```bash
# 暂存所有文件
git add .

# 暂存指定文件
git add server.js

# 暂存某个文件夹
git add routes/
```

**作用**：把文件放入"暂存区"（Staging Area），准备提交。
`.` 表示当前目录下所有文件。

---

## 第四步：提交（保存快照）

```bash
git commit -m "Initial commit: md-viewer app with admin panel and JWT auth"
```

**作用**：把暂存区的内容正式保存为一个版本（commit）。
`-m` 后面跟提交信息，描述这次改了什么。

**好的提交信息格式**：
```
动词 + 做了什么（言简意赅）

例如：
Add user authentication
Fix login redirect bug
Update README with setup instructions
```

---

## 第五步：连接远程仓库（GitHub）

```bash
git remote add origin https://github.com/Alan-MOK/md-viewer.git
```

**作用**：告诉本地 Git，远程仓库（GitHub 上的那个）在哪里。
`origin` 是远程仓库的别名（惯例叫 origin，可以改成其他名字）。

**查看已有的远程仓库**：
```bash
git remote -v
```

---

## 第六步：推送到 GitHub

```bash
git push -u origin main
```

**作用**：把本地的 `main` 分支推送到远程仓库 `origin`。
`-u` 的意思是"设置上游"，之后只需要 `git push` 就够了，不用每次都写 `origin main`。

**之后再推送时**（已设置 -u 之后）：
```bash
git push
```

---

## 日常工作流程（改完代码后的标准步骤）

```bash
# 1. 查看改了哪些文件
git status

# 2. 查看具体改了什么内容
git diff

# 3. 暂存改动
git add .

# 4. 提交
git commit -m "描述你做了什么"

# 5. 推送到 GitHub
git push
```

---

## 其他常用命令

### 查看提交历史
```bash
git log

# 简洁版（一行一个 commit）
git log --oneline
```

### 查看远程仓库地址
```bash
git remote -v
```

### 从 GitHub 拉取最新代码
```bash
git pull
```

### 创建并切换到新分支
```bash
git checkout -b feature/new-feature
```

### 切换回主分支
```bash
git checkout main
```

---

## .gitignore 是什么？

`.gitignore` 文件告诉 Git **不要追踪哪些文件**。

本项目的 `.gitignore`：
```
node_modules/    # 依赖包（体积大，可以用 npm install 恢复）
.env             # 环境变量（含密钥，绝对不能上传）
data/            # 数据库文件（本地数据，不应共享）
.DS_Store        # macOS 系统文件（无意义）
```

**规则**：密钥、密码、大文件、本地配置 → 都放进 .gitignore。

---

## 本项目执行记录

```bash
# 1. 完善 .gitignore
# （手动编辑文件）

# 2. 初始化 Git 仓库
git init

# 3. 暂存所有文件
git add .

# 4. 查看暂存状态
git status

# 5. 提交
git commit -m "Initial commit: md-viewer app with admin panel and JWT auth"

# 6. 添加远程仓库
git remote add origin https://github.com/Alan-MOK/md-viewer.git

# 7. 推送
git push -u origin main
```

---

## GitHub 仓库地址

https://github.com/Alan-MOK/md-viewer
