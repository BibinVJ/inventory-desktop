const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        mainConfig: {
          entry: './electron/main.ts',
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                use: {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                  },
                },
              },
            ],
          },
          resolve: {
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
          },
        },
        renderer: {
          config: {
            output: {
              publicPath: '/',
            },
            module: {
              rules: [
                {
                  test: /\.tsx?$/,
                  exclude: /node_modules/,
                  use: {
                    loader: 'ts-loader',
                    options: {
                      transpileOnly: true,
                    },
                  },
                },
                {
                  test: /\.css$/,
                  use: ['style-loader', 'css-loader'],
                },
              ],
            },
            resolve: {
              extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
              fallback: {
                path: require.resolve('path-browserify'),
                os: require.resolve('os-browserify/browser'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                vm: require.resolve('vm-browserify'),
              },
            },
          },
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/main.tsx',
              name: 'main_window',
              preload: {
                js: './electron/preload.ts',
                config: {
                  plugins: [
                    new webpack.EnvironmentPlugin(['API_BASE_URL'])
                  ],
                }
              },
            },
          ],
          devContentSecurityPolicy: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src http://127.0.0.1:8000 ws://localhost:3000",
        },
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
