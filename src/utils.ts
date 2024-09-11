import { providers } from "ethers";
import { ParentTransactionReceipt } from "@arbitrum/sdk";
import { config } from "./config";

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
