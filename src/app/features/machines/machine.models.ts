export interface MachineCreateRequest {
  locationId: number;
  serialNumber: string;
  model?: string | null;
}

/** Partial update: at least one field must be provided. */
export interface MachineUpdateRequest {
  locationId?: number;
  serialNumber?: string;
  model?: string;
}

export interface MachineResponse {
  id: number;
  companyId: number;
  locationId: number;
  serialNumber: string;
  model: string | null;
  city: string | null;
  addressLine: string | null;
  active: boolean;
}

export interface MachineDetailsResponse extends MachineResponse {
  companyName: string;
  coordinateX: number | null;
  coordinateY: number | null;
}
