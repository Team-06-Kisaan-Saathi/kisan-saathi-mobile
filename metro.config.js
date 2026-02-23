// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Alias native-only packages to web stubs when bundling for web
config.resolver = config.resolver || {};
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === "web") {
        if (moduleName === "react-native-maps") {
            return {
                filePath: path.resolve(__dirname, "stubs/react-native-maps.web.js"),
                type: "sourceFile",
            };
        }
        if (moduleName === "react-native-vosk") {
            return {
                filePath: path.resolve(__dirname, "stubs/react-native-vosk.web.js"),
                type: "sourceFile",
            };
        }
    }

    if (originalResolveRequest) {
        return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
