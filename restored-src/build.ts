/**
 * Build script for restored Claude Code source.
 * Uses Bun's bundler to compile the TypeScript source into a single executable CLI.
 */
import { $ } from 'bun';

const MACRO_DEFINES: Record<string, string> = {
  'MACRO.VERSION': JSON.stringify('2.1.88'),
  'MACRO.PACKAGE_URL': JSON.stringify('@anthropic-ai/claude-code'),
  'MACRO.NATIVE_PACKAGE_URL': JSON.stringify('@anthropic-ai/claude-code-native'),
  'MACRO.BUILD_TIME': JSON.stringify(new Date().toISOString()),
  'MACRO.FEEDBACK_CHANNEL': JSON.stringify('https://github.com/anthropics/claude-code/issues'),
  'MACRO.ISSUES_EXPLAINER': JSON.stringify('Please report issues at https://github.com/anthropics/claude-code/issues'),
  'MACRO.VERSION_CHANGELOG': JSON.stringify(''),
};

async function build() {
  console.log('Building Claude Code from restored source...');

  const result = await Bun.build({
    entrypoints: ['./src/entrypoints/cli.tsx'],
    outdir: './dist',
    target: 'node',
    format: 'esm',
    splitting: false,
    sourcemap: 'external',
    minify: false,
    define: MACRO_DEFINES,
    external: [
      // Node built-ins
      'node:*',
      'async_hooks',
      'buffer',
      'child_process',
      'crypto',
      'dns',
      'events',
      'fs',
      'http',
      'https',
      'net',
      'os',
      'path',
      'perf_hooks',
      'process',
      'readline',
      'stream',
      'tls',
      'tty',
      'url',
      'util',
      'zlib',
      'node:module',
      'node:path',
      'node:fs',
      'node:os',
      'node:url',
      'node:child_process',
      'node:crypto',
      'node:http',
      'node:https',
      'node:net',
      'node:stream',
      'node:tty',
      'node:util',
      'node:events',
      'node:readline',
      'node:buffer',
      'node:perf_hooks',
      'node:async_hooks',
      'node:tls',
      'node:dns',
      'node:zlib',
      'node:process',
      // Native modules that can't be bundled
      'sharp',
      '@img/*',
      // Modules loaded from node_modules at runtime
      'yoga-wasm-web',
      // Anthropic internal SDKs (sourcemap-restored, keep external)
      '@anthropic-ai/bedrock-sdk',
      '@anthropic-ai/vertex-sdk',
      '@anthropic-ai/foundry-sdk',
      // Commander.js (keep external to preserve proper class inheritance)
      'commander',
      '@commander-js/extra-typings',
    ],
    plugins: [
      {
        name: 'bun-bundle-shim',
        setup(build) {
          // Intercept bun:bundle imports and replace with our shim
          build.onResolve({ filter: /^bun:bundle$/ }, () => {
            return {
              path: new URL('./shims/bun-bundle.ts', import.meta.url).pathname,
            };
          });
        },
      },
      {
        name: 'react-compiler-runtime',
        setup(build) {
          // Resolve react/compiler-runtime to the react-compiler-runtime npm package
          build.onResolve({ filter: /^react\/compiler-runtime$/ }, () => {
            return {
              path: require.resolve('react-compiler-runtime'),
            };
          });
        },
      },
      {
        name: 'native-stubs',
        setup(build) {
          // Redirect internal/native packages to our stub module
          const stubbedPackages = /^(color-diff-napi|modifiers-napi|@ant\/claude-for-chrome-mcp|@ant\/computer-use-mcp|@ant\/computer-use-swift|@anthropic-ai\/sandbox-runtime|@anthropic-ai\/mcpb|@anthropic-ai\/claude-agent-sdk)$/;
          build.onResolve({ filter: stubbedPackages }, () => {
            return {
              path: new URL('./shims/native-stubs.ts', import.meta.url).pathname,
            };
          });
        },
      },
      {
        name: 'text-loader',
        setup(build) {
          // Handle .md and .txt imports as text (Bun's text loader)
          build.onLoad({ filter: /\.(md|txt)$/ }, async (args) => {
            const text = await Bun.file(args.path).text();
            return {
              contents: `export default ${JSON.stringify(text)};`,
              loader: 'js',
            };
          });
        },
      },
    ],
  });

  if (!result.success) {
    console.error('Build failed:');
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  // Add shebang to output
  const cliPath = './dist/cli.js';
  const content = await Bun.file(cliPath).text();
  await Bun.write(cliPath, `#!/usr/bin/env node\n${content}`);

  console.log(`Build succeeded! Output: ${result.outputs.map(o => o.path).join(', ')}`);
  console.log(`Output size: ${(result.outputs[0]?.size || 0) / 1024 / 1024} MB`);
}

build().catch(err => {
  console.error('Build error:', err);
  process.exit(1);
});
