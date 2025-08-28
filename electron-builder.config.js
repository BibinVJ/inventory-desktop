module.exports = {
  appId: 'com.bibin.inventorymanager',
  productName: 'Inventory Manager',
  directories: {
    output: 'release',
    buildResources: 'build'
  },
  files: [
    'dist/**/*',
    'package.json',
    'node_modules/**/*'
  ],
  extraMetadata: {
    main: 'dist/main.js'
  },
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
      }
    ],
    icon: 'assets/icons/icon.png',
    category: 'Office'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};