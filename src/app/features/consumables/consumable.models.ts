export interface ConsumableCreateRequest {
  name: string;
  unitTypeId: number;
}

/** Partial update: at least one field must be provided. */
export interface ConsumableUpdateRequest {
  name?: string;
  unitTypeId?: number;
}

export interface ConsumableResponse {
  id: number;
  name: string;
  unitTypeId: number;
  unitTypeName: string;
  unitAbbreviation: string;
  active: boolean;
}
