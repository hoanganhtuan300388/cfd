let maxSize = 10 * 1024 * 1024;
let format = '[{y}/{m}/{d} {h}:{i}:{s}:{ms}] {text}';
let level = (function(){
    if(process.env.NODE_ENV){
      let stg = process.env.NODE_ENV.indexOf("stg") >= 0 ;
      let dev = process.env.NODE_ENV.indexOf("dev") >= 0 ;
      if( stg || dev ){
        return 'debug';
      }
    }
    return 'info';
  })()

export const LogConfig = {
    system: { 
        level: level,
        filename: "system.log",
        maxSize: maxSize,
        format: format,
        streamFlag: 'w'
    },
    event: { 
        level: level,
        filename: "event.log",
        maxSize: maxSize,
        format: format,
        streamFlag: 'w'
    },
    access: { 
        level: level,
        filename: "access.log",
        maxSize: maxSize,
        format: format,
        streamFlag: 'w'
    }                 
};