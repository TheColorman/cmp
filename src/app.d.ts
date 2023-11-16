import { dbHelpers } from './hooks.server';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: typeof dbHelpers;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

type RecipeID = string;
export type Recipe = {
	averageRating?: number;
	description?: string;
	difficulty?: number;
	headline?: string;
	id: RecipeID;
	imagePath?: string;
	slug?: string;
	name?: string;
	prepTime?: string;
	totalTime?: string;
	recipeYield?: string;
};

export type IngredientID = string;
export type Ingredient = {
	id: IngredientID;
	uuid: string;
	slug: string;
	type: string;
	country: string;
	imageLink?: string;
	imagePath?: string;
	name: string;
	internalName?: string;
	shipped: boolean;
	description?: string;
	usage: number;
	hasDuplicatedName?: boolean;
	allergens: AllergenID[];
	family: Family;
};
export type IngredientPartial = {
	id: IngredientID;
	slug: string;
	type: string;
	name: string;
	internalName?: string;
	imagePath?: string;
};

export type RecipePartial = {
	id: RecipeID;
	description?: string;
	headline?: string;
	name?: string;
	seoDescription?: string;
	slug?: string;
	imagePath?: string;
};

export type YieldPartial = {
	amount: number;
	unit: string;
};

export type IngredientYield = IngredientPartial & YieldPartial;

export {};
