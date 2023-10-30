<script lang="ts">
	import type { Recipe, IngredientYield } from '../../app';
	import { resolveImage, resolveRecipeUrl } from '$lib/db';
	import { recipes, ingredients, have } from '$lib/stores/selection';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	if ($have.length !== $ingredients.length) {
		have.update((h: number[]) => h.slice(0, $ingredients.length));
		have.update((h: number[]) => [...h, ...Array($ingredients.length - h.length).fill(0)]);
	}

	if ($recipes.length === 0 && browser) {
		goto('/find');
	}

	$: left = $ingredients.map((i, index) => $have[index] - i.amount);
	$: numLeft = left.filter((l) => l > 0).length;

	let numIngredients = 1;

	let recipesSearch: Promise<Recipe[]>;
	function searchRecipes(next?: boolean) {
		const wantedIngredients = $ingredients.filter((_, i) => left[i] > 0);
		// Fetch in onMount
		const res = fetch('/api/recipes', {
			body: JSON.stringify({
				ingredients: wantedIngredients.map((i) => i.id),
				requiredCount: numIngredients,
				skip: 0,
				take: 10
			}),
			method: 'POST'
		}).then((r) => r.json()) as Promise<Recipe[]>;
		recipesSearch = res;
	}

	async function addRecipe(recipe: Recipe) {
		recipes.update((r: Recipe[]) => [...r, recipe]);
		const recipeIngredients: IngredientYield[] = await fetch(
			`/api/recipe/ingredients?recipeId=${recipe.id}&yields=2`
		).then((r) => r.json());
		for (const ingredient of recipeIngredients) {
			const index = $ingredients.findIndex((i) => i.id === ingredient.id);
			if (index === -1) {
				ingredients.update((i: IngredientYield[]) => [...i, ingredient]);
				have.update((h: number[]) => [...h, 0]);
				continue;
			}
			$ingredients[index].amount += ingredient.amount;
		}
	}
	async function removeRecipe(recipe: Recipe) {
		const index = $recipes.findIndex((r: Recipe) => r.id === recipe.id);
		recipes.update((r: Recipe[]) => [...r.slice(0, index), ...r.slice(index + 1)]);
		const recipeIngredients: IngredientYield[] = await fetch(
			`/api/recipe/ingredients?recipeId=${recipe.id}&yields=2`
		).then((r) => r.json());
		for (const ingredient of recipeIngredients) {
			const index = $ingredients.findIndex((i) => i.id === ingredient.id);
			$ingredients[index].amount -= ingredient.amount;
			if ($ingredients[index].amount <= 0) {
				ingredients.update((i: IngredientYield[]) => [...i.slice(0, index), ...i.slice(index + 1)]);
				have.update((h: number[]) => [...h.slice(0, index), ...h.slice(index + 1)]);
			}
		}
	}
</script>

<div class="flex gap-4">
	{#each $recipes as recipe}
		<div class="w-60 border-2 rounded-md p-1 px-2 relative">
			<button
				class="btn btn-error absolute w-6 h-6 py-1 px-0 right-1 min-h-0"
				on:click={() => removeRecipe(recipe)}>X</button
			>
			<a href={resolveRecipeUrl(recipe.id, recipe.slug)} target="_blank" rel="noreferrer">
				<h2 class="font-bold">
					{recipe.name}
				</h2>
				<p class="font-thin">{recipe.headline}</p>
				{#if recipe.imagePath}
					<img
						src={resolveImage(recipe.imagePath, {
							c: 'fill',
							f: 'auto',
							fl: 'lossy',
							h: 200,
							w: 300,
							q: 'auto'
						})}
						alt="food"
						class="rounded-b-md"
					/>
				{/if}
			</a>
		</div>
	{/each}
</div>
{#each $ingredients as ingredient, i}
	<input type="number" class="input input-bordered w-20" bind:value={$have[i]} />
	{ingredient.name} - {ingredient.amount}
	{ingredient.unit}
	<span class="ml-4"
		>{left[i]}
		{ingredient.unit} til overs</span
	>
	<br />
{/each}

<div class="w-screen flex justify-center items-center">
	<div class="flex flex-col items-center">
		<input
			type="range"
			min="1"
			max={numLeft}
			class="range w-64 mx-12"
			bind:value={numIngredients}
		/>
		<span class="mr-5 -ml-10"
			>Find recipe with {numIngredients} required ingredients out of {numLeft} leftovers</span
		>
	</div>
	<button class="btn btn-primary" on:click={() => searchRecipes()}>Find recipe</button>
</div>

{#if recipesSearch}
	{#await recipesSearch}
		loading...
	{:then recipesSearch}
		<div class="flex flex-wrap gap-4">
			{#each recipesSearch as recipe}
				<div class="w-60 border-2 rounded-md p-1 px-2">
					<button on:click={() => addRecipe(recipe)}>
						<h2 class="font-bold">
							{recipe.name}
						</h2>
						<p class="font-thin">{recipe.headline}</p>
						{#if recipe.imagePath}
							<img
								src={resolveImage(recipe.imagePath, {
									c: 'fill',
									f: 'auto',
									fl: 'lossy',
									h: 200,
									w: 300,
									q: 'auto'
								})}
								alt="food"
								class="rounded-b-md"
							/>
						{/if}
					</button>
				</div>
			{/each}
		</div>
	{/await}
{/if}
