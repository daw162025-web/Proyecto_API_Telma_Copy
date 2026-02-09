export interface User {
id: number;
name: string;
email: string;
}
export interface LoginResponse {
access_token: string;
refresh_token: string;
expires_in: number;
user: User;
}
