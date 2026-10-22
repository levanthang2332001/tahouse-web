import { build } from 'esbuild';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('[1/3] TypeScript compilation (retaining DI decorator metadata)...');
execSync('npx tsc -p tsconfig.worker.json', { stdio: 'inherit', cwd: __dirname });

console.log('[2/3] Rewriting path aliases (@/* -> relative)...');
execSync('npx tsc-alias -p tsconfig.worker.json', { stdio: 'inherit', cwd: __dirname });

// Cloudflare Workers runtime natively supports these Node builtins via nodejs_compat
const supportedNodeModules = [
  'assert',
  'async_hooks',
  'buffer',
  'crypto',
  'events',
  'http',
  'https',
  'module',
  'net',
  'path',
  'process',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'url',
  'util',
  'zlib',
];

const optionalNestModules = [
  '@nestjs/websockets',
  '@nestjs/websockets/*',
  '@nestjs/microservices',
  '@nestjs/microservices/*',
  'class-transformer/storage',
];

const external = [
  'cloudflare:node',
  ...supportedNodeModules,
  ...supportedNodeModules.map((b) => `node:${b}`),
  ...optionalNestModules,
];

// Plugins to shim Node modules that don't exist in Workers (like tty, fs)
const nodeShimsPlugin = {
  name: 'node-shims',
  setup(build) {
    // Shim tty (used by debug / express / body-parser)
    build.onResolve({ filter: /^(node:)?tty$/ }, (args) => ({
      path: args.path,
      namespace: 'tty-shim',
    }));
    build.onLoad({ filter: /.*/, namespace: 'tty-shim' }, () => ({
      contents: `
        export const isatty = () => false;
        export default { isatty };
      `,
      loader: 'js',
    }));

    // Shim fs
    build.onResolve({ filter: /^(node:)?fs$/ }, (args) => ({
      path: args.path,
      namespace: 'fs-shim',
    }));
    build.onLoad({ filter: /.*/, namespace: 'fs-shim' }, () => ({
      contents: `
        export class ReadStream {}
        export const readFileSync = () => '';
        export const readFile = (p, cb) => { if (cb) cb(null, ''); return Promise.resolve(''); };
        export const existsSync = () => false;
        export const statSync = () => ({ isDirectory: () => false, isFile: () => false, size: 0 });
        export const lstatSync = () => ({ isDirectory: () => false, isFile: () => false, size: 0 });
        export const fstatSync = () => ({ isDirectory: () => false, isFile: () => false, size: 0 });
        export const stat = (p, cb) => { if (cb) cb(null, statSync()); return Promise.resolve(statSync()); };
        export const createReadStream = () => ({ pipe: () => {}, on: () => {} });
        export const promises = {
          readFile: () => Promise.resolve(''),
          stat: () => Promise.resolve(statSync()),
          lstat: () => Promise.resolve(lstatSync()),
        };
        export default {
          ReadStream,
          readFileSync,
          readFile,
          existsSync,
          statSync,
          lstatSync,
          fstatSync,
          stat,
          createReadStream,
          promises,
        };
      `,
      loader: 'js',
    }));

    // Shim fs/promises
    build.onResolve({ filter: /^(node:)?fs\/promises$/ }, (args) => ({
      path: args.path,
      namespace: 'fs-promises-shim',
    }));
    build.onLoad({ filter: /.*/, namespace: 'fs-promises-shim' }, () => ({
      contents: `
        export const readFile = () => Promise.resolve('');
        export const stat = () => Promise.resolve({ isDirectory: () => false, isFile: () => false, size: 0 });
        export const lstat = () => Promise.resolve({ isDirectory: () => false, isFile: () => false, size: 0 });
        export default { readFile, stat, lstat };
      `,
      loader: 'js',
    }));

    // Shim os
    build.onResolve({ filter: /^(node:)?os$/ }, (args) => ({
      path: args.path,
      namespace: 'os-shim',
    }));
    build.onLoad({ filter: /.*/, namespace: 'os-shim' }, () => ({
      contents: `
        export const homedir = () => '/tmp';
        export const tmpdir = () => '/tmp';
        export const networkInterfaces = () => ({});
        export const platform = () => 'linux';
        export const arch = () => 'x64';
        export const release = () => '1.0.0';
        export const cpus = () => [];
        export default { homedir, tmpdir, networkInterfaces, platform, arch, release, cpus };
      `,
      loader: 'js',
    }));

    // Shim perf_hooks
    build.onResolve({ filter: /^(node:)?perf_hooks$/ }, (args) => ({
      path: args.path,
      namespace: 'perf-hooks-shim',
    }));
    build.onLoad({ filter: /.*/, namespace: 'perf-hooks-shim' }, () => ({
      contents: `
        export const performance = globalThis.performance;
        export default { performance: globalThis.performance };
      `,
      loader: 'js',
    }));
  },
};

console.log('[3/3] esbuild bundling pure JS with Node externals and shims...');
await build({
  entryPoints: ['dist-worker-ts/worker.js'],
  bundle: true,
  platform: 'node',
  target: 'es2022',
  format: 'esm',
  outfile: 'dist-worker/worker.js',
  minify: false,
  plugins: [nodeShimsPlugin],
  banner: {
    js: `import { createRequire } from 'node:module';
const rawRequire = createRequire('file:///worker.js');
const rawBuffer = rawRequire('node:buffer');
const bufferShim = Object.assign(Object.create(Object.prototype), rawBuffer, {
  Buffer: rawBuffer.Buffer,
  SlowBuffer: rawBuffer.SlowBuffer,
  kMaxLength: rawBuffer.kMaxLength,
  kStringMaxLength: rawBuffer.kStringMaxLength,
  constants: rawBuffer.constants,
});

const rawStream = rawRequire('node:stream');
const StreamCtor = rawStream.default || rawStream.Stream || rawStream;
const streamShim = Object.assign(StreamCtor, rawStream);

const rawEvents = rawRequire('node:events');
const EventsCtor = rawEvents.default || rawEvents.EventEmitter || rawEvents;
const eventsShim = Object.assign(EventsCtor, rawEvents);

const perfHooksShim = { performance: globalThis.performance };

const require = (mod) => {
  if (mod === 'buffer' || mod === 'node:buffer') return bufferShim;
  if (mod === 'stream' || mod === 'node:stream') return streamShim;
  if (mod === 'events' || mod === 'node:events') return eventsShim;
  if (mod === 'perf_hooks' || mod === 'node:perf_hooks') return perfHooksShim;
  return rawRequire(mod);
};
Object.assign(require, rawRequire);`,
  },




  external,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

console.log('✓ Build complete: dist-worker/worker.js');
