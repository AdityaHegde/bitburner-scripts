<script lang="ts">
  import "../app.css";
  import { QueryClient, QueryClientProvider } from "@sveltestack/svelte-query";

  const client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retry: false,
        keepPreviousData: true,
      },
    },
  });
</script>

<main class="h-screen relative">
  <QueryClientProvider {client}>
    <slot />
  </QueryClientProvider>
</main>