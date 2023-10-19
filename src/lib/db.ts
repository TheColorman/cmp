export function resolveImage(
	imagePath: string,
	params?: {
		c?: 'fill' | 'limit' | 'pad' | 'crop';
		f?: 'auto';
		fl?: 'progressive' | 'lossy';
		h?: number;
		q?: number | 'auto';
		w?: number;
	}
): string | undefined {
	const options = Object.entries(Object.assign({}, params))
		.map(([key, value]) => `${key}_${value}`)
		.join(',');

	return (
		'https://img.hellofresh.com/' + (options ? options + '/' : '') + 'hellofresh_s3' + imagePath
	);
}

export function resolveRecipeUrl(id: string, slug?: string): string {
	return 'https://hellofresh.dk/recipes/' + (slug || 'cmp') + '-' + id;
}
