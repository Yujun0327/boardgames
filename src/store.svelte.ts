import {
  DAILY_CASH,
  Ledger,
  LEDGER,
  exportSeed,
  importSeed,
  loadIdentity,
  loadPlatformName,
  savePlatformName,
  type Identity,
  type LeaderRow,
  type Profile,
} from '@yujun/game-net/wallet'

const NEXT_CLAIM_KEY = 'yujungame:next-claim'

/** Shared wallet state for the portal: identity, profile, daily claim, ranking. */
class WalletStore {
  readonly identity: Identity = loadIdentity()
  readonly ledger: Ledger | null = LEDGER ? new Ledger(LEDGER) : null
  name = $state(loadPlatformName())
  profile = $state<Profile | null>(null)
  rank = $state<number | null>(null)
  leaders = $state<LeaderRow[]>([])
  nextClaimAt = $state<number>(Number(localStorage.getItem(NEXT_CLAIM_KEY) ?? 0))
  busy = $state(false)
  notice = $state('')
  loaded = $state(false)

  get configured(): boolean {
    return this.ledger !== null
  }

  get canClaim(): boolean {
    return this.configured && !this.busy && Date.now() >= this.nextClaimAt
  }

  async refresh(): Promise<void> {
    if (!this.ledger) return
    const [profile, rank, leaders] = await Promise.all([
      this.ledger.readPlayer(this.identity.id),
      this.ledger.readRank(this.identity.id),
      this.ledger.readLeaderboard(20),
    ])
    this.profile = profile
    this.rank = rank?.rank ?? null
    this.leaders = leaders
    this.loaded = true
  }

  /** Register (or rename) and load everything. */
  async init(): Promise<void> {
    if (!this.ledger) return
    const reply = await this.ledger.hello(this.identity, this.name || 'Guest')
    if (!reply.ok) this.notice = reply.error ?? 'The ledger is unreachable right now.'
    await this.refresh()
  }

  async rename(name: string): Promise<void> {
    this.name = name.trim().slice(0, 32)
    savePlatformName(this.name)
    if (!this.ledger) return
    await this.ledger.hello(this.identity, this.name || 'Guest')
    await this.refresh()
  }

  async claim(): Promise<void> {
    if (!this.ledger || !this.canClaim) return
    this.busy = true
    try {
      const reply = await this.ledger.claimDaily(this.identity)
      if (!reply.ok) {
        this.notice = reply.error ?? 'Claim failed.'
        return
      }
      if (reply.nextClaimAt) {
        this.nextClaimAt = reply.nextClaimAt
        localStorage.setItem(NEXT_CLAIM_KEY, String(reply.nextClaimAt))
      }
      this.notice = reply.status === 'claimed' ? `+${DAILY_CASH.toLocaleString()} cash collected.` : 'Already collected today — come back after midnight (KST).'
      await this.refresh()
    } finally {
      this.busy = false
    }
  }

  linkCode(): string {
    return exportSeed(this.identity)
  }

  /** Adopt another device's identity; the page reloads to pick it up. */
  adopt(code: string): string | null {
    try {
      importSeed(code)
      localStorage.removeItem(NEXT_CLAIM_KEY)
      location.reload()
      return null
    } catch {
      return 'That does not look like a link code.'
    }
  }
}

export const wallet = new WalletStore()
