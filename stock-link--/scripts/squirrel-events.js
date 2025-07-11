const { app } = require('electron');
const squirrelEvents = require('electron-squirrel-startup');

if (squirrelEvents.handleSquirrelEvent(app)) {
  process.exit();
}