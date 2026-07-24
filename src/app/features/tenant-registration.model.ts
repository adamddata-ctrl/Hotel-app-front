export interface TenantRegistrationDto {
  username: string;
  pinCode: string;
  fullName: string;
  password: string; // Added to map the unique manager password field across your network service
}