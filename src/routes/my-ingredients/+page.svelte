<script lang="ts">
	import { resolveImage } from '$lib/db';
	import { have, ingredients } from '$lib/stores/stores';
	import type { IngredientPartial, YieldPartial } from '../../app';

	let textsearch = '';
	let ingredientSearch: Promise<IngredientPartial[]> | undefined;
	function search(
		e: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) {
		const term = e.currentTarget.value;
		if (!term) {
			ingredientSearch = undefined;
			return;
		}
		ingredientSearch =
			fetch('/api/ingredients/search', {
				body: JSON.stringify({
					term
				}),
				method: 'POST'
			})
				.then((r) => r.json())
				.catch((e) => {}) || [];
	}

	async function addIngredient(ingredient: IngredientPartial) {
		// Check if ingredient is already in list
		if ($ingredients.find((i) => i.id === ingredient.id)) {
			return;
		}
		// Get ingredient unit
		const { unit }: { unit: string } = await (
			await fetch(`/api/ingredients/unit?ingredientID=${ingredient.id}`)
		).json();
		console.log(unit);
		// Add ingredient to list
		const fullIngredient = {
			...ingredient,
			unit,
			amount: 0
		} as IngredientPartial & YieldPartial;
		ingredients.update((i: (IngredientPartial & YieldPartial)[]) => [...i, fullIngredient]);
		have.update((h: number[]) => [...h, 0]);

		// Clear search
		textsearch = '';
		ingredientSearch = undefined;
	}
	async function removeIngredient(ingredient: IngredientPartial) {
		const index = $ingredients.findIndex((i) => i.id === ingredient.id);
		ingredients.update((i: (IngredientPartial & YieldPartial)[]) => [
			...i.slice(0, index),
			...i.slice(index + 1)
		]);
		have.update((h: number[]) => [...h.slice(0, index), ...h.slice(index + 1)]);
	}
</script>

<div class="relative w-full flex flex-col items-center">
	<h1>Add ingredient</h1>
	<input
		type="text"
		placeholder="Search"
		class="input input-bordered"
		bind:value={textsearch}
		on:input={(e) => search(e)}
	/>
	{#if ingredientSearch}
		<div class="absolute bg-white border-2 rounded-md p-4 gap-2 top-20">
			{#await ingredientSearch}
				...loading
			{:then ingredients}
				{#if ingredients.length === 0}
					No results
				{/if}
				{#each ingredients as ingredient}
					<button
						class="flex space-x-4 items-center border-t-2 hover:bg-slate-200 w-full"
						on:click={() => addIngredient(ingredient)}
					>
						{ingredient.name}
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
					</button>
				{/each}
			{/await}
		</div>
	{/if}
</div>
<table class="w-full">
	<thead>
		<tr>
			<th>Image</th>
			<th>Name</th>
			<th>Amount</th>
		</tr>
	</thead>
	<tbody>
		{#each $ingredients as ingredient, i}
			<tr
				on:click={() => {
					removeIngredient(ingredient);
				}}
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
				<td>
					<input type="number" class="input input-primary" bind:value={$have[i]} />
					{ingredient.unit}
				</td>
			</tr>
		{/each}
	</tbody>
</table>
