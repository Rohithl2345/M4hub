const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude _styles files from being treated as routes
config.resolver.blockList = [
    /_styles\//,
];

module.exports = config;
