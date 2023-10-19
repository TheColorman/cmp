import { error, json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = ({ locals, url }) => {
	const skip = Number(url.searchParams.get('skip') || 0);
	const take = Number(url.searchParams.get('take') || 10);

	const order = url.searchParams.get('order');
	const sort = url.searchParams.get('sort');

	if (isNaN(skip) || isNaN(take)) {
		throw error(400, 'Invalid query parameters');
	}

	if (order && !locals.db.recipes.collumns.includes(order)) {
		throw error(400, 'Invalid order parameter');
	}

	return json(
		locals.db.recipes.get({
			skip,
			take,
			order: order || undefined,
			sort: sort?.toLowerCase() === 'desc' ? 'DESC' : 'ASC'
		})
	);
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const body = await request.json();

	const skip = body.skip || 0;
	const take = body.take || 10;

	const order = body.order;
	const sort = body.sort;
	const ingredients = body.ingredients;
	const requiredCount = body.requiredCount;

	if (!Array.isArray(ingredients)) {
		throw error(400, 'Invalid ingredients parameter');
	}

	if (isNaN(skip) || isNaN(take)) {
		throw error(400, 'Invalid query parameters');
	}

	if (order && !locals.db.recipes.collumns.includes(order)) {
		throw error(400, 'Invalid order parameter');
	}

	return json(
		locals.db.recipes.filter.ingredients({
			ingredients,
			skip,
			take,
			order: order || undefined,
			sort: sort?.toLowerCase() === 'desc' ? 'DESC' : 'ASC',
			requiredCount: requiredCount
		})
	);
};
// function recipes();
