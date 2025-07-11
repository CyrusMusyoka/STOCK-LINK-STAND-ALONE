const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.resolve(__dirname, 'src/image/favicon.ico'),
    extraResource: [ 
      {
        from: path.resolve(__dirname, 'scripts/backend'),
        to: 'scripts/backend',
        filter: ["**/*", "!**/node_modules/fsevents/**", "!**/node_modules/fsevents*"] 
      },
      {
        from: path.resolve(__dirname, 'node_modules/better-sqlite3'),
        to: 'node_modules/better-sqlite3'
      }
    ],
    appBundleId: 'com.stocklink.app',
    win32metadata: {
      CompanyName: 'Welt Tallis Cooperation',
      FileDescription: 'StockLink Inventory Management',
      ProductName: 'StockLink StandAlone Software'
    },
    // Exclude fsevents 
    ignore: [
      /node_modules[\\\/]fsevents/, // Regex for Windows paths
      /node_modules\/fsevents/     
    ]
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'], // Explicitly set to win32
      config: {
        name: 'stocklink',
        setupIcon: path.resolve(__dirname, 'src/image/favicon.ico')
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'] 
    }
 
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {}
    }
  ]
};