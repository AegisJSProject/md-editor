import { parse, createStyleSheet } from '@aegisjsproject/markdown';
import { registerComponent } from '@aegisjsproject/core/componentRegistry.js';
import { html } from '@aegisjsproject/core/parsers/html.js';
import { css } from '@aegisjsproject/core/parsers/css.js';
import { componentBase, componentDarkTheme, componentLightTheme } from '@aegisjsproject/styles/theme.js';
import { btn, btnSecondary, btnDanger } from '@aegisjsproject/styles/button.js';

const styles = css`:host(:not([hidden]):not([popover])) {
	display: inline-block;
}

:host {
	resize: both;
	overflow: scroll;
	font-size: 1rem;
}

#container, pre {
	max-width: 100%;
	overflow: auto;
}

#toolbar {
	position: sticky;
	top: 0;
	width: 100%;
	margin: 0;
	background-color: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(4px);
}

#toolbar > li {
	list-style: none;
	display: inline-block;
}

#editor, #viewer {
	min-height: 2em;
	padding: 0.8em;
}

#editor:empty::before {
	display: inline;
	content: "Enter markdown content here";
}

.icon {
	width: 1em;
	height: 1em;
	vertical-align: baseline;
}

@media (max-width: 800px) {
	.mobile-hidden {
		display: none;
	}
}`;

const template = html`<div id="container" part="container">
	<menu id="toolbar" role="toolbar" part="menubar" aria-label="Markdown Editor Views">
		<li>
			<button type="button" role="menuitem" id="editor-btn" class="btn btn-secondary" part="btn view-editor" data-mode="editor" title="Switch to Editor View" aria-label="Switch to Editor View" disabled="">
				<slot name="editor-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="12" height="16" viewBox="0 0 12 16" part="btn-icon" class="icon" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M8.5 1H1c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h10c.55 0 1-.45 1-1V4.5L8.5 1zM11 14H1V2h7l3 3v9zM5 6.98L3.5 8.5 5 10l-.5 1L2 8.5 4.5 6l.5.98zM7.5 6L10 8.5 7.5 11l-.5-.98L8.5 8.5 7 7l.5-1z"/>
					</svg>
				</slot>
				<span part="btn-label" class="mobile-hidden">
					<slot name="editor-label">Editor</slot>
				</span>
			</button>
		</li>
		<li>
			<button type="button" role="menuitem" id="viewer-btn" class="btn btn-secondary" part="btn view-viewer" data-mode="viewer" title="Switch to Viewer Mode" aria-label="Switch to Viewer Mode">
				<slot name="viewer-icon">
					<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" part="btn-icon" class="icon" fill="currentColor" aria-hidden="true">
						<path fill-rule="evenodd" d="M8.06 2C3 2 0 8 0 8s3 6 8.06 6C13 14 16 8 16 8s-3-6-7.94-6zM8 12c-2.2 0-4-1.78-4-4 0-2.2 1.8-4 4-4 2.22 0 4 1.8 4 4 0 2.22-1.78 4-4 4zm2-4c0 1.11-.89 2-2 2-1.11 0-2-.89-2-2 0-1.11.89-2 2-2 1.11 0 2 .89 2 2z"/>
					</svg>
				<span part="btn-label" class="mobile-hidden">
					<slot name="viewer-label">Viewer</slot>
				</span>
			</button>
		</li>
	</menu>
	<pre id="editor" part="editor" contenteditable="true" role="textarea"></pre>
	<div id="viewer" part="viewer" hidden=""></div>
</div>`;

class HTMLMarkdownEditorElement extends HTMLElement {
	#shadow = this.attachShadow({ mode: 'closed', delegatesFocus: true });
	#internals = this.attachInternals();
	#disabled = false;
	#hasUpdated = false;

	constructor() {
		super();

		this.#shadow.adoptedStyleSheets = [componentBase, componentLightTheme, componentDarkTheme, btn, btnSecondary, btnDanger, styles];
		this.#shadow.append(
			createStyleSheet('github', { media: '(prefers-color-scheme: light)' }),
			createStyleSheet('github-dark', { media: '(prefers-color-scheme: dark)' }),
			template.cloneNode(true)
		);

		this.#shadow.getElementById('toolbar').addEventListener('click', ({ target }) => {
			if (target.matches('button, button *')) {
				const btn = target.closest('button');
				this.mode = btn.dataset.mode;
			}
		});

		this.#editor.addEventListener('input', event => {
			const target = event.target;
			queueMicrotask(() => this.#setValue(target.innerText.trim()));
			this.#hasUpdated = true;
		}, { passive: true });

		this.addEventListener('blur', () => {
			if (this.#hasUpdated) {
				this.dispatchEvent(new Event('change'));
				this.#hasUpdated = false;
			}
		}, { passive: true });

		this.#internals.role = 'textbox';
		this.#internals.ariaMultiLine = 'true';

		this.addEventListener('focus', () => {
			if (this.mode !== 'editor') {
				this.mode = 'editor';
			}

			this.#editor.focus();
		}, { passive: true });
	}

	async attributeChangedCallback(attr, oldVal, newVal) {
		if (oldVal !== newVal) {
			const editor = this.#editor;
			const viewer = this.#viewer;

			switch(attr) {
				case 'mode':
					if (newVal === 'viewer') {
						await this.#render();
						editor.hidden = true;
						viewer.hidden = false;
						this.#internals.role = 'document';
						this.#internals.ariaMultiLine = 'false';
						this.#shadow.getElementById('viewer-btn').disabled = true;
						this.#shadow.getElementById('editor-btn').disabled = false;
						viewer.ariaLive = 'polite';
					} else {
						editor.hidden = false;
						viewer.hidden = true;
						this.#internals.role = 'textbox';
						this.#internals.ariaMultiLine = 'true';
						this.#shadow.getElementById('viewer-btn').disabled = false;
						this.#shadow.getElementById('editor-btn').disabled = true;
						viewer.ariaLive = null;
						editor.focus();
					}
					break;

				case 'required':
					if (typeof newVal === 'string' && this.value.length === 0) {
						this.#internals.setValidity({ valueMissing: true }, 'This is a required field.', this.#editor);
					}
					break;

				case 'readonly':
					this.#editor.contentEditable = (this.#disabled || typeof newVal === 'string') ? 'false' : 'true';
					break;
			}
		}
	}

	connectedCallback() {
		if (this.#editor.textContent.length === 0) {
			this.#getInitialValue();
		}
	}

	formDisabledCallback(disabled) {
		this.#disabled = disabled;
		this.#editor.contentEditable = (disabled || this.readOnly) ? 'false' : 'true';
	}

	formResetCallback() {
		if (! this.#getInitialValue()) {
			this.value = '';
		}
	}

	formStateRestoreCallback(value) {
		this.value = value;
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	set disabled(val) {
		this.toggleAttribute('disabled', val);
	}

	get form() {
		return this.#internals.form;
	}

	get labels() {
		return this.#internals.labels;
	}

	get maxLength() {
		if (this.hasAttribute('maxlength')) {
			return Math.max(parseInt(this.getAttribute('maxlength'), -1)) || -1;
		} else {
			return -1;
		}
	}

	set maxLength(val) {
		if (typeof val === 'string') {
			this.maxLength = parseInt(val);
		} else if (Number.isSafeInteger(val) && val > -1) {
			this.setAttribute('maxlength', val);
		} else {
			this.removeAttribute('maxlength');
		}
	}

	get minLength() {
		if (this.hasAttribute('minlength')) {
			return Math.max(parseInt(this.getAttribute('minlength'), 0)) || -1;
		} else {
			return -1;
		}
	}

	set minLength(val) {
		if (typeof val === 'string') {
			this.minLength = parseInt(val);
		} else if (Number.isSafeInteger(val) && val > -1) {
			this.setAttribute('minlength', val);
		} else {
			this.removeAttribute('minlength');
		}
	}

	get mode() {
		return this.getAttribute('mode') ?? 'editor';
	}

	set mode(val) {
		if (typeof val !== 'string') {
			this.removeAttribute('mode');
		} else if (! ['editor', 'viewer'].includes(val)) {
			throw new TypeError(`Invalid view option: "${val}".`);
		} else {
			this.setAttribute('mode', val);
		}
	}

	get name() {
		return this.getAttribute('name');
	}

	set name(val) {
		if (typeof val === 'string') {
			this.setAttribute('name', val);
		} else {
			this.removeAttribute('name');
		}
	}

	get readOnly() {
		return this.hasAttribute('readonly');
	}

	set readOnly(val) {
		this.toggleAttribute('readonly', val);
	}

	get required() {
		return this.hasAttribute('required');
	}

	set required(val) {
		this.toggleAttribute('required', val);
	}

	get validationMessage() {
		return this.#internals.validationMessage;
	}

	get validity() {
		return this.#internals.validity;
	}

	get value() {
		return this.#editor.innerText;
	}

	set value(val) {
		if (typeof val !== 'string') {
			throw new TypeError('Cannot set markdown content to non-string.');
		} else {
			this.#editor.innerText = val;
			this.#setValue(val);

			if (this.mode === 'viewer') {
				this.#render();
			}
		}
	}

	get willValidate() {
		return this.#internals.willValidate;
	}

	get html() {
		return parse(this.value);
	}

	get #editor() {
		return this.#shadow.getElementById('editor');
	}

	get #viewer() {
		return this.#shadow.getElementById('viewer');
	}

	checkValidity() {
		return this.#internals.checkValidity();
	}

	reportValidity() {
		return this.#internals.reportValidity();
	}

	toBlob({ lastModified } = {}) {
		return new Blob([this.value], { type: 'text/markdown', lastModified });
	}

	toFile(name, { lastModified } = {}) {
		return new File([this.value], name, { type: 'text/markdown', lastModified });
	}

	async importBlob(blob) {
		if (! (blob instanceof Blob)) {
			throw new TypeError('Cannot import from non-blob object.');
		} else {
			const md = await blob.text();
			this.value = md;
			return md;
		}
	}

	async #render() {
		await scheduler.yield();
		this.#viewer.replaceChildren(this.html);
	}

	#setValue(val) {
		this.#internals.setFormValue(val);
		const { required, minLength, maxLength } = this;
		const anchor = this.#editor;

		if (required && val.trim().length === 0) {
			this.#internals.setValidity({ valueMissing: true }, 'This is a required field.', anchor);
		} else if (val.length < minLength) {
			this.#internals.setValidity({ tooShort: true }, `This requires a length of at least ${minLength} characters`, anchor);
		} else if (maxLength > -1 && val.length > maxLength) {
			this.#internals.setValidity({ tooLong: true }, `This requires a length of at most ${maxLength} characters`, anchor);
		} else {
			this.#internals.setValidity({});
		}
	}

	#getInitialValue() {
		if (this.textContent.length !== 0) {
			const content = this.textContent.startsWith('\n') ? String.dedent(this.textContent).trim() : this.textContent.trim();
			this.#editor.textContent = content;
			this.#setValue(content);
			return true;
		} else {
			return false;
		}
	}

	static get formAssociated() {
		return true;
	}

	static get observedAttributes() {
		return ['mode', 'readonly', 'required'];
	}
}

registerComponent('md-editor', HTMLMarkdownEditorElement);
