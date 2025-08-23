const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'electron/assets/icon.png',
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
            mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
            output: {
              filename: '[name]/index.js',
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
                  use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader',
                  ],
                },
              ],
            },
            resolve: {
              extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
              alias: {
                'process/browser': require.resolve('process/browser.js'),
              },
              fallback: {
                path: require.resolve('path-browserify'),
                os: require.resolve('os-browserify/browser'),
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                vm: require.resolve('vm-browserify'),
                buffer: require.resolve('buffer/'),
                process: require.resolve('process/browser.js'),
              },
            },
            plugins: [
              new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser',
              }),
              new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
                'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:3000/api'),
              }),
            ],
          },
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/main.tsx',
              name: 'main_window',
              preload: {
                js: './electron/preload.ts',
                config: {
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
                  plugins: [
                    new webpack.EnvironmentPlugin(['API_BASE_URL'])
                  ],
                }
              },
            },
          ],
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
