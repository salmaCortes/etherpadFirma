exports.padInitToolbar = function (hook_name, args) {
    var toolbar = args.toolbar;

    var button = toolbar.button({
        command: "codeFormatting",
        localizationId: "ep_code_formatting.toolbar.title",
        class: "buttonicon ep_code_formatting buttonicon-code"
    });

    toolbar.registerButton("codeFormatting", button);
};
