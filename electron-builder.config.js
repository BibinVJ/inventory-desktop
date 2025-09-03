module.exports = {
  appId: 'com.bibin.inventorymanager',
  productName: 'Inventory Manager',
  directories: {
    output: 'release',
    buildResources: 'build'
  },
  files: [
    'dist/**/*',
    'package.json'
  ],
  extraMetadata: {
    main: 'dist/main.js'
  },
  asar: true,
  asarUnpack: [
    '**/node_modules/sqlite3/**/*',
    '**/node_modules/better-sqlite3/**/*'
  ],
  publish: [
    {
      provider: 'github',
      owner: 'bibin',
      repo: 'inventory-manager'
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'assets/icons/icon.png'
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'assets/icons/icon.png',
    category: 'public.app-category.business',
    hardenedRuntime: true,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist'
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
    icon: 'assets/icons/icon.png',
    category: 'Office'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    installerIcon: 'assets/icons/icon.png',
    uninstallerIcon: 'assets/icons/icon.png'
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