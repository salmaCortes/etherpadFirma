'use strict';

const eejs = require('ep_etherpad-lite/node/eejs/');
const settings = require('ep_etherpad-lite/node/utils/Settings');

exports.eejsBlock_editbarMenuLeft = (hookName, args, cb) => {
    if (JSON.stringify(settings.toolbar).indexOf('lineSpacing') > -1) {
        return cb();
    }

    args.content += eejs.require('ep_line_spacing/templates/editbarButtons.ejs');
    return cb();
}

exports.padInitToolbar = (hookName, args, cb) => {
    const toolbar = args.toolbar;

    const lineSpacing = toolbar.selectButton({
        command: 'lineSpacing',
        localizationId: 'ep_line_spacing.toolbar.line.spacing',
        class: 'line-spacing-selection',
    });

    toolbar.registerButton('lineSpacing', lineSpacing);
    return cb();
}
