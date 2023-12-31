<script lang="ts">
	import { onMount } from 'svelte';
	import type { IngredientYield, IngredientPartial, Recipe } from '../../app';
	import { resolveImage, resolveRecipeUrl } from '$lib/db';
	import {
		recipes as recipesStore,
		ingredients as ingredientsStore,
		have as haveStore
	} from '$lib/stores/stores';
	import { goto } from '$app/navigation';

	let textsearch = '';
	let ingredients: Promise<IngredientPartial[]> | undefined;

	function search(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const term = e.currentTarget.value;
		if (!term) {
			ingredients = undefined;
			return;
		}
		ingredients =
			fetch('/api/ingredients/search', {
				body: JSON.stringify({
					term
				}),
				method: 'POST'
			})
				.then((r) => r.json())
				.catch((e) => {}) || [];
	}

	let addedIngredients: IngredientPartial[] = [];
	function addIngredient(partial: IngredientPartial) {
		addedIngredients = [...addedIngredients, partial];
	}
	function removeIngredient(partial: IngredientPartial) {
		addedIngredients = addedIngredients.filter((i) => i.id !== partial.id);
	}
	let numIngredients = 1;

	let recipes: Promise<Recipe[]>;
	let fetched = 0;
	function searchRecipes(next?: boolean) {
		// Fetch in onMount
		const res = fetch('/api/recipes', {
			body: JSON.stringify({
				ingredients: addedIngredients.map((i) => i.id),
				requiredCount: numIngredients,
				skip: next ? fetched : 0,
				take: 10
			}),
			method: 'POST'
		}).then((r) => r.json()) as Promise<Recipe[]>;
		if (next) {
			recipes = new Promise(async (resolve) => {
				await recipes.then(async (r) => resolve([...r, ...(await res)]));
			});
		} else {
			fetched = 0;
			recipes = res;
		}
		fetched += 10;
	}

	async function selectRecipe(recipe: Recipe) {
		const ingredients = await fetch(`/api/recipe/ingredients?recipeId=${recipe.id}&yields=2`).then(
			(r) => r.json()
		);
		recipesStore.update((r) => [...r, recipe]);
		for (const ingredient of ingredients) {
			const index = $ingredientsStore.findIndex((i: IngredientYield) => i.id === ingredient.id);
			if (index === -1) {
				ingredientsStore.update((i: IngredientYield[]) => [...i, ingredient]);
				haveStore.update((h: number[]) => [...h, 0]);
				continue;
			}
			$ingredientsStore[index].amount += ingredient.amount;
		}
		haveStore.update((h) => [...h, ...ingredients.map((i: IngredientYield) => 0)]);

		goto(`/select`);
	}
</script>

<div class="w-full items-center justify-center flex my-5">
	<input
		type="text"
		placeholder="Search"
		class="input input-bordered"
		bind:value={textsearch}
		on:input={(e) => search(e)}
	/>
	<input
		type="range"
		min="1"
		max={addedIngredients.length}
		class="range w-64 mx-12"
		bind:value={numIngredients}
	/>
	<span>{numIngredients} required ingredients</span>
</div>
<div class="w-full flex text-center">
	<div class="w-1/2">
		<!-- <button class="btn btn-primary" on:click={() => send()}>Get recipes</button> -->
		<h2 class="text-lg font-medium">Search</h2>
		{#if ingredients}
			{#await ingredients}
				<p>loading...</p>
			{:then ingredients}
				<table class="w-full">
					<tbody>
						{#each ingredients as ingredient}
							<tr
								on:click={() => addIngredient(ingredient)}
								class="cursor-pointer hover:bg-gray-200"
							>
								<td>
									{#if ingredient.imagePath}
										<img
											src={resolveImage(ingredient.imagePath, {
												c: 'limit',
												w: 96,
												q: 'auto',
												f: 'auto',
												fl: 'lossy'
											})}
											alt={ingredient.name}
										/>
									{/if}
								</td>
								<td>
									{ingredient.name}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/await}
		{/if}
	</div>
	<div class="w-1/2">
		<h2 class="text-lg font-medium">Added ingredients</h2>
		<table class="w-full">
			<tbody>
				{#each addedIngredients as ingredient}
					<tr
						on:click={() => removeIngredient(ingredient)}
						class="cursor-pointer hover:bg-gray-200"
					>
						<td>
							{#if ingredient.imagePath}
								<img
									src={resolveImage(ingredient.imagePath, {
										c: 'limit',
										w: 96,
										q: 'auto',
										f: 'auto',
										fl: 'lossy'
									})}
									alt={ingredient.name}
								/>
							{/if}
						</td>
						<td>
							{ingredient.name}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<div class="w-full flex justify-center">
	<button class="btn btn-primary" on:click={() => searchRecipes()}>Find recipes</button>
</div>
{#if recipes}
	{#await recipes}
		<p>loading...</p>
	{:then recipes}
		{#if recipes.length === 0}
			<p>No recipes found</p>
		{/if}
		<div class="flex flex-wrap gap-4">
			{#each recipes as recipe}
				<div class="w-60 border-2 rounded-md p-1 px-2">
					<button on:click={() => selectRecipe(recipe)}>
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
					<a
						href={resolveRecipeUrl(recipe.id, recipe.slug)}
						target="_blank"
						rel="noopener noreferrer"
						class="link link-primary"
					>
						Full recipe
					</a>
				</div>
			{/each}
		</div>
		<button
			class="btn btn-primary"
			on:click={() => {
				searchRecipes(true);
				// Scroll to bottom of page
				setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 100);
			}}>More</button
		>
	{/await}
{/if}
