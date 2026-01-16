import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '@/components/auth/LoginForm';
import { ForgotPasswordForm } from '@/components/auth/LoginForm/ForgotPasswordForm';
import type { FormData, FormMode } from '@/types/type';
import { authAPI } from '@/services/authService';
import { ApiResponse } from '@/types/api';
import { AxiosError } from 'axios';
import '@/assets/styles/login.css';

function Login() {
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [signInData, setSignInData] = useState<FormData>({
    username: '',
    password: '',
    role: '',
    verificationCode: ''
  });
  const [signUpData, setSignUpData] = useState<FormData>({
    username: '',
    password: '',
    role: '',
    verificationCode: ''
  });
  const [signInError, setSignInError] = useState<string>('');
  const [signUpError, setSignUpError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [sentCodePhone, setSentCodePhone] = useState<string>('');
  const [isGettingCode, setIsGettingCode] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setSignInData({ username: '', password: '', role: '', verificationCode: '' });
    setSignUpData({ username: '', password: '', role: '', verificationCode: '' });
  }, []);

  useEffect(() => {
    containerRef.current?.classList.toggle('sign-up-mode', isSignUpMode);
  }, [isSignUpMode]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleFormChange = (mode: FormMode) => (field: keyof FormData, value: string) => {
    if (mode === 'signin') {
      setSignInData(prev => ({ ...prev, [field]: value }));
    } else {
      setSignUpData(prev => ({ ...prev, [field]: value }));
      
      // 如果是修改手机号，重置状态
      if (field === 'username' && value !== sentCodePhone) {
        setSentCodePhone('');
      }
    }
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string): boolean => {
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    return hasNumber && hasUpperCase && hasLowerCase;
  };

  const handleGetVerificationCode = async (): Promise<void> => {
    console.log('🎯 开始获取验证码流程');
    console.log('📱 手机号:', signUpData.username);
    
    if (!validatePhoneNumber(signUpData.username)) {
      console.log('❌ 手机号格式验证失败');
      setSignUpError('请输入正确的手机号格式');
      return;
    }

    if (!signUpData.role) {
      console.log('❌ 未选择身份');
      setSignUpError('请先选择身份');
      return;
    }

    setIsGettingCode(true);
    console.log('🔄 开始API调用流程');
    
    try {
      console.log('📤 发送验证码请求:', { tel: signUpData.username });
      
      const response = await authAPI.sendVerificationCode({
        tel: signUpData.username
      });
      
      console.log('✅ 验证码发送响应:', response.data);
      const isSuccess = response.data.code === 0 || response.data.code === 10000;
    
    if (isSuccess) {

      // 记录发送验证码的手机号
      setSentCodePhone(signUpData.username);
      setCountdown(60);
      setSignUpError('');
      alert('验证码已发送，请注意查收');
      } else {
        setSignUpError(response.data.msg || response.data.message || '验证码发送失败');
      }
      
    } catch (error: unknown) {
      console.error('❌ API调用出错:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      console.error('📊 错误详情:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });
      
      let errorMessage = '获取验证码失败，请稍后重试';
      if (axiosError.response?.data?.error) {
        errorMessage = axiosError.response.data.error;
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
      } else if (axiosError.response?.data?.msg) {
        errorMessage = axiosError.response.data.msg;
      } else if (axiosError.message) {
        errorMessage = axiosError.message;
      }
      
      setSignUpError(errorMessage);
    } finally {
      setIsGettingCode(false);
    }
  };

  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSignInError('');

    if (!signInData.username.trim() || !signInData.password.trim()) {
      setSignInError('用户名和密码不能为空');
      return;
    }

    if (!validatePhoneNumber(signInData.username)) {
      setSignInError('请输入正确的手机号格式');
      return;
    }

    if (!signInData.role) {
      setSignInError('请选择身份');
      return;
    }

    try {
      const response = await authAPI.login({
        userName: signInData.username,
        passWord: signInData.password
      });

      if (!response.data.data) {
        setSignInError('登录失败,请检查账号和密码');
        return;
      }

      if (!response.data.data.token) {
        setSignInError('登录失败：服务器未返回token');
        return;
      }

      // 保存token和用户信息
      localStorage.setItem('pz_token', response.data.data.token);
      localStorage.setItem('pz_user', JSON.stringify(response.data.data.userInfo));
      
      // 根据用户选择的身份进行跳转
      const userSelectedRole = signInData.role;
      
      if (userSelectedRole === 'employee') {
        navigate('/qa');
      } else if (userSelectedRole === 'visitor') {
        navigate('/room');
      } else {
        if (response.data.data.userInfo.role === 'employee') {
          navigate('/qa');
        } else {
          navigate('/room');
        }
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.msg || 
                         axiosError.response?.data?.message || 
                         axiosError.response?.data?.error || 
                         '登录失败';
      setSignInError(errorMessage);
    }
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSignUpError('');
    console.log('🚀 开始注册流程');

    // 基本验证
    if (!signUpData.username.trim() || !signUpData.password.trim()) {
      setSignUpError('用户名和密码不能为空');
      return;
    }

    if (!validatePhoneNumber(signUpData.username)) {
      setSignUpError('请输入正确的手机号格式');
      return;
    }

    if (!validatePassword(signUpData.password)) {
      setSignUpError('密码必须包含数字、大写字母和小写字母');
      return;
    }

    if (!signUpData.role) {
      setSignUpError('请选择身份');
      return;
    }

    if (!signUpData.verificationCode?.trim()) {
      setSignUpError('请输入验证码');
      return;
    }

    if (signUpData.verificationCode.length !== 4) {
      setSignUpError('验证码必须是4位数字');
      return;
    }

    // 检查验证码是否与当前手机号匹配
    if (sentCodePhone !== signUpData.username) {
      setSignUpError('手机号已变更，请重新获取验证码');
      return;
    }

    console.log('📤 提交注册数据:', {
      userName: signUpData.username,
      passWord: signUpData.password,
      validCode: signUpData.verificationCode
    });

    try {
      const response = await authAPI.register({
        userName: signUpData.username,
        passWord: signUpData.password,
        validCode: signUpData.verificationCode
      });

      console.log('📥 注册响应:', response.data);

      if (response.data.code === 0) {
        alert('注册成功！快去登录吧！');
        setIsSignUpMode(false);
        // 清空注册表单
        setSignUpData({ username: '', password: '', role: '', verificationCode: '' });
        setSentCodePhone('');
        setCountdown(0);
      } else {
        const errorMessage = response.data.msg || response.data.message || '注册失败';
        setSignUpError(errorMessage);
        console.log('❌ 注册失败详情:', response.data);
      }
    } catch (error: unknown) {
      console.error('❌ 注册异常:', error);
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.msg || 
                         axiosError.response?.data?.message || 
                         axiosError.response?.data?.error || 
                         '注册失败，请稍后重试';
      setSignUpError(errorMessage);
    }
  };

  const validateSignUpForm = (): boolean => {
    return !!(
      signUpData.username &&
      signUpData.password &&
      signUpData.role &&
      signUpData.verificationCode &&
      validatePhoneNumber(signUpData.username) &&
      validatePassword(signUpData.password) &&
      signUpData.verificationCode.length === 4
    );
  };

  return (
    <div className="login-container" ref={containerRef}>
      <div className="forms-container">
        <div className="signin-signup">
          <AuthForm
            mode="signin"
            data={signInData}
            error={signInError}
            onChange={handleFormChange('signin')}
            onSubmit={handleSignIn}
            onFocus={() => setSignInError('')}
            onForgotPassword={() => setShowForgotPassword(true)}
          />
          <AuthForm
            mode="signup"
            data={signUpData}
            error={signUpError}
            onChange={handleFormChange('signup')}
            onSubmit={handleSignUp}
            onFocus={() => setSignUpError('')}
            onGetCode={handleGetVerificationCode}
            countdown={countdown}
            isGettingCode={isGettingCode}
            isFormValid={validateSignUpForm()}
          />
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <h3>还没注册？</h3>
            <button
              className="btn transparent"
              onClick={() => setIsSignUpMode(true)}
            >
              去注册
            </button>
            <div className="forgot-password-link">
              <a href="#" onClick={(e) => {
                e.preventDefault();
                setShowForgotPassword(true);
              }}>
                忘记密码？
              </a>
            </div>
          </div>
        </div>
        <div className="panel right-panel">
          <div className="content">
            <h3>已经注册？</h3>
            <button
              className="btn transparent"
              onClick={() => setIsSignUpMode(false)}
            >
              去登录
            </button>
          </div>
        </div>
      </div>

      <div className="bottom-nav">
        <a href="/" className="back-link">返回首页</a>
      </div>

      {showForgotPassword && (
        <ForgotPasswordForm
          onClose={() => setShowForgotPassword(false)}
          onSuccess={() => {
            alert('密码重置成功，请使用新密码登录');
            setShowForgotPassword(false);
          }}
        />
      )}
    </div>
  );
}

export default Login;