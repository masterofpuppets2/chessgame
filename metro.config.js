// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('metro-config').MetroConfig}
//  */
// const config = {
//   transformer: {
//     babelTransformerPath: require.resolve('react-native-svg-transformer'),
//     // Optional: Um zusätzliche Assets zu unterstützen
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: true,
//         inlineRequires: true,
//       },
//     }),
//   },
//   resolver: {
//     assetExts: ['bin', 'txt', 'png', 'jpg', 'jpeg', 'svg'], // SVG-Dateien hinzufügen
//     sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'svg'], // SVGs als Quellen
//   },
// };

// module.exports = mergeConfig(getDefaultConfig(__dirname), config);

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
