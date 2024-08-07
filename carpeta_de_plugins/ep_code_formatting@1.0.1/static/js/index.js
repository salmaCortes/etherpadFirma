'use strict';

exports.postToolbarInit = function (hookName, context) {
    var editbar = context.toolbar;
    editbar.registerAceCommand("codeFormatting", function(cmd, ace) {
      ace.ace_toggleAttributeOnSelection("codeFormatting");
    });
};

exports.aceAttribsToClasses = function(hookName, context) {
  if(context.key == "codeFormatting") {
    return ["codeFormatting"];
  }
};

exports.aceAttribClasses = function(hookName, attrs, callback) {
  attrs["codeFormatting"] = "codeFormatting";
  callback(attrs);
};

exports.aceCreateDomLine = function(hookName, context) {
  var cls = context.cls;

  if (cls && cls.split(" ").indexOf('codeFormatting') >= 0) {
    var modifier = {
      extraOpenTags: '<code>',
      extraCloseTags: '</code>',
      cls: cls
    };
    return [modifier];
  }
};

exports.collectContentPre = function(hookName, context) {
  if (context.cls && context.cls.split(" ").indexOf("codeFormatting") >= 0)
    context.cc.incrementAttrib(context.state, "codeFormatting");
};

exports.collectContentPost = function(hookName, context) {
  if (context.cls && context.cls.split(" ").indexOf("codeFormatting") >= 0)
    context.cc.decrementAttrib(context.state, "codeFormatting");
};

exports.aceSelectionChanged = function(hookName, context) {
  var shouldBeSelected = context.documentAttributeManager.hasAttributeOnSelectionOrCaretPosition("codeFormatting");
  var $formattingButton = parent.parent.$('[data-key="codeFormatting"]').find('a'); // XXX no better API available?
  $formattingButton.toggleClass('selected', shouldBeSelected);
};

exports.aceEditorCSS = function() {
  return ["ep_code_formatting/static/css/code.css"];
};
