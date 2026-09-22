<script lang="ts">
  import { DAILY_CASH } from '@yujun/game-net/wallet'
  import { wallet } from './store.svelte'

  let showLink = $state(false)
  let pasteOpen = $state(false)
  let pasted = $state('')
  let pasteError = $state('')
  let copied = $state(false)

  $effect(() => {
    void wallet.init()
  })

  const nextClaim = $derived(
    wallet.nextClaimAt > Date.now()
      ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }).format(wallet.nextClaimAt)
      : null,
  )

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(wallet.linkCode())
      copied = true
      setTimeout(() => (copied = false), 1600)
    } catch {
      /* the code is visible anyway */
    }
  }

  function submitPaste() {
    pasteError = wallet.adopt(pasted) ?? ''
  }
</script>

<section class="wallet" aria-label="your wallet">
  {#if !wallet.configured}
    <p class="muted">The shared wallet is not switched on for this build yet.</p>
  {:else}
    <div class="row">
      <label class="name">
        <span class="label">Playing as</span>
        <input type="text" maxlength="32" value={wallet.name} placeholder="your name" onchange={(e) => wallet.rename((e.target as HTMLInputElement).value)} />
      </label>
      <div class="stat">
        <span class="label">Cash</span>
        <span class="value">{(wallet.profile?.balance ?? 0).toLocaleString()}</span>
      </div>
      <div class="stat">
        <span class="label">Trophies</span>
        <span class="value">{wallet.profile?.trophies ?? 0}</span>
      </div>
      <div class="stat">
        <span class="label">Rank</span>
        <span class="value">{wallet.rank ? `#${wallet.rank}` : '—'}</span>
      </div>
    </div>
    <div class="row actions">
      <button class="btn primary" disabled={!wallet.canClaim} onclick={() => wallet.claim()}>
        {nextClaim ? `Collected · next ${nextClaim} KST` : `Collect today's ${DAILY_CASH.toLocaleString()}`}
      </button>
      <button class="btn" onclick={() => (showLink = !showLink)}>{showLink ? 'Hide link code' : 'Link another device'}</button>
      <button class="btn" onclick={() => (pasteOpen = !pasteOpen)}>Enter a link code</button>
    </div>
    {#if wallet.notice}<p class="notice">{wallet.notice}</p>{/if}
    {#if showLink}
      <div class="link">
        <p class="muted">Type or scan this on your other phone. Anyone with it can play as you, so keep it private.</p>
        <code>{wallet.linkCode()}</code>
        <button class="btn" onclick={copyCode}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
    {/if}
    {#if pasteOpen}
      <div class="link">
        <p class="muted">Paste the code from your other device. This browser will switch to that wallet.</p>
        <input type="text" bind:value={pasted} placeholder="link code" />
        <button class="btn" onclick={submitPaste}>Use this wallet</button>
        {#if pasteError}<p class="notice">{pasteError}</p>{/if}
      </div>
    {/if}
  {/if}
</section>

<style>
  .wallet {
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 1.1rem 1.3rem;
    margin-bottom: 2.4rem;
    background: rgb(255 255 255 / 0.35);
    box-shadow: 0 2px 6px rgb(58 53 39 / 0.12);
  }
  .row { display: flex; flex-wrap: wrap; gap: 1.2rem 2rem; align-items: flex-end; }
  .actions { margin-top: 0.9rem; gap: 0.6rem; }
  .label { display: block; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-soft); }
  .value { font-family: 'Fraunces', georgia, serif; font-size: 1.6rem; line-height: 1.1; }
  .name input, .link input {
    font: inherit; background: transparent; border: none; border-bottom: 1px solid var(--line);
    color: var(--ink); padding: 0.2rem 0; min-width: 11rem;
  }
  .name input:focus-visible, .link input:focus-visible { outline: none; border-bottom-color: var(--ink); }
  .btn {
    font: inherit; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.45rem 1rem; border-radius: 6px; border: 1px solid var(--ink); background: transparent; color: var(--ink); cursor: pointer;
  }
  .btn.primary { background: var(--ink); color: var(--paper); }
  .btn:disabled { opacity: 0.45; cursor: default; }
  .muted { color: var(--ink-soft); font-size: 0.85rem; margin: 0; }
  .notice { margin: 0.6rem 0 0; font-style: italic; }
  .link { margin-top: 0.9rem; display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; }
  .link code { font-size: 0.8rem; word-break: break-all; background: rgb(58 53 39 / 0.08); padding: 0.3rem 0.5rem; border-radius: 4px; }
</style>
