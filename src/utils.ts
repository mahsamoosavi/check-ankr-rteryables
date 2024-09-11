import { providers } from "ethers";
import { ParentTransactionReceipt } from "@arbitrum/sdk";
import { config } from "./config";
import { registerCustomArbitrumNetwork } from '@arbitrum/sdk';

// Function to find which ticketID corresponds to the L1 transaction hash
export async function findTicketIDForL1Tx(
  l1TxHash: string,
  parentChainProvider: providers.JsonRpcProvider,
  childChainProvider: providers.JsonRpcProvider
) {
  try {
    // Fetch the L1 transaction receipt
    const parentTxReceipt = await parentChainProvider.getTransactionReceipt(
      l1TxHash
    );
    if (!parentTxReceipt) {
      console.error("L1 transaction receipt not found.");
      return;
    }

    // Define the EthBridge interface (populate it with the necessary contract addresses)
const ethBridge = {
    inbox: '0x...',           // L1 inbox contract address
    outbox: '0x...',          // L1 outbox contract address
    rollup: '0x...',          // L1 rollup contract address
    sequencerInbox: '0x...',   // L1 sequencer inbox contract address
    bridge: '0x '
};

// Define the TokenBridge interface (optional)
const tokenBridge = {
    parentGatewayRouter: '0x...',        // Parent chain gateway router address
    childGatewayRouter: '0x...',         // Child chain gateway router address
    parentErc20Gateway: '0x...',         // Parent chain ERC20 gateway address
    childErc20Gateway: '0x...',          // Child chain ERC20 gateway address
    parentCustomGateway: '0x...',        // Parent chain custom gateway address
    childCustomGateway: '0x...',         // Child chain custom gateway address
    parentWethGateway: '0x...',          // Parent chain WETH gateway address
    childWethGateway: '0x...',           // Child chain WETH gateway address
    l2WethAddress: '0x...',              // L2 WETH contract address
    l1WethAddress: '0x...',              // L1 WETH contract address
    parentWeth: '0x...',                 // Parent chain WETH contract address
    childWeth: '0x...',                  // Child chain WETH contract address
    parentProxyAdmin: '0x...',           // Parent chain proxy admin address
    childProxyAdmin: '0x...',            // Child chain proxy admin address
    parentGatewayRouterProxy: '0x...',   // Parent chain gateway router proxy address
    childGatewayRouterProxy: '0x...',    // Child chain gateway router proxy address
    parentMultiCall: '0x...',            // Parent chain Multicall contract address
    childMultiCall: '0x...'              // Child chain Multicall contract address
};




// Register the custom Arbitrum network
const customNetwork = {
    name: 'My Custom Arbitrum Network',
    chainId: 1214112., // Custom network Chain ID
    parentChainId: 17000, // Ethereum mainnet Chain ID (for L1 parent chain)
    ethBridge: ethBridge,
    tokenBridge: tokenBridge,
    confirmPeriodBlocks: 20, // Number of L1 blocks for challenge period
    retryableLifetimeSeconds: 604800, // Retryable ticket lifespan (7 days in seconds)
    nativeToken: undefined, // If using ETH as native token, set to undefined
    isTestnet: false, // Specify if it's a testnet or mainnet
    isCustom: true, // Set to true for custom networks
    isBold: false // Set if this network has been upgraded to Bold (optional)
};
    
    // Register the custom network
    registerCustomArbitrumNetwork(customNetwork);

    // Create ParentTransactionReceipt instance
    const arbParentTxReceipt = new ParentTransactionReceipt(parentTxReceipt);

    // Get retryable messages from L1 to L2
    const retryables = await arbParentTxReceipt.getParentToChildMessages(
      childChainProvider
    );

    if (retryables.length === 0) {
      console.log("No retryable tickets found in this L1 transaction.");
      return;
    }

    // Loop through the retryables and check their ticket IDs
    for (let retryableMessage of retryables) {
      const retryableTicketId = retryableMessage.retryableCreationId;
      console.log("Retryable Ticket ID:", retryableTicketId);

      // Compare with your known ticket IDs
      if (config.knownTicketIDs.includes(retryableTicketId)) {
        console.log(`Matched Ticket ID: ${retryableTicketId}`);
        return retryableTicketId; // Return the matched ticket ID
      }
    }

    console.log("No matching ticket ID found.");
  } catch (error) {
    console.error("Error finding ticket ID:", error);
  }
}
