// はっちゅう君CFD packager.

/**
 * for builder
 */
const package = require("./package.json");
const Builder = require("electron-builder");
const yaml    = require("node-yaml")
const child   = require('child_process');
const crypto  = require('crypto');
const fs      = require('fs');

const Platform = Builder.Platform;
const Arch     = Builder.Arch;

// const
const JPN_Name = "はっちゅう君CFD";
const JPN_Demo = "デモ";
const YML_MAC  = "latest-mac.yml";

// codeSing passwod for live win 
const Win_Pass = "*****";

/**
 * 基本設定情報
 */
let metaData  = {
  appMetadata: {
    main: './dist/app/main.js',
    version: package.version
  }, 
  config:{
    productName: package.name,
    appId: "com.click-sec.HatchukunCFD",
    asar: true,
    copyright: "Copyright © GMO CLICK Securities, Inc.",
    mac: {
      target: ["default"],
      icon: "./app/assets/icon/mac_desktop"
    },
    dmg: {
      title: JPN_Name
    },
    win: {
      target: ["zip","nsis"],
      icon: "./app/assets/icon/win_desktop"
    },
    nsis: {
      oneClick: false,
      perMachine: true,
      allowToChangeInstallationDirectory: true,
      shortcutName: JPN_Name,
      include: "installer.nsh"
    },
    files: ["./dist/**/*"],
    extraFiles: [
      {
        "from": "./dist/sound",
        "to": "./sound"
      }
    ],
    directories: {
      buildResources: "./dist",
      output: "./build/",
      app: "."
    },
    publish: [
      {
        provider: "generic",
        url: ""
      }
    ]
  }
}

/**
 * target OS設定 [win/mac]
 */
function setBuildTarget(option, os){
  if( os == '--win'){
    option.targets = Platform.WINDOWS.createTarget(["nsis", "zip"], Arch.ia32, Arch.x64);  
  }else if( os == '--mac'){
    option.targets = Builder.Platform.MAC.createTarget();
  }else{
    return false;
  }

  return true;
}

/**
 * Winの場合初期インストーラーとバージョンアップ用インストーラーを区分する。
 */
function setInstallMode(option, mode){
  let nsis = option.config.nsis;

  if( mode == 'install'){
    nsis.oneClick   = false;
    nsis.include    = "installer.nsh";
    nsis.allowToChangeInstallationDirectory = true;
  }else if( mode == 'update'){
    nsis.oneClick   = true;
    nsis.include    = undefined;
    // nsis.include    = "updater.nsh";
    nsis.allowToChangeInstallationDirectory = false;
  }else{
    return false;
  }

  return true;
}

/**
 * Real, Demo別の本番・検証版環境設定。
 */
function setBuildEnvironment(option, mode, os){
  let cfg      = option.config;
  let pkg      = require(`${cfg.directories.buildResources}/package.json`);
  let artifact = package.name + "Setup-v${version}-" + pkg.devMode + "-${os}.${ext}";
  let env      = pkg.devMode;

  // ヴァージョンアップデートSetupの場合は’Update_’を前に付ける。
  if( mode == 'update'){
    artifact = 'Update_' + artifact;
  }

  // artifactName
  cfg.nsis.artifactName = artifact;
  cfg.mac.artifactName  = artifact;
  
  // app id.
  cfg.appId = `com.click-sec.${pkg.name}`;
  cfg.nsis.guid = `com.click-sec.${pkg.name}`;

  // set product. shortcut. mac dmg title
  if(env.indexOf('real') >=0){          // real ----
    env = env.replace('real', '');

    if(env.length){
      cfg.productName += `${env}`;
      cfg.nsis.shortcutName += `${env}`;
      cfg.dmg.title  += `${env}`;
    }
    if(os == '--win'){
      if(env.indexOf('stg') <0){
        //only live & win
        cfg.win.certificateFile = "./cert/win/mycert.pfx";
        cfg.win.certificatePassword = Win_Pass;
        cfg.win.signingHashAlgorithms  = ['sha256'];
        cfg.win.publisherName = "SHA256";
        cfg.win.timeStampServer = "http://timestamp.verisign.com/scripts/timstamp.dll";
      }
    }
  }else if(env.indexOf('demo') >=0){    // demo ----
    cfg.productName += `_${env}`;
    cfg.nsis.shortcutName += `_${JPN_Demo}`;
    cfg.dmg.title += `_${JPN_Demo}`;

    env = env.replace('demo', '');
    if(env.length){
      cfg.nsis.shortcutName += `${env}`;
      cfg.dmg.title  += `${env}`;
    }
    if(os == '--win'){
      if(env.indexOf('stg') <0){
        //only live & win
        cfg.win.certificateFile = "./cert/win/mycert.pfx";
        cfg.win.certificatePassword = Win_Pass;
        cfg.win.signingHashAlgorithms  = ['sha256'];
        cfg.win.publisherName = "SHA256";
        cfg.win.timeStampServer = "http://timestamp.verisign.com/scripts/timstamp.dll";
      }
    }
  }if(env.indexOf('dev') >=0){          // dev  ----
    cfg.productName += `_${env}`;
    cfg.nsis.shortcutName += `_${env}`;
    cfg.dmg.title  += `_${env}`;
  }
  
  // output dir
  cfg.directories.output = `./build/v${pkg.version}_${pkg.devMode}/`;
}

/**
 * Macの場合、7Zipで圧縮されるが自動バージョンアップに問題発生する。
 * Zipで再圧縮する。
 */
function repack_osx(option){
  const outputDir = option.config.directories.output;
  
  // read original yml file.
  yaml.read( `${outputDir}${YML_MAC}`, {encoding: "utf8", schema: yaml.schema.defaultSafe}, function(err, yml){
    console.log(yml);

    // make zip file.
    let zipPath = `${outputDir}mac/${yml.path}`;
    let appPath = `${outputDir}mac/${option.config.productName}.app`;
    let ymlPath = `${outputDir}mac/${YML_MAC}`;
    
    console.log(`zipPath : ${zipPath}\nappPath : ${appPath}`);

    child.execFile('zip', ['-vr', zipPath, appPath], undefined, function (err, stdout, stderr) {
      // create hash
      const shasum = crypto.createHash('sha512');
      
      var rs = fs.ReadStream(zipPath);
      rs.on('data', function(d) { shasum.update(d); });
      rs.on('end', function() {
        var hash = shasum.digest('base64');
        console.log('hash : ' + hash);

        // write yml file.
        yml.sha512 = hash;
        yaml.write( ymlPath, yml, "utf8", function(err){
          // move files
          child.execFile('mv', ['-f', zipPath, outputDir]);
          child.execFile('mv', ['-f', ymlPath, outputDir]);

          console.log('build end.');
        });
      });
    })
  });  
}

/**
 * electron-build
 */
function build(option, os){  
  Builder.build(option)
  .then((args) => {
    if(os == '--mac'){
      repack_osx(option);
    }
    console.log("builder ok.\n", args)
  })
  .catch((error) => {
    console.log(error)
  })
};

/**
 * start package builder.
 */
(function(option){
  let instMode;
  let os = process.argv[2];

  instMode = (process.argv[3]!=undefined)?process.argv[3]:'update';

  console.log(`target os : ${os}`);
  console.log(`install mode : ${instMode}`);

  if(os == '--win'){
    if(!setInstallMode(option, instMode)){
      console.error('please select windows install mode.');
      return false;
    }
  }

  setBuildEnvironment(option, instMode, os);

  if(setBuildTarget(option, os)){
    console.log(option)
    build(option, os);
  }else{
    console.error('please select target os.');
  }
})(metaData);