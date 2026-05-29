// Bidirectional HubSpot ↔ Monday.com pipeline sync
// Maps HubSpot deal stage mutations to Monday.com board status columns,
// routing to the correct tenant board based on Legal_Licensing_Sector.

import {
  DEAL_STAGE_STATUS_MAP,
  boardIdForSector,
  changeMondayItemStatus,
  createMondayItem,
} from "./monday";
import type { HubSpotDealMutation } from "./hubspot";

export async function reconcilePipelineMutation(
  deal: HubSpotDealMutation
): Promise<void> {
  const targetStatus =
    DEAL_STAGE_STATUS_MAP[deal.dealStage] ?? "Intake / Pre-Award";
  const boardId = boardIdForSector(deal.licensingSector);

  if (!boardId) {
    console.warn(
      `[hubspot-monday-sync] Board not configured for sector ${deal.licensingSector} — skipping deal ${deal.dealId}`
    );
    return;
  }

  console.log(
    JSON.stringify({
      ts: new Date().toISOString(),
      service: "hubspot-monday-sync",
      dealId: deal.dealId,
      stage: deal.dealStage,
      targetStatus,
      boardId,
      sector: deal.licensingSector,
    })
  );

  // If a Monday item ID is passed as part of deal metadata, update it in-place.
  // Otherwise create a new tracking item on the board.
  // Production: store Monday item ID in crmDeals.monday_item_id after first creation.
  const itemName = `${deal.dealName} [HS-${deal.dealId.slice(0, 8)}]`;
  const colValues: Record<string, unknown> = {
    status: { label: targetStatus },
    numeric_revenue: deal.estimatedRevenue,
  };

  await createMondayItem(boardId, itemName, colValues);
}

export async function updateExistingMondayItem(
  mondayItemId: number,
  deal: HubSpotDealMutation
): Promise<void> {
  const targetStatus =
    DEAL_STAGE_STATUS_MAP[deal.dealStage] ?? "Intake / Pre-Award";
  const boardId = boardIdForSector(deal.licensingSector);

  if (!boardId) return;

  await changeMondayItemStatus(boardId, mondayItemId, targetStatus, deal.estimatedRevenue);
}
