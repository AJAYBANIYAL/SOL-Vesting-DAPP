# 🚀 Token Vesting DApp (Solana + Next.js)

[![Solana](https://img.shields.io/badge/Blockchain-Solana-3bffb1)](https://solana.com)
[![Next.js](https://img.shields.io/badge/Framework-Next.js-000000)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8)](https://tailwindcss.com)

A **token vesting** decentralized application built with **Next.js**, **Tailwind CSS**, and **@solana/web3.js**.

This project was created as a **learning exercise** to understand how **vesting schedules** can be implemented on **Solana** using **smart contracts/programs**, and how a web client can lock tokens and release them **monthly** on **Devnet**.

---

## ✨ Features

- 🔗 **Wallets**: Phantom / Backpack (Solana Wallet Adapter)
- 📅 **Vesting**: Illustrative monthly vesting flow (UI-driven)
- 🧠 **On-chain Concepts**: Token accounts, minting, and program interaction
- 🧪 **Safe Testing**: Built for **Devnet** with free test SOL and tokens
- 🛠️ **DX**: TypeScript, ESLint, Prettier, Tailwind ready

---

## 🧰 Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Blockchain**: @solana/web3.js, @solana/spl-token, Wallet Adapter
- **Tooling**: pnpm, ESLint, Prettier, TypeScript

---

## 🛠️ Prerequisites

Install these before you start:

- **Node.js** v18+ — <https://nodejs.org/>
- **pnpm** — <https://pnpm.io/>
- **Solana CLI** — <https://docs.solana.com/cli/install-solana-cli-tools>
- **SPL Token CLI** — <https://spl.solana.com/token>

Check versions:

```bash
node -v
pnpm -v
solana --version
