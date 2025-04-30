import terser from '@rollup/plugin-terser';
import { rollupImport } from '@shgysk8zer0/rollup-import';
import { importmap } from '@shgysk8zer0/importmap';

export default [{
	input: 'md-editor.js',
	plugins: [terser(), rollupImport(importmap)],
	output: [{
		file: 'md-editor.cjs',
		format: 'cjs',
	}, {
		file: 'md-editor.min.js',
		format: 'module',
		sourcemap: true,
	}],
}];
