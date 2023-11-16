<script>
	import SidebarPlan from '$lib/components/SidebarPlan.svelte';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
</script>

<Header />
<div class="flex w-full justify-between p-0 m-0">
	<main class="w-full">
		<slot />
	</main>
	<SidebarPlan />
</div>
