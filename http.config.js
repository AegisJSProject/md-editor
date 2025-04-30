import { importmap, getImportmapScript, getImportmapIntegrity } from '@shgysk8zer0/importmap';

const integrity = await getImportmapIntegrity();
const csp = [
	'default-src \'self\'',
	`script-src 'self' https://unpkg.com/@shgysk8zer0/ https://unpkg.com/@aegisjsproject/ '${integrity}'`,
	'style-src \'self\' https://unpkg.com/@highlightjs/ https://unpkg.com/@aegisjsproject/',
	'img-src \'self\' https://cdn.kernvalley.us/img/',
	'trusted-types aegis-sanitizer#html',
	'require-trusted-types-for \'script\'',
].join('; ');

console.log(csp);

const style = sheet => `<link rel="stylesheet" href="${importmap.imports['@aegisjsproject/styles/']}css/${sheet}.css" crossorigin="anonymous" referrerpolicy="no-referrer" />`;

const script = `
import './md-editor.js';

const HTMLMarkdownEditorElement = customElements.get('md-editor');
const editor = new HTMLMarkdownEditorElement();
editor.name = 'content';
editor.id = 'content';
editor.textContent = history.state?.content;
editor.addEventListener('change', ({ target }) => history.replaceState({ content: target.value }, '', location.href), { passive: true });
document.querySelector('label[for="content"]').after(editor);
document.forms.post.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(event.target);
	document.getElementById('result').textContent = JSON.stringify(Object.fromEntries(data), null, 4);
	document.getElementById('popover').showPopover();
});
`;

const doc = `<!DOCTYPE html>
<html lang="en" dir="ltr">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width" />
		<meta name="color-scheme" content="light dark" />
		<title>@aegisjsproject/md-editor</title>
		${style('properties')}
		${style('reset')}
		${style('theme')}
		${style('button')}
		${style('misc')}
		${style('forms')}
		${style('scrollbar')}
		${style('animations')}
		${await getImportmapScript()}
		<script defer="" referrerpolicy="no-referrer" fetchpriority="high" crossorigin="anonymous" integrity="sha384-X8d55dt38lBIY87GNkg6Upb9pjtwYlhEoKtw9Sfsbj/XCDV4W+g0kdx4X1Bo/EaO" src="https://unpkg.com/@shgysk8zer0/polyfills@0.4.11/browser.min.js"></script>
		<script src="./index.js" type="module" referrerpolicy="no-referrer"></script>
	</head>
	<body>
		<form id="post">
			<fieldset class="no-border">
				<legend>Create a Post</legend>
				<div class="form-group">
					<label for="title" class="input-label required">Title</label>
					<input type="text" name="title" id="title" class="input" placeholder="Post Title" required />
				</div>
				<div class="form-group">
					<label for="content" class="input-label required">Content</label>
					<!-- MD Editor here -->
				</div>
			</fieldset>
			<div>
				<button type="submit" class="btn btn-success">Submit</button>
				<button type="reset" class="btn btn-danger">Reset</button>
			</div>
		</form>
		<div id="popover" popover="auto">
			<pre><code id="result"></code></pre>
		</div>
	</body>
</html>`;

const headers = new Headers({
	'Content-Type': 'text/html',
	'Content-Security-Policy': csp,
});

export default {
	routes: {
		'/': () => new Response(doc, { headers }),
		'/index.js': () => new Response(script, { headers: { 'Content-Type': 'application/javascript' }}),
	},
	port: 8123,
	open: true,
};
