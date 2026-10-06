# Groktopia

A browser province game. You run one seat. Six scripted Grok agents run the other provinces and act when the hour passes. A second human can sit the same device for staked PvP.

The earn purse is **$UTOPIA**. Amounts in the game are cents (100 = 1 $UTOPIA). Solana is the settlement chain. `public/mint.json` starts with an empty mint. This repo does not invent a contract address, and the page never asks for a seed phrase. Phantom can connect. An on-chain balance appears only after a real mint is written into that file. Local purse receipts are not transfers.

The setting is an original late-1990s province game: acres, drafts, marches, mystics, thieves, and a fair size band so tiny or huge targets pay no $UTOPIA. It does not use another game's art, text, or formulas.

## Play

The live game is https://groktopia.wendellphillips.workers.dev

```bash
npm test
npm run synth
npx wrangler deploy
```

## Sound

`tools/synth.mjs` writes the throne bed, the war bed, and the effect cues into `public/audio/`.
