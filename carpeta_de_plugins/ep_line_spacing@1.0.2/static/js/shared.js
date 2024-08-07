'use strict';

const spacings = [
    'auto',
    '1.5',
    '2.5',
    '3.2',
    '6.4'
]

//I'm not sure what it does.

exports.collectContentPre = (hookName, context, cb) => {
    const tname = context.tname;
    const state = context.state;
    const lineAttributes = state.lineAttributes;
    const tagIndex = spacings.indexOf(tname);

    if(tagIndex >= 0) {
        lineAttributes.align = spacings[tagIndex];
    }
    return cb();
}

exports.collectContentPost = (hookName, context, cb) => {
    const tname = context.tname;
    const state = context.state;
    const lineAttributes = state.lineAttributes;
    const spacingsIndex = spacings.indexOf(tname);

    if(spacingsIndex >= 0) {
        delete lineAttributes.spacing
    }
    return cb();
}