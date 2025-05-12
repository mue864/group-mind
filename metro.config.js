const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add SVG transformer
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// Fix asset extensions to exclude `.svg`
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== "svg");
config.resolver.sourceExts.push("svg");

// Apply NativeWind transformer
module.exports = withNativeWind(config, { input: "./global.css" });
