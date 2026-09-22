import { mount } from 'svelte'
import Wallet from './Wallet.svelte'
import Leaderboard from './Leaderboard.svelte'

mount(Wallet, { target: document.getElementById('wallet')! })
mount(Leaderboard, { target: document.getElementById('ranking')! })
const stamp = document.getElementById('build-stamp')
if (stamp) stamp.textContent = `build ${__BUILD_STAMP__}`
