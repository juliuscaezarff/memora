import { type XmcpConfig } from "xmcp";

const config: XmcpConfig = {
  http: true,
  experimental: {
    adapter: "nextjs",
  },
  paths: {
    tools: "src/tools",
    prompts: false,
    resources: false,
  },
  bundler: (config) => {
    config.externals = [
      ...(Array.isArray(config.externals) ? config.externals : []),
      /^@memora\//,
    ];
    return config;
  },
};

export default config;
