const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Habilita resolución del campo "exports" en package.json.
// Necesario para @hookform/resolvers y otros paquetes modernos
// que usan subpath exports (ej. @hookform/resolvers/zod).
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
