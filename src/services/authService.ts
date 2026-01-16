import { AxiosResponse } from 'axios';
import { api } from '@/services/api';
import { ApiResponse, LoginParams, ResetPassWordParams,RegisterParams,VerificationCodeParams } from '@/types/api';

export const authAPI = {
  // 发送验证码
  sendVerificationCode: (data: VerificationCodeParams): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/get/code', data);
  },

  // 注册
  register: (data: RegisterParams): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/user/authentication', data);
  },

  // 登录
  login: (data: LoginParams): Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/login', data);
  },

  reset:(data:ResetPassWordParams):Promise<AxiosResponse<ApiResponse>> => {
    return api.post('/reset/password', data);
  }
};