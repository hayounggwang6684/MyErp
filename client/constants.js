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

const localOverridePath = path.join(__dirname, "constants.local.js");

if (fs.existsSync(localOverridePath)) {
  const localOverride = require(localOverridePath);
  module.exports = {
    ...baseConfig,
    ...localOverride,
    cloudflareAccess: {
      ...baseConfig.cloudflareAccess,
      ...(localOverride.cloudflareAccess || {}),
    },
  };
} else {
  module.exports = baseConfig;
}
