# claude-code-sourcemap

[![linux.do](https://img.shields.io/badge/linux.do-huo0-blue?logo=linux&logoColor=white)](https://linux.do)

> [!WARNING]
> This repository is **unofficial** and is reconstructed from the public npm package and source map analysis, **for research purposes only**.
> It does **not** represent the original internal development repository structure.
>
> 本仓库为**非官方**整理版，基于公开 npm 发布包与 source map 分析还原，**仅供研究使用**。
> **不代表**官方原始内部开发仓库结构。
> 一切基于L站"飘然与我同"的情报提供

## 概述

本仓库通过 npm 发布包（`@anthropic-ai/claude-code`）内附带的 source map（`cli.js.map`）还原的 TypeScript 源码，版本为 `2.1.88`。

还原的源码已经可以**完整编译并运行**——包括交互式 TUI 界面、`--help`、`--version`、`-p` 管道模式等。

## 快速开始

### 前置要求

- **Node.js** >= 18
- **Bun** >= 1.0（仅构建时需要）

### 一键安装

```bash
cd restored-src
bash install.sh
```

脚本会自动完成依赖安装、内部 SDK 恢复、编译构建，并创建 `claude-dev` 命令到 `~/.local/bin/`。

### 手动编译

```bash
cd restored-src

# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 恢复 Anthropic 内部 SDK（从 sourcemap 还原的 node_modules）
cp -r node_modules_sourcemap/@anthropic-ai/bedrock-sdk node_modules/@anthropic-ai/
cp -r node_modules_sourcemap/@anthropic-ai/vertex-sdk node_modules/@anthropic-ai/
cp -r node_modules_sourcemap/@anthropic-ai/foundry-sdk node_modules/@anthropic-ai/

# 3. 构建
bun run build.ts
```

构建产物输出到 `dist/cli.js`（~21.6 MB ESM bundle）。

### 运行

```bash
# 查看版本
node restored-src/dist/cli.js --version    # → 2.1.88 (Claude Code)

# 查看帮助
node restored-src/dist/cli.js --help

# 交互模式（必须在真实终端 Terminal.app / iTerm2 中运行）
node restored-src/dist/cli.js

# 管道模式（需要 API Key）
ANTHROPIC_API_KEY=sk-ant-xxx node restored-src/dist/cli.js -p 'hello'
```

> **注意**：交互模式必须在真实终端（TTY）中运行。IDE 集成终端可能因为 `process.stdout.isTTY === undefined` 进入非交互模式而表现为"卡住"。可设置 `CLAUDE_CODE_FORCE_INTERACTIVE=1` 强制交互模式。

## 来源

- npm 包：[@anthropic-ai/claude-code](https://www.npmjs.com/package/@anthropic-ai/claude-code)
- 还原版本：`2.1.88`
- 还原文件数：**4756 个**（含 1884 个 `.ts`/`.tsx` 源文件）
- 还原方式：提取 `cli.js.map` 中的 `sourcesContent` 字段

## 构建系统

使用 Bun Bundler 将 TypeScript 源码编译为单文件 ESM bundle，通过 **4 个插件** 解决还原代码的兼容性问题：

| 插件 | 作用 |
|------|------|
| `bun-bundle-shim` | 将 `bun:bundle` 的编译时 `feature()` 替换为运行时 `Set.has()` 查表（78 个 feature flag） |
| `react-compiler-runtime` | 重定向 `react/compiler-runtime` 到 `react-compiler-runtime` npm 包 |
| `native-stubs` | 将 8 个内部/原生包（`@ant/*`、`color-diff-napi` 等）重定向到空 stub |
| `text-loader` | 将 `.md`/`.txt` 文件导入转为字符串 `export default` |

详细编译记录参见 [restored-src/BUILD.md](restored-src/BUILD.md)。

## 目录结构

```
restored-src/
├── src/                        # 还原的源码 (1,884 文件, ~51万行)
│   ├── entrypoints/cli.tsx     # CLI 入口
│   ├── main.tsx                # 主程序 (Commander.js CLI + React TUI)
│   ├── tools/                  # 工具实现（Bash、FileEdit、Grep、MCP 等 45+ 个）
│   ├── commands/               # 命令实现（commit、review、config 等 40+ 个）
│   ├── services/               # API、MCP、分析、压缩等服务
│   ├── utils/                  # 工具函数（git、model、auth、env 等）
│   ├── components/             # React (Ink) TUI 组件
│   ├── ink/                    # Ink 渲染引擎 (自定义 fork)
│   ├── coordinator/            # 多 Agent 协调模式
│   ├── plugins/                # 插件系统
│   ├── skills/                 # 技能系统
│   └── voice/                  # 语音交互
├── shims/                      # 构建时替代模块
│   ├── bun-bundle.ts           # feature() 运行时实现
│   ├── native-stubs.ts         # 内部/原生包 stub
│   └── react-compiler-runtime.ts
├── build.ts                    # Bun 构建脚本
├── install.sh                  # 一键安装脚本
├── package.json                # 84+ 外部依赖
├── tsconfig.json               # TypeScript 配置 + 路径映射
├── node_modules_sourcemap/     # sourcemap 还原的内部 SDK 备份
└── dist/
    └── cli.js                  # 构建输出 (~21.6 MB)
```

## 声明

- 源码版权归 [Anthropic](https://www.anthropic.com) 所有
- 本仓库仅用于技术研究与学习，请勿用于商业用途
- 如有侵权，请联系删除
