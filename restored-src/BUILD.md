# Claude Code 2.1.88 — 从 Sourcemap 还原源码的编译与运行全记录

## 项目背景

`@anthropic-ai/claude-code@2.1.88` 的 npm 包中包含了 `cli.js.map`（sourcemap 文件），通过 `extract-sources.js` 脚本还原出了 **1,884 个 TypeScript/TSX 源文件**（约 51 万行代码）。但还原出的源码不能直接编译运行——缺少构建配置、部分源文件缺失、依赖关系断裂、构建时 API 无运行时替代。

本文档完整记录了从「一堆还原的 .ts 文件」到「可以在终端中启动交互式 Claude Code 界面」的全部工作。

---

## 快速开始

```bash
cd restored-src

# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 恢复 Anthropic 内部 SDK（从 sourcemap 还原的 node_modules）
cp -r node_modules_sourcemap/@anthropic-ai/bedrock-sdk node_modules/@anthropic-ai/
cp -r node_modules_sourcemap/@anthropic-ai/vertex-sdk node_modules/@anthropic-ai/
cp -r node_modules_sourcemap/@anthropic-ai/foundry-sdk node_modules/@anthropic-ai/

# 3. 构建（需要 Bun）
bun run build.ts

# 4. 运行（必须在真实终端 Terminal.app / iTerm2 中执行）
node dist/cli.js              # 交互模式
node dist/cli.js --version    # 输出 "2.1.88 (Claude Code)"
node dist/cli.js --help       # 完整帮助

# 带 API key 的非交互模式
ANTHROPIC_API_KEY=sk-ant-xxx node dist/cli.js -p 'hello'
```

> **注意**：交互模式必须在真实终端（TTY）中运行。在 IDE 集成终端或 Claude Code 的 Bash 工具中运行会因为 `process.stdout.isTTY === undefined` 进入非交互模式，表现为"卡住"。可用 `CLAUDE_CODE_FORCE_INTERACTIVE=1` 强制交互模式。

---

## 一、面临的问题全景

从 sourcemap 还原的代码面临以下 **7 类核心问题**：

| # | 问题类别 | 具体表现 |
|---|---------|---------|
| 1 | **无构建配置** | 没有 `package.json`、`tsconfig.json`，无法安装依赖也无法编译 |
| 2 | **构建时 API 无运行时替代** | `bun:bundle` 的 `feature()` 是编译时 DCE 函数；`MACRO.VERSION` 等是编译时内联常量 |
| 3 | **路径解析断裂** | 321 个文件使用 `from 'src/...'` 绝对路径导入；`.md`/`.txt` 文件作为模块导入 |
| 4 | **源文件缺失** | ~25 个内部文件未被 sourcemap 还原（被 DCE 移除或属于 Anthropic 内部） |
| 5 | **内部包不可用** | 8 个 `@ant/*` 和 `@anthropic-ai/*` 内部包不在公共 npm 上 |
| 6 | **原生 C++ 模块缺失** | `color-diff-napi`、`modifiers-napi` 的源码不在 JS sourcemap 中 |
| 7 | **React 版本不匹配** | 代码使用 React 19 canary API（`useEffectEvent`、`NoEventPriority`），但常规 React 18 不支持 |

---

## 二、逐项解决方案

### 2.1 创建构建配置

**创建 `package.json`**：分析所有源文件的 import 语句，识别出 84 个外部包依赖，手动编写 package.json。

**创建 `tsconfig.json`**：
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "src/*": ["./src/*"],
      "bun:bundle": ["./shims/bun-bundle.ts"],
      "react/compiler-runtime": ["./shims/react-compiler-runtime.ts"]
    }
  }
}
```

### 2.2 构建时 API 的运行时替代

#### `bun:bundle` 的 `feature()` 函数

原始构建中，`feature('FORK_SUBAGENT')` 在编译时被替换为 `true` 或 `false`，实现 Dead Code Elimination。源码中有 **78 个** 不同的 feature flag。

**解决方案**：创建 `shims/bun-bundle.ts`，将 `feature()` 实现为运行时 `Set.has()` 查表。根据功能名称推断哪些应该启用（约 50 个核心功能），哪些应该禁用（约 28 个内部/实验性功能）。

通过 Bun bundler 插件拦截 `bun:bundle` 的导入：
```typescript
build.onResolve({ filter: /^bun:bundle$/ }, () => ({
  path: './shims/bun-bundle.ts',
}));
```

#### `MACRO.*` 编译时常量

源码中使用 7 个 `MACRO.*` 常量（`MACRO.VERSION`、`MACRO.PACKAGE_URL`、`MACRO.BUILD_TIME` 等），原始构建时由 Bun 的 define 功能内联。

**解决方案**：在 `build.ts` 中通过 Bun 的 `define` 选项注入：
```typescript
define: {
  'MACRO.VERSION': JSON.stringify('2.1.88'),
  'MACRO.PACKAGE_URL': JSON.stringify('@anthropic-ai/claude-code'),
  // ...
}
```

### 2.3 路径解析修复

#### `src/` 绝对路径导入

321 个文件使用 `from 'src/services/...'` 形式的绝对路径。通过 tsconfig 的 `paths` 映射解决：
```json
"paths": { "src/*": ["./src/*"] }
```

#### `.md` 和 `.txt` 文件导入

部分文件使用 `import cliMd from './verify/examples/cli.md'` 将文本文件作为字符串导入。原始 Bun bundler 内置了 text loader。

**解决方案**：添加 Bun 插件实现 text loader：
```typescript
build.onLoad({ filter: /\.(md|txt)$/ }, async (args) => {
  const text = await Bun.file(args.path).text();
  return { contents: `export default ${JSON.stringify(text)};`, loader: 'js' };
});
```

### 2.4 缺失源文件的 Stub

约 25 个源文件未被 sourcemap 还原。对每个缺失文件：
1. 读取所有导入该文件的源码，分析需要的 export 签名
2. 创建最小 stub，导出正确的类型/函数/常量

主要缺失文件及处理方式：

| 文件 | stub 内容 |
|------|----------|
| `types/connectorText.ts` | 导出 `ConnectorTextBlock` 类型和 `isConnectorTextBlock()` 类型守卫 |
| `services/compact/snipCompact.ts` | 导出 `isSnipRuntimeEnabled()` 等 5 个函数（均返回 false/空值） |
| `services/compact/cachedMicrocompact.ts` | 导出 `isCachedMicrocompactEnabled()` 等函数和类型 |
| `services/contextCollapse/index.ts` | 导出 `isContextCollapseEnabled()` 等 8 个函数 |
| `entrypoints/sdk/coreTypes.generated.ts` | 从 `coreSchemas.ts` 的 Zod schema 推断出约 120 个 `z.infer` 类型 |
| `tools/TungstenTool/` | 空工具类（Anthropic 内部 Tmux 终端工具） |
| `tools/VerifyPlanExecutionTool/` | 空工具类 + 常量 |
| `tools/REPLTool/REPLTool.ts` | 空工具类（目录存在但主类缺失） |
| `components/agents/SnapshotUpdateDialog.tsx` | 返回 null 的 React 组件 |
| `assistant/AssistantSessionChooser.tsx` | 返回 null 的 React 组件（Kairos 模式） |

### 2.5 内部包的 Stub

8 个内部包通过 Bun 插件统一重定向到 `shims/native-stubs.ts`：

```typescript
const stubbedPackages = /^(color-diff-napi|modifiers-napi|@ant\/claude-for-chrome-mcp|...)/;
build.onResolve({ filter: stubbedPackages }, () => ({
  path: './shims/native-stubs.ts',
}));
```

stub 文件中为每个包提供最小可用的导出，例如：
- `SandboxManager` 类带 `static isSupportedPlatform(): boolean { return false; }`
- `BROWSER_TOOLS = []` 空数组
- `getMcpConfigForManifest()` 返回空对象

### 2.6 Anthropic 内部 SDK 的恢复

`@anthropic-ai/bedrock-sdk`、`@anthropic-ai/vertex-sdk`、`@anthropic-ai/foundry-sdk` 三个包的源码同样在 sourcemap 中被还原出来（位于 `node_modules_sourcemap/`），但不是完整的 npm 包（缺 package.json 等）。

**解决方案**：将它们从 `node_modules_sourcemap/` 复制到 `node_modules/`，并在构建中标记为 `external`（不打包进 bundle，运行时从 node_modules 加载）。

### 2.7 React 版本不匹配（最关键的运行时 Bug）

这是**耗时最长的调试**，也是程序看似"卡住"的根本原因。

#### 问题链

1. 源码中大量组件使用 `import { c as _c } from "react/compiler-runtime"`（React Compiler 的缓存函数），共 499 处调用
2. 源码中的 `react-reconciler` 使用了 `NoEventPriority`（0.31+ 才有）
3. 源码中 2 个组件使用了 `useEffectEvent`（React 19 canary 才有）

#### 调试过程

| 表现 | 排查 | 发现 |
|------|------|------|
| 程序"卡住"无输出 | 在 bundle 中注入 `process.stderr.write` trace | 执行到了 `createRoot`，Ink 框架初始化了（有终端控制序列输出） |
| Ink 切换了 alt-screen 但屏幕空白 | 用 `expect` 模拟 PTY 捕获输出 | React 组件渲染为空——没有任何可见文字帧 |
| React 18 + reconciler 0.29 | 升级 reconciler 到 0.31 | 报错 `ReactSharedInternals.S is undefined`（React 18 没有短属性名） |
| React 19.0 + reconciler 0.31 | 测试 | 报错 `useEffectEvent is not a function` |
| React 19 canary + reconciler canary | **最终解决** | Ink 正确渲染了完整的 Claude Code TUI 界面 |

#### 最终版本

```json
{
  "react": "19.3.0-canary-74568e86-20260328",
  "react-reconciler": "0.34.0-canary-74568e86-20260328",
  "react-compiler-runtime": "19.0.0-beta"
}
```

#### `react/compiler-runtime` 的额外修复

`react/compiler-runtime` 是 React 包的子路径导出，但常规安装的 React 不提供这个路径。需要单独安装 `react-compiler-runtime` npm 包，并通过 Bun 插件重定向：

```typescript
build.onResolve({ filter: /^react\/compiler-runtime$/ }, () => ({
  path: require.resolve('react-compiler-runtime'),
}));
```

### 2.8 其他兼容性修复

| 问题 | 原因 | 修复 |
|------|------|------|
| Commander.js `configureHelp is not a function` | bundler 打包了旧版 commander（AWS SDK 依赖的 2.x） | 安装 commander@13 + 标记为 `external` |
| `-d2e, --debug-to-stderr` 选项报错 | Commander v13 不支持多字符短选项 | 改为 `--debug-to-stderr` |
| 非 TTY 环境跳过交互模式 | `!process.stdout.isTTY` 判定为 headless | 添加 `CLAUDE_CODE_FORCE_INTERACTIVE` 环境变量绕过 |

---

## 三、构建系统架构

### `build.ts` — 4 个 Bun Bundler 插件

```
Bun.build({
  entrypoints: ['./src/entrypoints/cli.tsx'],  ← 入口
  target: 'node',  format: 'esm',
  define: { MACRO.* },                         ← 编译时常量替换
  external: [ node:*, commander, Anthropic SDK ],
  plugins: [
    bun-bundle-shim,         ← 拦截 bun:bundle → shims/bun-bundle.ts
    react-compiler-runtime,  ← 拦截 react/compiler-runtime → react-compiler-runtime 包
    native-stubs,            ← 拦截 8 个内部包 → shims/native-stubs.ts
    text-loader,             ← .md/.txt 文件 → export default "..."
  ]
})
```

### 输出

```
dist/cli.js      ~21.6 MB  (ESM, 含 shebang)
dist/cli.js.map  (sourcemap)
```

---

## 四、项目文件结构

```
restored-src/
├── src/                        # 还原的源码 (1,884 文件, ~51万行)
│   ├── entrypoints/cli.tsx     # CLI 入口 (快速路径 + 动态加载 main.tsx)
│   ├── main.tsx                # 主程序 (Commander.js CLI + React TUI 启动)
│   ├── query.ts                # 对话引擎核心循环 (while(true) + async generator)
│   ├── QueryEngine.ts          # 会话管理器
│   ├── tools/                  # 45+ 工具实现 (Bash, Edit, Read, Glob, ...)
│   ├── components/             # React (Ink) TUI 组件
│   ├── ink/                    # Ink 渲染引擎 (自定义 fork)
│   ├── services/               # API 客户端, MCP, 分析, 压缩等
│   └── utils/                  # 配置, 权限, Git, Shell, 记忆等
├── shims/                      # 构建时替代模块
│   ├── bun-bundle.ts           # feature() → Set.has() 查表 (78 个 flag)
│   ├── macro.ts                # MACRO.* 全局常量
│   ├── native-stubs.ts         # 8 个内部/原生包的 stub
│   └── react-compiler-runtime.ts  # (已被 Bun 插件重定向，不再使用)
├── build.ts                    # Bun 构建脚本
├── install.sh                  # 一键安装脚本
├── package.json                # 84+ 外部依赖
├── tsconfig.json               # TypeScript 配置 + 路径映射
├── node_modules_sourcemap/     # sourcemap 还原的依赖备份
└── dist/
    └── cli.js                  # 构建输出 (~21.6 MB)
```

---

## 五、还原程度诚实评估

### ✅ 完整还原（~95% 代码量）

核心对话引擎、45+ 工具系统、Ink TUI 框架、权限系统、上下文管理、MCP 集成、Agent/Swarm 协作、记忆系统、配置管理、提示词系统——全部完整。

### ⚠️ Stub 化（功能缺失但不崩溃）

- **25 个源文件** 用空 stub 替代（主要是 Anthropic 内部功能）
- **8 个内部包** 用 shim 替代
- **2 个原生 C++ addon** 跳过（有纯 TS 替代实现）

### ❌ 无法还原

- **78 个 feature flag 的真实默认值**：只能根据命名猜测
- **Kairos/Assistant 模式**：整个助手系统被 DCE 移除，多个源文件缺失
- **自动生成的类型**：`coreTypes.generated.ts` 需要不存在的代码生成步骤
- **原生 C++ addon 源码**：不在 JS sourcemap 中

---

## 六、对源码的全部修改

仅做了 **2 处源码修改**（其余全是新增文件）：

1. **`src/main.tsx:976`**：`-d2e, --debug-to-stderr` → `--debug-to-stderr`
   - 原因：Commander v13 不允许多字符短选项

2. **`src/main.tsx:803`**：在 `isNonInteractive` 判断中增加 `CLAUDE_CODE_FORCE_INTERACTIVE` 环境变量
   - 原因：允许在非 TTY 环境（IDE 终端等）强制进入交互模式
