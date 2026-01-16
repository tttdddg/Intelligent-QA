export interface ApiResponse<T = any> {
  code: number;
  message: string;
  msg?: string; 
  error?: string;
  data: T;
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  userInfo: UserInfo;
}

export interface LoginParams {
  userName: string;
  passWord: string;
  validCode?: string;
}

export interface RegisterParams {
  userName: string;
  passWord: string;
  validCode: string;
}

export interface VerificationCodeParams {
  tel: string;
}

export interface VerifyCodeParams {
  tel: string;
  validCode: string;
}

export interface ResetPassWordParams{
  passWord: string;
}

export interface ApiError {
  error: string;
  message?: string;
  code?: number;
}