<script lang="ts">
	import { onMount } from 'svelte';
	import type { Recipe } from '../app';
	import { resolveImage, resolveRecipeUrl } from '$lib/db';

	let recipes: Promise<Recipe[]>;
	onMount(() => {
		// Fetch in onMount
		recipes = fetch('/api/recipes?order=averageRating&sort=DESC').then((r) => r.json());
	});
</script>

{#if recipes}
	{#await recipes}
		<p>loading...</p>
	{:then recipes}
		<h1 class="text-4xl ml-4 mb-3">Top 10 by rating</h1>
		<div class="flex flex-wrap gap-4">
			{#each recipes as recipe}
				<div class="w-60 border-2 rounded-md p-1 px-2">
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
	{/await}
{/if}
