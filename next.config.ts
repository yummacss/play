import { createRequire } from "node:module";

const { devDependencies } = createRequire(import.meta.url)("./package.json");
const runtimeVersion = devDependencies.yummacss.replace(/^\D*/, "");
if (!/^\d+\.\d+\.\d+/.test(runtimeVersion)) {
  throw new Error(
    `Cannot read a cdn version from "${devDependencies.yummacss}".`,
  );
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_RUNTIME_VERSION: runtimeVersion,
  },

  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://yummacss.com https://*.yummacss.com https://*.vercel.app",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
