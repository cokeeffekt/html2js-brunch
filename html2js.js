'use strict';

var minify = require('html-minifier').minify;
var pathUtils = require('path');
var fs = require('fs');

module.exports = function() {
  Html2Js.prototype.brunchPlugin = true;
  Html2Js.prototype.type = 'template';
  Html2Js.prototype.extension = 'tpl.html';

  Html2Js.prototype.compile = function(content, path, callback) {
    var options = this.options;
    var moduleName = normalizePath(pathUtils.relative(options.base, path));

    if (moduleName.indexOf('..') == -1) {
      this.moduleNames.push("'" + moduleName + "'");

      if (options.target === 'js') {
        return callback(null, compileTemplate(moduleName, content, options.htmlmin));
      } else {
        return callback('Unknown target "' + options.target + '" specified');
      }
    }

    return callback(null, null);
  };

  Html2Js.prototype.onCompile = function(generatedFiles) {
    return false;
  };

  function Html2Js(cfg) {
    cfg = cfg || {};
    this.options = {
      base: 'src',
      target: 'js',
      htmlmin: {}
    };
    this.joinTo = cfg.files ? cfg.files.templates.joinTo : null;
    this.publicPath = cfg.paths ? cfg.paths.public : null;
    this.moduleNames = [];

    var config = cfg.plugins && cfg.plugins.html2js;
    if (config) {
      var options = config.options || {};

      for (var key in options) {
        if (options.hasOwnProperty(key)) {
          this.options[key] = options[key];
        }
      }
    }
  };

  function normalizePath(p) {
    if (pathUtils.sep !== '/')
      p = p.replace(/\\/g, '/');
    return p;
  }

  function getContent(content, htmlmin) {
    console.log('Before', Buffer.byteLength(content, 'utf8'));
    content = minify(content, htmlmin || {});
    var escp = JSON.stringify(content).replace(/(^\"|\"$)/igm, '').replace(/\\n\s*/igm, '\\n ');
    return escp;
  }

  function compileTemplate(moduleName, content, htmlmin) {
    var contentModified = getContent(content, htmlmin);
    var module = '  module.exports = `' + contentModified + '`;';
    return module;
  }

  return Html2Js;
}();
