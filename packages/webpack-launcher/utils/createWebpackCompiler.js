'use strict';

const chalk = require('chalk');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const clearConsole = require('react-dev-utils/clearConsole');

// function handleCompile(err, stats) {
//   if (err || stats.hasErrors() || stats.hasWarnings()) {
//     process.exit(1);
//   } else {
//     process.exit(0);
//   }
// }

// 实际上，在 Node 中执行的进程我们可以通过 process.stdout.isTTY 这个属性来判断它是否在终端（terminal）终端环境中执行。
// 可能在后台执行，是不支持 chalk 终端颜色输出等。
const isInteractive = process.stdout.isTTY;

module.exports = function createCompiler(webpack, config, successCallback) {
  let compiler;
  try {
    compiler = webpack(config);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log();
    console.log(err.message || err);
    console.log();
    process.exit(1);
  }

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.hooks.invalid.tap('invalid', () => {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  let isFirstCompile = true;

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap('done', stats => {
    if (isInteractive) {
      clearConsole();
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    // We only construct the warnings and errors for speed:
    // https://github.com/facebook/create-react-app/issues/4492#issuecomment-421959548
    const messages = formatWebpackMessages(
      stats.toJson({ all: false, warnings: true, errors: true })
    );
    const isSuccessful = !messages.errors.length && !messages.warnings.length;
    if (isSuccessful) {
      // console.log(chalk.green('Compiled successfully!'));
      const countTime = (stats.endTime - stats.startTime) / 1000;
      successCallback && successCallback(isFirstCompile, countTime);
    }

    isFirstCompile = false;

    // If errors exist, only show errors.
    if (messages.errors.length) {
      // Only keep the first error. Others are often indicative
      // of the same problem, but confuse the reader with noise.
      if (messages.errors.length > 1) {
        messages.errors.length = 1;
      }
      console.log(chalk.red('Failed to compile.\n'));
      console.log(messages.errors.join('\n\n'));
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.\n'));
      console.log(messages.warnings.join('\n\n'));

      // Teach some ESLint tricks.
      console.log(
        '\nSearch for the ' +
          chalk.underline(chalk.yellow('keywords')) +
          ' to learn more about each warning.'
      );
      console.log(
        'To ignore, add ' + chalk.cyan('// eslint-disable-next-line') + ' to the line before.\n'
      );
    }
  });
  return compiler;
};