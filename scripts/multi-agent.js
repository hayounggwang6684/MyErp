#!/usr/bin/env node

process.env.MULTI_AGENT_APP_NAME ||= "Multi-Agent";
process.env.MULTI_AGENT_STORE_DIR ||= ".multi-agent";
process.env.MULTI_AGENT_COMMAND ||= "npm run multi-agent";
process.env.MULTI_AGENT_CONDUCTOR ||= "terminal-d";

require("./orchestra").main();
