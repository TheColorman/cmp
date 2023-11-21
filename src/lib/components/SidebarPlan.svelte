<script lang="ts">
	import type { Recipe, IngredientYield } from '../../app';
	// import { resolveImage, resolveRecipeUrl } from '$lib/db';
	import { recipes, ingredients, have } from '$lib/stores/stores';
	// import { goto } from '$app/navigation';
	// import { browser } from '$app/environment';

	let open = true;

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

<button
	class="text-gray-500 hover:text-gray-700 cursor-pointer mr-4 border-none focus:outline-none absolute right-0 mt-5"
	class:open
	on:click={() => (open = !open)}
>
	<svg width="32" height="24">
		<line id="top" x1="0" y1="2" x2="32" y2="2" />
		<line id="middle" x1="0" y1="12" x2="32" y2="12" />
		<line id="bottom" x1="0" y1="22" x2="32" y2="22" />
	</svg>
</button>
<aside class=" w-1/3 right-0 hidden border-2 rounded-md p-5" class:open>
	<a href="/select" class="link link-accent">Manage mealplan</a><br />
	<strong>Recipes:</strong>
	<ul>
		{#each $recipes as recipe}
			<li>
				{recipe.name}
				<button
					class="btn btn-error w-6 h-6 py-1 px-0 right-1 min-h-0"
					on:click={() => removeRecipe(recipe)}>X</button
				>
			</li>
		{/each}
	</ul>
	<br />
	<strong>Shopping list:</strong>
	<table>
		<thead>
			<tr>
				<th>Ingredient</th>
				<th>Required</th>
				<th>Have</th>
				<th>Left</th>
			</tr>
		</thead>
		<tbody>
			{#each $ingredients as ingredient, i}
				<tr class="border-2 border-gray-400">
					<td class="border-[1px] border-gray-500 px-1">{ingredient.name}</td>
					<td class="border-[1px] border-gray-500 px-1">{ingredient.amount} {ingredient.unit}</td>
					<td class="border-[1px] border-gray-500 px-1">
						<input type="number" class="w-20" bind:value={$have[i]} />
					</td>
					<td class="border-[1px] border-gray-500 px-1"
						>{$have[i] - ingredient.amount} {ingredient.unit}</td
					>
				</tr>
			{/each}
		</tbody>
	</table>
</aside>

<style>
	aside.open {
		@apply block;
	}

	svg {
		min-height: 24px;
		transition: transform 0.3s ease-in-out;
	}

	svg line {
		stroke: currentColor;
		stroke-width: 3;
		transition: transform 0.3s ease-in-out;
	}

	button {
		z-index: 20;
	}

	.open svg {
		transform: scale(0.7);
	}

	.open #top {
		transform: translate(6px, 0px) rotate(45deg);
	}

	.open #middle {
		opacity: 0;
	}

	.open #bottom {
		transform: translate(-12px, 9px) rotate(-45deg);
	}
</style>
