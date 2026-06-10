const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const withTabIcons = (config) => {
  return withDangerousMod(config, [
    "android",
    (config) => {
      const src = path.join(config.modRequest.projectRoot, "assets", "drawables");
      const dest = path.join(
        config.modRequest.platformProjectRoot,
        "app", "src", "main", "res", "drawable"
      );

      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      for (const file of fs.readdirSync(src).filter((f) => f.endsWith(".xml"))) {
        fs.copyFileSync(path.join(src, file), path.join(dest, file));
      }

      return config;
    },
  ]);
};

module.exports = withTabIcons;
