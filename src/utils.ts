import { providers } from "ethers";
import { ParentTransactionReceipt } from "@arbitrum/sdk";
import { registerCustomArbitrumNetwork } from '@arbitrum/sdk';

// Function to find the L2 ticket creation transaction corresponding to the L1 transaction hash
export async function findTicketIDForL1Tx(
  l1TxHash: string,
  parentChainProvider: providers.JsonRpcProvider,
  childChainProvider: providers.JsonRpcProvider
) {
  try {
    // Fetch the L1 transaction receipt
    const parentTxReceipt = await parentChainProvider.getTransactionReceipt(l1TxHash);
    if (!parentTxReceipt) {
      console.error("L1 transaction receipt not found.");
      return;
    }

    // Define the EthBridge interface (populate it with the necessary contract addresses)
    const ethBridge = {
      inbox: '0x...',           // L1 inbox contract address
      outbox: '0x...',          // L1 outbox contract address
      rollup: '0x...',          // L1 rollup contract address
      sequencerInbox: '0x...',  // L1 sequencer inbox contract address
      bridge: '0x...'
    };

    const customNetwork = {
      name: 'My Custom Arbitrum Network',
      chainId: 1214112, // Custom network Chain ID
      parentChainId: 17000, // Ethereum mainnet Chain ID (for L1 parent chain)
      ethBridge: ethBridge,
      confirmPeriodBlocks: 20, // Number of L1 blocks for challenge period
      retryableLifetimeSeconds: 604800, // Retryable ticket lifespan (7 days in seconds)
      isTestnet: false,
      isCustom: true,
      isBold: false
    };

    // Register the custom Arbitrum network
    registerCustomArbitrumNetwork(customNetwork);

    // Create ParentTransactionReceipt instance
    const arbParentTxReceipt = new ParentTransactionReceipt(parentTxReceipt);
    

    // Get retryable messages from L1 to L2
    const retryables = await arbParentTxReceipt.getParentToChildMessages(childChainProvider);

    if (retryables.length === 0) {
      console.log("No retryable tickets found in this L1 transaction.");
      return;
    }

    // Loop through the retryables and extract the L2 ticket creation transaction
    for (let retryableMessage of retryables) {
      const retryableTicketId = retryableMessage.retryableCreationId;

      console.log("Retryable Ticket ID:", retryableTicketId);

      // Return the L2 ticket creation transaction hash
      return retryableTicketId;
    }
  } catch (error) {
    console.error("Error finding L2 ticket creation transaction:", error);
  }
}
