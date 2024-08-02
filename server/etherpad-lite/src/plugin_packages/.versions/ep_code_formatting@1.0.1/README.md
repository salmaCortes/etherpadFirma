An Etherpad plugin that allows formatting inline text as `code`.

# Installation

Run: `npm install ep_code_formatting`

Add the `"codeFormatting"` button to your `settings.json` toobar config at the desired position:

```
"toolbar": {
  "left": [
    ["bold", "italic", "underline", "strikethrough", "codeFormatting"],
    ...
```

Make sure the `toolbar` section is *not* commented out!

---

* Tested with Etherpad 1.8.4
* License: LGPLv3+
