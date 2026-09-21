import { createRequire } from "node:module";

const { devDependencies } = createRequire(import.meta.url)("./package.json");
const cdnVersion = devDependencies.yummacss.replace(/^\D*/, "");
if (!/^\d+\.\d+\.\d+/.test(cdnVersion)) {
  throw new Error(
    `Cannot read a cdn version from "${devDependencies.yummacss}".`,
  );
}

const nextConfig = {
  env: {
    NEXT_PUBLIC_CDN_VERSION: cdnVersion,
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
