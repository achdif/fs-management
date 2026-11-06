// metro.config.js – React Native 0.88 compatible
const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration that treats `apps/mobile` as the project root.
 * This allows `react-native` commands to resolve the entry file
 * (`index.ts` inside `apps/mobile`) without needing a dummy file
 * at the repository root.
 */
module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);
  // Set projectRoot to apps/mobile
  defaultConfig.projectRoot = path.resolve(__dirname, 'apps/mobile');
  // Ensure Metro watches the monorepo root for node_modules resolution
  defaultConfig.watchFolders = [path.resolve(__dirname)];
  // Make sure @babel/runtime resolves to the root node_modules
  defaultConfig.resolver = defaultConfig.resolver || {};
  defaultConfig.resolver.extraNodeModules = {
    '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
  };
  return defaultConfig;
})();
