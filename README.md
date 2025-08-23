Token Vesting DApp (Solana + Next.js)

A simple token vesting decentralized app built with Next.js, TailwindCSS, and @solana/web3.js.

This project was created to learn how vesting schedules can be implemented on Solana using smart contracts. It is not production-ready, but an educational experiment to explore:

How tokens can be locked into a vesting contract.

How to release tokens monthly according to a predefined schedule.

How to connect a wallet and interact with the Solana blockchain (Devnet).

Features

🔗 Wallet connection UI (Phantom/Backpack).

📅 Example vesting schedule setup (monthly release).

💡 Demonstrates how a smart contract controls token release.

🌐 Runs on Solana Devnet with free tokens.

Getting Started
1. Clone this repo
git clone https://github.com/AJAYBANIYAL/SOL-Vesting-DAPP.git
cd SOL-Vesting-DAPP

2. Install dependencies
pnpm install

3. Run locally
pnpm dev


The app will be available at http://localhost:3000
.

Solana Devnet Setup

Make sure you have the Solana CLI installed:

sh -c "$(curl -sSfL https://release.solana.com/stable/install)"


Check your version:

solana --version


Switch to Devnet:

solana config set --url https://api.devnet.solana.com


Generate a new wallet (if you don’t already have one):

solana-keygen new --outfile ~/.config/solana/devnet.json


Set it as default:

solana config set --keypair ~/.config/solana/devnet.json


Get free Devnet SOL:

solana airdrop 2
solana balance

Example Vesting Flow (CLI + DApp)

Create a new token (for testing):

spl-token create-token


Create a token account (wallet to hold it):

spl-token create-account <TOKEN_ADDRESS>


Mint some tokens:

spl-token mint <TOKEN_ADDRESS> 1000


Lock tokens into the vesting contract using the web DApp UI.

Claim vested tokens each month through the UI (smart contract releases automatically).

Future Work

Customizable vesting periods via UI.

Multiple beneficiary support.

Anchor-based program for full on-chain enforcement.
