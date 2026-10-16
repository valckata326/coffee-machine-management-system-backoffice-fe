export interface UserCreateRequest {
  name: string;
  roleId: number;
}

/** Partial update: at least one field must be provided. */
export interface UserUpdateRequest {
  roleId?: number;
  active?: boolean;
}

export interface UserResponse {
  id: number;
  companyId: number;
  name: string;
  roleId: number;
  companyRole: string;
  active: boolean;
}
