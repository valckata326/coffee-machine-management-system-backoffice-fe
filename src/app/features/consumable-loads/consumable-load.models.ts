export interface ConsumableLoadItemRequest {
  consumableId: number;
  quantity: number;
}

export interface ConsumableLoadCreateRequest {
  totalCost: number;
  /** At least one item; each consumable may appear only once. */
  items: ConsumableLoadItemRequest[];
}

/**
 * Partial update: at least one of totalCost / items.
 * Items are upserted: new consumables are added, existing ones get the new quantity.
 */
export interface ConsumableLoadUpdateRequest {
  totalCost?: number;
  items?: ConsumableLoadItemRequest[];
}

export interface ConsumableLoadItemResponse {
  id: number;
  consumableId: number;
  consumableName: string;
  unitAbbreviation: string;
  quantity: number;
}

export interface ConsumableLoadResponse {
  id: number;
  machineId: number;
  userId: number;
  loadedAt: string;
  totalCost: number;
  items: ConsumableLoadItemResponse[];
}
