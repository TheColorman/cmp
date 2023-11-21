import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, url }) => {
	const ingredientID = url.searchParams.get('ingredientID');

	if (!ingredientID) {
		throw error(400, 'Invalid ingredientID parameter');
	}
	return json(locals.db.ingredients.unit(ingredientID));
};
