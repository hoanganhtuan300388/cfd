'use strict';

import './main';

import {appModule, didGetAppModule} from './main'; // #2537
import {FileUtil} from './util/fileUtil';
import {WindowHelper, applyCallback} from './helper/windowHelper';


export {appModule, didGetAppModule}; // #2537
export {FileUtil};
export {WindowHelper, applyCallback};