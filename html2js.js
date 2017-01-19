'use strict';

var tlcompile = require('es6-templates');
var minify = require('html-minifier').minify;
var pathUtils = require('path');
var fs = require('fs');

module.exports = (function () {
  Html2Js.prototype.brunchPlugin = true;
  Html2Js.prototype.type = 'template';
  Html2Js.prototype.extension = 'tpl.html';

  Html2Js.prototype.compile = function (content, path, callback) {
    var options = this.options;
    var moduleName = normalizePath(pathUtils.relative(options.base, path));

    if (moduleName.indexOf('..') == -1) {
      this.moduleNames.push(`'${moduleName}'`);

      if (options.target === 'js') {
        return callback(null, compileTemplate(moduleName, content, options));
      } else {
        return callback(`Unknown target "${options.target}" specified`);
      }
    }

    return callback(null, null);
  };

  Html2Js.prototype.onCompile = function (generatedFiles) {
    return false;
  };

  function Html2Js(cfg) {
    cfg = cfg || {};
    this.options = {
      base: 'src',
      target: 'js',
      es5Safe: false,
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
  }

  function normalizePath(p) {
    if (pathUtils.sep !== '/')
      p = p.replace(/\\/g, '/');
    return p;
  }

  function compileTemplate(moduleName, content, options) {
    var contentModified = minify(content, options.htmlmin);
    contentModified = contentModified.replace(/\\/g, '\\\\');
    var module = 'module.exports = `' + contentModified + '`;';
    if (options.es5Safe)
      module = tlcompile.compile(module).code;
    return module;
  }

  return Html2Js;
}());