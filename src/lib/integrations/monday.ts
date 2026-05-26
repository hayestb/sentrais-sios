// Monday.com GraphQL API client — SentraisOS bidirectional pipeline sync
// Board routing: COMMERCIAL → MONDAY_COMMERCIAL_BOARD_ID, NONPROFIT → MONDAY_NONPROFIT_BOARD_ID

const MONDAY_API_URL = "https://api.monday.com/v2";

export type LicensingSector = "COMMERCIAL" | "NONPROFIT";

export type HubSpotDealStage =
  | "appointment_scheduled"
  | "contract_sent"
  | "closed_won"
  | "closed_lost";

export type GateCode = "G1" | "G2" | "G3" | "G4" | "G5";

export const DEAL_STAGE_STATUS_MAP: Record<HubSpotDealStage, string> = {
  appointment_scheduled: "Intake / Pre-Award",
  contract_sent: "Proposal / SOW Sent",
  closed_won: "Active / Approved",
  closed_lost: "Archived",
};

const GATE_STATUS_MAP: Record<GateCode, string> = {
  G1: "G1 — Discovery",
  G2: "G2 — Diagnosis / Invoice 25%",
  G3: "G3 — Design",
  G4: "G4 — Deploy",
  G5: "G5 — Complete / Invoice 100%",
};

export function boardIdForSector(sector: LicensingSector): number {
  const id =
    sector === "COMMERCIAL"
      ? process.env.MONDAY_COMMERCIAL_BOARD_ID
      : process.env.MONDAY_NONPROFIT_BOARD_ID;
  return id ? parseInt(id, 10) : 0;
}

async function mondayGraphql(query: string): Promise<unknown> {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN is not configured");

  const res = await fetch(MONDAY_API_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      "API-Version": "2023-10",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error(`Monday.com API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`Monday.com GraphQL error: ${json.errors[0].message}`);
  }
  return json;
}

export async function changeMondayItemStatus(
  boardId: number,
  itemId: number,
  statusLabel: string,
  revenueAmount?: number
): Promise<void> {
  const cols: Record<string, unknown> = { status: { label: statusLabel } };
  if (revenueAmount !== undefined) {
    cols.numeric_revenue = revenueAmount;
  }
  const encoded = JSON.stringify(JSON.stringify(cols));

  await mondayGraphql(`
    mutation {
      change_multiple_column_values(
        board_id: ${boardId},
        item_id: ${itemId},
        column_values: ${encoded}
      ) { id }
    }
  `);
}

export async function createMondayItem(
  boardId: number,
  itemName: string,
  columnValues: Record<string, unknown>
): Promise<string> {
  const encoded = JSON.stringify(JSON.stringify(columnValues));
  const safeName = itemName.replace(/"/g, '\\"');

  const data = (await mondayGraphql(`
    mutation {
      create_item(
        board_id: ${boardId},
        item_name: "${safeName}",
        column_values: ${encoded}
      ) { id }
    }
  `)) as { data: { create_item: { id: string } } };

  return data.data.create_item.id;
}

export async function notifyMondayGateAdvancement(params: {
  engagementId: string;
  clientName: string;
  gateNumber: number;
  sector: LicensingSector;
  invoiceAmount?: number;
}): Promise<void> {
  const { engagementId, clientName, gateNumber, sector, invoiceAmount } = params;
  const boardId = boardIdForSector(sector);
  if (!boardId) return;

  const gateCode = `G${gateNumber}` as GateCode;
  const statusLabel = GATE_STATUS_MAP[gateCode] ?? `G${gateNumber}`;
  const itemName = `${clientName} — ${gateCode} [${engagementId.slice(0, 8)}]`;

  const cols: Record<string, unknown> = { status: { label: statusLabel } };
  if (invoiceAmount !== undefined) {
    cols.numeric_revenue = invoiceAmount;
  }

  await createMondayItem(boardId, itemName, cols);
}
