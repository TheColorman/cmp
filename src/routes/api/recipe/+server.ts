import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const recipeId = url.searchParams.get('recipeId');

	if (!recipeId) {
		throw error(400, 'Invalid recipeId parameter');
	}

	return json(locals.db.recipes.get(recipeId));
};
