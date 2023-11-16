<script lang="ts">
	import { onMount } from 'svelte';
	import type { IngredientYield, RecipePartial, Recipe } from '../../app';
	import { resolveImage, resolveRecipeUrl } from '$lib/db';
	import {
		recipes as recipesStore,
		ingredients as ingredientsStore,
		have as haveStore
	} from '$lib/stores/stores';
	import { goto } from '$app/navigation';

	let textsearch = '';
	let recipes: Promise<RecipePartial[]> | undefined;

	function search(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const term = e.currentTarget.value;
		if (!term) {
			recipes = undefined;
			return;
		}
		recipes =
			fetch('/api/recipes/search', {
				body: JSON.stringify({
					term
				}),
				method: 'POST'
			})
				.then((r) => r.json())
				.catch((e) => {}) || [];
	}

	async function selectRecipe(recipe: RecipePartial) {
		const ingredients = await fetch(`/api/recipe/ingredients?recipeId=${recipe.id}&yields=2`).then(
			(r) => r.json()
		);
		recipesStore.update((r) => [...r, recipe]);
		for (const ingredient of ingredients) {
			const index = $ingredientsStore.findIndex((i: IngredientYield) => i.id === ingredient.id);
			if (index === -1) {
				ingredientsStore.update((i: IngredientYield[]) => [...i, ingredient]);
				haveStore.update((h: number[]) => [...h, ingredient.amount]);
				continue;
			}
			$ingredientsStore[index].amount += ingredient.amount;
		}
		haveStore.update((h) => [...h, ...ingredients.map((i: IngredientYield) => 0)]);
	}
</script>

<div class="w-full flex flex-col text-center justify-center">
	<h2 class="text-lg font-medium">Search</h2>
	<br />
	<div class="w-full items-center justify-center flex my-5">
		<input
			type="text"
			placeholder="Search"
			class="input input-bordered"
			bind:value={textsearch}
			on:input={(e) => search(e)}
		/>
	</div>
	<br />
	<h1 class="text-4xl ml-4 mb-3">Top 10 results by rating</h1>
	{#if recipes}
		{#await recipes}
			<p>loading...</p>
		{:then recipes}
			{#if recipes.length === 0}
				<p>No results</p>
			{/if}
			<div class="flex flex-wrap gap-4">
				{#each recipes as recipe}
					<div class="w-60 border-2 rounded-md p-1 px-2 flex flex-col justify-between">
						<div>
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
						</div>
						<button class="btn btn-primary my-3" on:click={() => selectRecipe(recipe)}
							>Add to mealplan</button
						>
					</div>
				{/each}
			</div>
		{/await}
	{/if}
</div>
