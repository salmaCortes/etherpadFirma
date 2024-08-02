'use strict';

//Row spacing height
const spacings = ['auto', '1.5', '2.5', '3.2', '6.4']

const range = (start, end) => Array.from(
    Array(Math.abs(end - start) + 1),
    (_, i) => start + i
);

// Bind the event handler to the toolbar buttons
exports.postAceInit = (hookName, context) => {
    const lineSelection = $('#line-spacing, select.line-spacing-selection');

    lineSelection.on('change', function () {
        const value = $(this).val();

        context.ace.callWithAce((ace) => {
            ace.ace_lineSpacing(value); 
        }, 'insertSpacingHeight', true);
    })
}

//function extension
exports.aceInitialized = (hookName, context) => { 
    context.editorInfo.ace_lineSpacing = (level) => { 
        const rep = context.rep;
        const documentAttributeManager = context.documentAttributeManager;

        if (!(rep.selStart && rep.selEnd) || (level >= 0 && spacings[level] === undefined)) {
            return;
        }

        const firstLine = rep.selStart[0];
        const lastLine = Math.max(firstLine, rep.selEnd[0] - ((rep.selEnd[1] === 0) ? 1 : 0));

        range(firstLine, lastLine).forEach((i) => {
            if (level >= 0) {
                documentAttributeManager.setAttributeOnLine(i, 'lineHeight', spacings[level]);
            } else {
                documentAttributeManager.removeAttributeOnLine(i, 'lineHeight');
            }
        });
    }
}

//return html tag
exports.aceDomLineProcessLineAttributes = (name, context) => {
    const cls = context.cls;
    const lineSpacingType = /(?:^| )lineHeight:([A-Za-z.0-9]*)/.exec(cls);
    let tagIndex;

    if (lineSpacingType !== null && lineSpacingType.length >= 0) {
        tagIndex = spacings.indexOf(lineSpacingType[1]);
    } else {
        return;
    }

    if (tagIndex !== undefined && tagIndex >= 0) {
        const tag = spacings[tagIndex];
        const styles =
            `width:100%;margin:0 auto;list-style-position:inside;display:block;line-height:${tag}`;
        const modifier = {
            preHtml: `<lineHeight-${tag} style="${styles}">`, //ex  lineHeight-6.4, lineHeight-auto
            postHtml: `</lineHeight-${tag}>`,
            processedMarker: true,
        };
        return [modifier];
    }
    return [];
};

//lineHeight class
exports.aceAttribsToClasses = (hookName, context) => {
    if (context.key === 'lineHeight') {
        return [`lineHeight:${context.value}`];
    } else {
        return;
    }
}