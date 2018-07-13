// include electron
window.electron = require("electron");

// load WindowHelper
helper = electron.remote.require('./main').WindowHelper.getInstance();

let win = electron.remote.getCurrentWindow();

// set popup window's parameter
window.electron.parameter = helper.pop(win.id);

// app run counter
if(window.electron.parameter){
  window.electron.parameter.AppCounter = helper.AppCounter;
}
