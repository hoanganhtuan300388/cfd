'use strict';
import * as electron from 'electron';
import {AppModule} from './appModule';

export var appModule;

electron.app.on('ready', ()=>{
  appModule = new AppModule();
});

// #2537
export var didGetAppModule = function() {
  return(appModule);
}
//
