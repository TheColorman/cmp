import Sqlite3Database from 'better-sqlite3';
import type { Handle } from '@sveltejs/kit';
import type { IngredientID, IngredientPartial, Recipe } from './app';

const db = new Sqlite3Database('src/lib/db.sqlite'); // no relative paths huh

function getRecipes({
	skip,
	take,
	order,
	sort
}: {
	skip: number;
	take: number;
	order?: string;
	sort: string;
}): Recipe[] {
	const query = `
	SELECT 
	  averageRating, description, difficulty, headline, id, imagePath, slug, name, prepTime, totalTime, recipeYield
	FROM recipes
	${order ? `ORDER BY ${order} ${sort}` : ''}
	LIMIT ? OFFSET ?
  `;
	const params: (string | number)[] = [take, skip];

	return db.prepare(query).all(params) as Recipe[];
}

function getRecipesWithIngredients({
	ingredients,
	requiredCount,
	skip,
	take,
	order,
	sort
}: {
	ingredients: IngredientID[];
	requiredCount?: number;
	skip: number;
	take: number;
	order?: string;
	sort: string;
}) {
	if (!ingredients.length) {
		return [];
	}
	if (!requiredCount) {
		requiredCount = ingredients.length;
	}
	const qeury = `
	SELECT
		r.averageRating, r.description, r.difficulty, r.headline, r.id, r.imagePath, r.slug, r.name, r.prepTime, r.totalTime, r.recipeYield
	FROM recipes r
	JOIN recipes_ingredients ri ON r.id = ri.recipeId
	WHERE ri.ingredientId IN (${ingredients.map(() => '?').join(',')})
	GROUP BY r.id
	HAVING COUNT(r.id) >= ?
	${order ? `ORDER BY ${order} ${sort}` : ''}
	LIMIT ? OFFSET ?
	`;
	const params: (string | number)[] = [...ingredients, requiredCount, take, skip];
	console.log(qeury, params);

	return db.prepare(qeury).all(params) as Recipe[];
}

function searchIngredients({
	term,
	skip,
	take
}: {
	term: string;
	skip: number;
	take: number;
}): IngredientPartial[] {
	const query = `
	SELECT
		ingredients.id,
		ingredients.slug,
		ingredients.type,
		ingredients.name,
		ingredients.internalName,
		ingredients.imagePath
	FROM ingredients_fts
	JOIN ingredients ON ingredients_fts.id = ingredients.id
	WHERE ingredients_fts MATCH ?
	LIMIT ? OFFSET ?
	`;
	const params: (string | number)[] = [`${term}*`, take, skip];

	return db.prepare(query).all(params) as IngredientPartial[];
}

export const dbHelpers = {
	recipes: {
		get: getRecipes,
		filter: {
			ingredients: getRecipesWithIngredients
		},
		collumns: [
			'averageRating',
			'description',
			'difficulty',
			'headline',
			'id',
			'imagePath',
			'slug',
			'name',
			'prepTime',
			'totalTime',
			'recipeYield'
		]
	},
	ingredients: {
		search: searchIngredients
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.db = dbHelpers;

	const response = await resolve(event);
	return response;
};
