# `@aegisjsproject/md-editor`

A custom Markdown editor component with preview as a form input element

[![CodeQL](https://github.com/AegisJSProject/md-editor/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/AegisJSProject/md-editor/actions/workflows/codeql-analysis.yml)
![Node CI](https://github.com/AegisJSProject/md-editor/workflows/Node%20CI/badge.svg)
![Lint Code Base](https://github.com/AegisJSProject/md-editor/workflows/Lint%20Code%20Base/badge.svg)

[![GitHub license](https://img.shields.io/github/license/AegisJSProject/md-editor.svg)](https://github.com/AegisJSProject/md-editor/blob/master/LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/AegisJSProject/md-editor.svg)](https://github.com/AegisJSProject/md-editor/commits/master)
[![GitHub release](https://img.shields.io/github/release/AegisJSProject/md-editor?logo=github)](https://github.com/AegisJSProject/md-editor/releases)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/shgysk8zer0?logo=github)](https://github.com/sponsors/shgysk8zer0)

[![npm](https://img.shields.io/npm/v/@aegisjsproject/md-editor)](https://www.npmjs.com/package/@aegisjsproject/md-editor)
![node-current](https://img.shields.io/node/v/@aegisjsproject/md-editor)
![npm bundle size gzipped](https://img.shields.io/bundlephobia/minzip/@aegisjsproject/md-editor)
[![npm](https://img.shields.io/npm/dw/@aegisjsproject/md-editor?logo=npm)](https://www.npmjs.com/package/@aegisjsproject/md-editor)

[![GitHub followers](https://img.shields.io/github/followers/AegisJSProject.svg?style=social)](https://github.com/AegisJSProject)
![GitHub forks](https://img.shields.io/github/forks/AegisJSProject/md-editor.svg?style=social)
![GitHub stars](https://img.shields.io/github/stars/AegisJSProject/md-editor.svg?style=social)
[![Twitter Follow](https://img.shields.io/twitter/follow/shgysk8zer0.svg?style=social)](https://twitter.com/shgysk8zer0)

[![Donate using Liberapay](https://img.shields.io/liberapay/receives/shgysk8zer0.svg?logo=liberapay)](https://liberapay.com/shgysk8zer0/donate "Donate using Liberapay")
- - -

- [Code of Conduct](./.github/CODE_OF_CONDUCT.md)
- [Contributing](./.github/CONTRIBUTING.md)
<!-- - [Security Policy](./.github/SECURITY.md) -->
## Installation

### Node Instructions
```bash
npm i @aegisjsproject/md-editor
```

### Using [`<script type="importmap">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) and a CDN

```html
<script type="importmap">
  {
    "imports": {
      "@aegisjsproject/md-editor": "https://unpkg.com/@aegisjsproject/md-editor@1.0.0/md-editor.min.js"
    }
  }
</script>
```

### Just Using a `<script>`

```html
<script src="https://unpkg.com/@aegisjsproject/md-editor@1.0.0/md-editor.min.js" crossorigin="anonymous" referrerpolicy="no-referrer" defer=""></script>
```

## Example Usage

### Just using HTML

```html
<form id="post">
  <label for="content">Content</label>
  <!-- This behaves basically like a textarea or any input -->
  <md-editor name="content" id="content" minlength="40" mode="editor" required="">
    # Hello, World!
    ![foo](/img/foo.png)
  </md-editor>
  <!-- Rest of form stuff -->
</form>
```

### Creating through Scripting

```js
// Need to import if not already added
import '@aegisjsproject/md-editor';

// Get the component class
const HTMLMarkdownEditorElement = customElements.get('md-editor');

// Create and setup the element
const editor = new HTMLMarkdownEditorElement();
editor.name = 'content';
editor.id = 'content';

// Optionally bind to `history.state[whatever]
editor.textContent = history.state?.content;
editor.addEventListener('change', ({ target }) => history.replaceState({ content: target.value }, '', location.href), { passive: true });

// Add to the form, after its `<label>`
document.querySelector(`label[for="${editor.id}"]`).after(editor);
```

## Usage Notes and Browser APIs

This component utilizes some proposed and experimental APIs including `Element.prototype.setHTML` (this [Sanitizer API](https://github.com/WICG/sanitizer-api))
and [`String.dedent`](https://github.com/tc39/proposal-string-dedent). These APIs **MUST** be polyfilled. You may find
the required polyfills in [`@shgysk8zer0/polyfills`](https://npmjs.com/package/@shgysk8zer0/polyfills) or provide your own.

## Security

Like all `@aegisjsproject` libraries, this component is indended to be safe and compatible in highly secure contexts. It
is designed to work with a very restricted [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
as well as [the Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API).

### Example CSP

Note the [SRI](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/SRI) Integrity used
for a `<script type="importmap">` and the Trusted Types Policy of `aegis-sanitizer#html` (required for the Sanitizer API polyfill).

```
Content-Security-Policy: default-src 'self'; script-src 'self' https://unpkg.com/@shgysk8zer0/ https://unpkg.com/@aegisjsproject/ 'sha384-XYouuKGvd2BSrapxPZFWENl9b0loR7EVyC2cls6tQ/Oa+3R/uWw6TQ+nWa4/zt9l'; style-src 'self' https://unpkg.com/@highlightjs/ https://unpkg.com/@aegisjsproject/; img-src 'self'; trusted-types aegis-sanitizer#html; require-trusted-types-for 'script';
```
