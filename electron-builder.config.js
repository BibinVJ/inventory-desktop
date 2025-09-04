module.exports = {
  appId: 'com.bibin.inventorymanager',
  productName: 'Inventory Manager',
  directories: {
    output: 'release',
    buildResources: 'build'
  },
  files: [
    'dist/**/*',
    'main.js',
    'package.json'
  ],
  extraMetadata: {
    main: 'main.js'
  },
  buildDependenciesFromSource: false,
  asar: false,
  asarUnpack: [
    '**/node_modules/sqlite3/**/*',
    '**/node_modules/better-sqlite3/**/*'
  ],
  publish: null,

  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ]
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    category: 'public.app-category.business'
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      },
      {
        target: 'rpm',
        arch: ['x64']
      }
    ],
    category: 'Office',
    asar: false
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  dmg: {
    contents: [
      {
        x: 130,
        y: 220
      },
      {
        x: 410,
        y: 220,
        type: 'link',
        path: '/Applications'
      }
    ]
  }
};