#!/usr/bin/env node
/**
 * Autolinking config command for React Native SPM (setup-apple-spm.js).
 *
 * The community CLI's `config` command reports `project.ios: null` when the
 * app has no Podfile (SPM-only setup), which makes generate-spm-autolinking-config
 * fail with "CLI config did not provide project.ios.sourceDir". This wrapper
 * runs the CLI config and injects the iOS sourceDir so npm native modules
 * (safe-area-context, screens, gesture-handler, ...) get autolinked.
 */
'use strict';

const { execFileSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = process.cwd();

let cliBin;
try {
  const pkgJsonPath = require.resolve('@react-native-community/cli/package.json', {
    paths: [projectRoot],
  });
  const pkgJson = require(pkgJsonPath);
  const bin = pkgJson.bin;
  const binPath =
    typeof bin === 'string'
      ? bin
      : typeof bin?.['rnc-cli'] === 'string'
        ? bin['rnc-cli']
        : bin != null && typeof bin === 'object'
          ? bin[Object.keys(bin)[0]]
          : null;
  cliBin = path.join(path.dirname(pkgJsonPath), binPath);
} catch {
  cliBin = null;
}

const raw = cliBin
  ? execFileSync(process.execPath, [cliBin, 'config'], {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    })
  : execFileSync('npx', ['--no-install', '@react-native-community/cli', 'config'], {
      cwd: projectRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      shell: true,
    });

const config = JSON.parse(raw);
config.project = config.project || {};
if (!config.project.ios || !config.project.ios.sourceDir) {
  config.project.ios = {
    ...(config.project.ios || {}),
    sourceDir: path.join(projectRoot, 'ios'),
  };
}

process.stdout.write(JSON.stringify(config));
