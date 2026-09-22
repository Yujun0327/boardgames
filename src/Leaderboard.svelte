<script lang="ts">
  import { wallet } from './store.svelte'
</script>

{#if wallet.configured}
  <section class="ranking" aria-label="ranking">
    <h2>The ranking</h2>
    <p class="muted">Trophies come from wins only. Every game pays a few; bets pay more.</p>
    {#if !wallet.loaded}
      <p class="muted">Loading…</p>
    {:else if wallet.leaders.length === 0}
      <p class="muted">Nobody has won a game yet. Be first.</p>
    {:else}
      <ol>
        {#each wallet.leaders as row (row.id)}
          <li class:me={row.id === wallet.identity.id}>
            <span class="rank">#{row.rank}</span>
            <span class="who">{row.name || 'Guest'}</span>
            <span class="trophies">{row.trophies} 🏆</span>
            <span class="cash">{row.balance.toLocaleString()}</span>
          </li>
        {/each}
      </ol>
      {#if wallet.rank && wallet.rank > wallet.leaders.length}
        <p class="muted">You are #{wallet.rank}.</p>
      {/if}
    {/if}
  </section>
{/if}

<style>
  .ranking { margin-top: 3rem; border-top: 1px solid var(--line); padding-top: 1.6rem; }
  h2 { font-family: 'Fraunces', georgia, serif; font-weight: 620; margin: 0 0 0.3rem; font-size: 1.6rem; }
  .muted { color: var(--ink-soft); font-size: 0.85rem; margin: 0 0 1rem; }
  ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.3rem; max-width: 34rem; }
  li { display: grid; grid-template-columns: 3rem 1fr auto auto; gap: 1rem; align-items: baseline; padding: 0.35rem 0.6rem; border-radius: 6px; }
  li.me { background: rgb(58 53 39 / 0.08); }
  .rank { color: var(--ink-soft); font-size: 0.85rem; }
  .who { font-weight: 600; }
  .trophies { font-variant-numeric: tabular-nums; }
  .cash { color: var(--ink-soft); font-size: 0.85rem; font-variant-numeric: tabular-nums; }
</style>
