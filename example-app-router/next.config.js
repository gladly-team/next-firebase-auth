
const { InjectManifest } = require("workbox-webpack-plugin")

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ['app', 'auth', 'components', 'lib', 'pages', 'src', 'sw', 'utils'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      // https://github.com/vercel/next.js/issues/33863#issuecomment-1140518693
      config.plugins.push(
        new InjectManifest({
          swSrc: "./service-worker.ts",
          swDest: "../public/service-worker.js",
          include: ["__nothing__"],
        })
      );
    }

    return config;
  }
}

module.exports = nextConfig
