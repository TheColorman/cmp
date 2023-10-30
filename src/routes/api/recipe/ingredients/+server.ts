import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const recipeId = url.searchParams.get('recipeId');
	const yields = url.searchParams.get('yields');

	if (!recipeId) {
		throw error(400, 'Invalid recipeId parameter');
	}
	if (yields == null || (yields !== '2' && yields !== '4')) {
		throw error(400, 'Invalid yields parameter');
	}

	return json(locals.db.recipes.getIngredients(recipeId, parseInt(yields) as 2 | 4));
};
