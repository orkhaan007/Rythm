export interface SignUpRequest {
  userName: string;
  email: string;
  password: string;
  profilePhoto?: File;
}

export interface SignInRequest {
  userName: string;
  password: string;
}

export interface SignInResponse {
  token: string;
}