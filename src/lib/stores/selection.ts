import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { IngredientPartial, Recipe, YieldPartial } from '../../app';

const recipesDefault: Recipe[] = [];
const ingredientsDefault: (IngredientPartial & YieldPartial)[] = [];
const haveDefault: number[] = [];

const recipesInitial = browser
	? JSON.parse(localStorage.getItem('selection_recipes') || 'null') ?? recipesDefault
	: recipesDefault;
const ingredientsInitial = browser
	? JSON.parse(localStorage.getItem('selection_ingredients') || 'null') ?? ingredientsDefault
	: ingredientsDefault;
const haveInitial = browser
	? JSON.parse(localStorage.getItem('selection_have') || 'null') ?? haveDefault
	: haveDefault;

const recipes = writable<Recipe[]>(recipesInitial);
const ingredients = writable<(IngredientPartial & YieldPartial)[]>(ingredientsInitial);
const have = writable<number[]>(haveInitial);

recipes.subscribe((value) => {
	if (browser) {
		localStorage.setItem('selection_recipes', JSON.stringify(value));
	}
});
ingredients.subscribe((value) => {
	if (browser) {
		localStorage.setItem('selection_ingredients', JSON.stringify(value));
	}
});
have.subscribe((value) => {
	if (browser) {
		localStorage.setItem('selection_have', JSON.stringify(value));
	}
});

export { recipes, ingredients, have };
