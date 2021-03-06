// 大部分源自，create-react-app start
// https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/scripts/start.js
'use strict';
// 检测 node 版本
require('webpack-launcher-utils/checkNodeVersion')();

console.log('Starting the development server...');

process.env.NODE_ENV = 'development';
process.env.BABEL_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
// 脚本未知原因终止运行，需要提示错误
process.on('unhandledRejection', err => {
  // 解绑本地域名
  removeLocalHost(host, function() {
    throw err;
  });
});

const openBrowser = require('react-dev-utils/openBrowser');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const { choosePort } = require('react-dev-utils/WebpackDevServerUtils');
const {
  printDevServerInstructions,
  createWebpackCompiler,
} = require('webpack-launcher-utils/webpackLauncherUtils');
const setLocalHost = require('webpack-launcher-utils/setLocalHost');
const removeLocalHost = require('webpack-launcher-utils/removeLocalHost');
const createSigntSigtermProcessEvent = require('webpack-launcher-utils/createSigntSigtermProcessEvent');

const webpackConfig = require('../config/webpack.config');
const webpackLauncherConfig = require('../config/webpackLauncher.config');
const webpackDevServerConfig = require('../config/webpackDevServer.config');

let { host, port: defaultPort, https } = webpackLauncherConfig;

// 为 false 时，在后台执行，很多场景不需要持终端输出等。（使用 npm run start & 会在后台运行）
const isInteractive = process.stdout.isTTY;

function runDevServer(port) {
  const compiler = createWebpackCompiler(webpack, webpackConfig, function(isFirstCompile) {
    function openBrowserAndPrintInstructions(host, port, https) {
      const protocol = https ? 'https' : 'http';
      const localUrlForTerminal = `${protocol}://${host}:${port}`;
      if (isFirstCompile) {
        openBrowser(localUrlForTerminal);
      }
      if (isFirstCompile || isInteractive) {
        printDevServerInstructions({ localUrlForTerminal });
      }
    }
    setLocalHost(host, function(err) {
      if (err) {
        // 如果报错，直接使用默认的 localhost
        host = 'localhost';
      }
      openBrowserAndPrintInstructions(host, port, https);
    });
  });
  const devServer = new WebpackDevServer(compiler, webpackDevServerConfig);
  // 启动 WebpackDevServer.
  devServer.listen(port, err => {
    if (err) {
      return console.log(err);
    }
  });
  createSigntSigtermProcessEvent(function() {
    // ctr + c 退出等
    removeLocalHost(host, function() {
      devServer.close();
      process.exit();
    });
  });
}

// 只处理 localhost 上的端口
choosePort('localhost', defaultPort)
  .then(port => {
    runDevServer(port);
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
