import { providers } from "ethers";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { findTicketIDForL1Tx } from "./utils";
import { config } from "./config";

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .options({
    l1TxHash: { type: "string", demandOption: true, describe: "The L1 transaction hash" },
  })
  .parseSync();

// Create providers for both parent and child chains
const parentChainProvider = new providers.JsonRpcProvider(config.parentChainRpcUrl);
const childChainProvider = new providers.JsonRpcProvider(config.childChainRpcUrl);

// Run the ticket finder for the provided L1 transaction hash
const l1TxHash = argv.l1TxHash;
findTicketIDForL1Tx(l1TxHash, parentChainProvider, childChainProvider);
