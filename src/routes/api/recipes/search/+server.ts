import { error, json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ locals, request }) => {
	const body = await request.json();

	const take = body.take || 10;
	const skip = body.skip || 0;

	if (!body.term) {
		throw new Error('Invalid term parameter');
	}

	if (isNaN(skip) || isNaN(take)) {
		throw error(400, 'Invalid query parameters');
	}

	return json(
		locals.db.recipes.search({
			term: body.term,
			skip,
			take
		})
	);
};
