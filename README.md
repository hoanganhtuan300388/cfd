# はっちゅう君CFD
CFDのリッチクライアントアプリ

## 推奨ver
- node.js v6.11.3
- npm 3.10.10

## ビルド準備
1. コードサイニングの準備
```bash
/GMOクリック/55 VSS/CFD/01_個別案件/2017年度/WR-10403 【CFD】CFD取引専用のPC用デスクトップアプリケーション開発依頼/05_受領資料/CFD開発環境構築マニュアル/配布モジュール構築手順.docx
```

## ビルド手順（mac編）
1. gitから落としてきたディレクトリへ移動
```bash
cd /Users/${USER_NAME}/hatchukunCFD
```

2. anlular-cliをインストール
```bash
sudo npm install -g angular-cli
```

3. tscをインストール
```bash
sudo npm install -g tsc
```

4. copyfilesをインストール
```bash
sudo npm install -g copyfiles
```

5. package.jsonのライブラリをインストール  
```bash
npm install
```

6. ビルド（検証・リアル）
```bash
npm run build:prod:stg
npm run dist:osx install
npm run dist:osx update
npm run dist:win install
npm run dist:win update
```

7. ビルド（検証・デモ）
```bash
npm run build:demo:stg
npm run dist:osx install
npm run dist:osx update
npm run dist:win install
npm run dist:win update
```

8. ビルド（本番・リアル）
```bash
npm run build:prod:real
npm run dist:osx install
npm run dist:osx update
npm run dist:win install
npm run dist:win update
```

9. ビルド（本番・デモ）
```bash
npm run build:demo:real
npm run dist:osx install
npm run dist:osx update
npm run dist:win install
npm run dist:win update
```

### 補足
ビルドで失敗する場合は、ビルドの前に
```bash
npm start
```
するとうまくいきます。

## ビルド手順（windows編） ※Windowsはいろいろめんどう＋下記手順では動かなくなっている可能性が大なので、macでのビルドを推奨します。
1. gitから落としてきたディレクトリへ移動
```bash
cd c://${指定してパス}/hatchukunCFD
```

2. ローカルのcntlmの動作確認
```
参考：http://infra-jira1:8090/pages/viewpage.action?pageId=2687632
```

3. proxy設定
- proxy設定は最初の1回だけ行えばいいです。
```bash
npm -g config set proxy http://127.0.0.1:3128
npm -g config set https-proxy http://127.0.0.1:3128
npm –g config set registry http://registry.npmjs.org
npm –g config set ca “”
npm –g config set strict-ssl false
npm config set proxy http://127.0.0.1:3128 
npm config set https-proxy http://127.0.0.1:3128
npm config set registry http://registry.npmjs.org
npm config set ca “”
```

4. anlular-cliをインストール
```bash
npm install -g angular-cli
```

5. tscをインストール
```bash
npm install -g tsc
```

6. copyfilesをインストール
```bash
npm install -g copyfiles
```

7. package.jsonのライブラリをインストール  
```bash
npm install
```

8. ビルド
```bash
npm run dist
```

### 補足
ビルドで失敗する場合は、ビルドの前に
```bash
npm start
```
するとうまくいきます。


## ローカルビルド手順
- リアル検証
```bash
npm run build:prod:stg
```
- デモ検証
```bash
npm run build:demo:stg
```
- スタート
```bash
npm run electron:start
```