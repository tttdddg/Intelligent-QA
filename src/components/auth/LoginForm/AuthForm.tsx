import { FormEvent } from 'react';
import { FormData, FormMode } from '@/types/type';
import RoleSelector from './RoleSelector';

export interface AuthFormProps {
  mode: FormMode;
  data: FormData;
  error: string;
  onChange: (field: keyof FormData, value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onFocus: () => void;
  onGetCode?: () => void;
  onVerifyCode?: () => void;
  onForgotPassword?: () => void;
  countdown?: number;
  isFormValid?: boolean;
}

function AuthForm(props: AuthFormProps) {
  const { 
    mode, 
    data, 
    error, 
    onChange, 
    onSubmit, 
    onFocus, 
    onGetCode, 
    onVerifyCode, 
    onForgotPassword, 
    countdown, 
    isFormValid
  } = props;

  const isSignUp = mode === 'signup';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    if (name === 'username' || name === 'password' || name === 'role' || name === 'verificationCode') {
      onChange(name as keyof FormData, value);
    }
  };

  const handleRoleChange = (role: string): void => {
    onChange('role', role);
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const phoneReg = /^1[3-9]\d{9}$/;
    return phoneReg.test(phoneNumber);
  }

  return (
    <form className={isSignUp ? 'sign-up-form' : 'sign-in-form'} onSubmit={onSubmit}>
      <h2 className="title">{isSignUp ? '注册' : '登录'}</h2>

      <div className="input-field">
        <i className="fas fa-user" />
        <input
          type="text"
          placeholder="手机号"
          autoCapitalize="none"
          name="username"
          value={data.username}
          onChange={handleInputChange}
          onFocus={onFocus}
          pattern="^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$"
          title="请输入正确的手机号"
        />
      </div>

      <div className="input-field">
        <i className="fas fa-lock" />
        <input
          type="password"
          placeholder="密码"
          autoCapitalize="none"
          name="password"
          value={data.password}
          onChange={handleInputChange}
          onFocus={onFocus}
          pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$"
          title="密码必须包含数字、大写字母和小写字母"
        />
      </div>

      {isSignUp && (
        <>
          <div className="input-field verification-code-field">
            <i className="fas fa-sms" />
            <input
              type="text"
              placeholder="验证码"
              name="verificationCode"
              value={data.verificationCode || ''}
              onChange={handleInputChange}
              onFocus={onFocus}
              maxLength={4}
            />
            <button
              type="button"
              className="verification-code-btn"
              onClick={onGetCode}
              disabled={(countdown !== undefined && countdown > 0) || !validatePhoneNumber(data.username)}
            >
              {countdown && countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
          
          {data.verificationCode && data.verificationCode.length === 4 && onVerifyCode && (
            <div className="verify-code-section">
              <button
                type="button"
                className="btn verify-code-btn"
                onClick={onVerifyCode}
              >
              </button>
            </div>
          )}
        </>
      )}

      <RoleSelector
        value={data.role as 'employee' | 'visitor' | ''}
        onChange={handleRoleChange}
      />

      {!isSignUp && onForgotPassword && (
        <div className="forgot-password-link">
          <a href="#" onClick={(e) => {
            e.preventDefault();
            onForgotPassword();
          }}>
            忘记密码？
          </a>
        </div>
      )}

      {error && <span className="error-message">{error}</span>}

      <button 
        type="submit" 
        className="btn" 
        disabled={isSignUp ? !isFormValid : !data.username || !data.password || !data.role}
      >
        {isSignUp ? '注册' : '登录'}
      </button>
    </form>
  );
};

export default AuthForm;