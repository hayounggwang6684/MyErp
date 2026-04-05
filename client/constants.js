const fs = require("node:fs");
const path = require("node:path");

const baseConfig = {
  serverUrl: "https://sunjincmk-dev.site",
  updateRepoOwner: "hayounggwang6684",
  updateRepoName: "MyErp",
  cloudflareAccess: {
    enabled: false,
    clientId: "",
    clientSecret: "",
  },
  forceAccessScopeForTesting: null,
};

const generatedOverridePath = path.join(__dirname, "constants.generated.js");
const localOverridePath = path.join(__dirname, "constants.local.js");

function mergeConfig(overrideConfig) {
  module.exports = {
    ...baseConfig,
    ...overrideConfig,
    cloudflareAccess: {
      ...baseConfig.cloudflareAccess,
      ...(overrideConfig.cloudflareAccess || {}),
    },
  };
}

if (fs.existsSync(generatedOverridePath)) {
  mergeConfig(require(generatedOverridePath));
} else if (fs.existsSync(localOverridePath)) {
  mergeConfig(require(localOverridePath));
} else {
  module.exports = baseConfig;
}
