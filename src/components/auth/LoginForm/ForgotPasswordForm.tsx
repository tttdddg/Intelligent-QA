import { useState, useEffect } from 'react';
import { authAPI } from '@/services/authService';
import { api } from '@/services/api';

export interface ForgotPasswordFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function ForgotPasswordForm({ onClose, onSuccess }: ForgotPasswordFormProps) {
  const [step, setStep] = useState<'phone' | 'verify' | 'reset'>('phone');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const [isCodeVerified, setIsCodeVerified] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

 const handleSendCode = async () => {
  if (!validatePhoneNumber(phone)) {
    setError('请输入正确的手机号格式');
    return;
  }

  setLoading(true);
  setError('');

  try {
    console.log('发送验证码到:', phone);
    const response = await authAPI.sendVerificationCode({ 
      tel: phone, 
      // type: 'employee'
    });
    
    console.log('验证码发送响应:', response.data);
    
    // 修复成功判断逻辑 - 支持多种成功码
    const isSuccess = response.data.code === 0 || response.data.code === 10000;
    
    if (isSuccess) {
      setCountdown(60);
      setStep('verify');
      // setIsCodeVerified(false);
      setError(''); // 清除错误
    } else {
      // 根据不同的错误码提供不同的提示
      const errorMsg = response.data.msg || response.data.message || '发送验证码失败';
      
      if (response.data.code === -2) {
        setError('系统错误，请联系管理员');
      } else if (errorMsg.includes('不存在') || errorMsg.includes('未注册')) {
        setError('该手机号未注册，请先注册账号');
      } else {
        setError(errorMsg);
      }
    }
  } catch (error: any) {
    console.error('发送验证码失败:', error);
    
    // 更详细的错误处理
    const errorData = error.response?.data;
    let errorMessage = '发送验证码失败，请重试';
    
    if (errorData) {
      if (errorData.msg) {
        errorMessage = errorData.msg;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '网络连接失败，请检查网络设置';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('请输入验证码');
      return;
    }

    if (verificationCode.length !== 4) {
      setError('验证码必须是4位数字');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/user/authentication', {
        userName: phone,  // 手机号作为用户名
        passWord: "temporary_password_123", // 使用更复杂的临时密码
        validCode: verificationCode
      });

      console.log('验证码验证响应:', response.data);

       // 修复成功判断逻辑 - 支持多种成功码
    const isSuccess = response.data.code === 0 || response.data.code === 10000;
    
    if (isSuccess) {
      console.log('验证码验证成功，跳转到重置密码页面');

      setCountdown(60);
      setStep('reset');
      // setIsCodeVerified(false);
      setError(''); // 清除错误
      
      setTimeout(() => {
        console.log('当前步骤:', step); // 检查步骤是否更新
      }, 100);
    } else {
        setError(response.data.message || '验证码错误，请重新输入');
      }
    } catch (error: any) {
      console.error('验证验证码失败:', error);
      
      const errorData = error.response?.data;
      if (errorData?.message) {
        setError(errorData.message);
      } else if (errorData?.error) {
        setError(errorData.error);
      } else {
        setError('验证码错误，请重新输入');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError('请输入新密码');
      return;
    }

    if (newPassword.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError('密码必须包含数字、大写字母和小写字母');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    setError('');
     try {
    // 首先检查是否有有效的token
    let token = localStorage.getItem('pz_token');
    
    if (!token) {
      // 如果没有token，尝试先登录获取token
      console.log('没有有效token，尝试先登录');
      
      const loginResponse = await authAPI.login({
        userName: phone,
        passWord: "temporary_password", // 或者使用其他方式获取临时凭证
      });
      
      if (loginResponse.data.code === 0 && loginResponse.data.data?.token) {
        token = loginResponse.data.data.token;
        if(token){
        localStorage.setItem('pz_token', token);
        console.log('获取到新token:', token);
        }else{
          throw new Error('获取无效token');
        }
      } else {
        throw new Error('无法获取有效token');
      }
    }

    // 使用注册接口来重置密码（带token）
    console.log('使用token重置密码:', token);
    const response = await api.post('/user/authentication', {
      userName: phone,
      passWord: newPassword,
      validCode: verificationCode
    }, {
      headers: {
        'token': token,
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('重置密码响应:', response.data);

    const isSuccess = response.data.code === 0 || 
                     response.data.code === 10000 || 
                     response.data.code === 20000;
    
    if (isSuccess) {
      alert('密码重置成功！');
      onSuccess();
      onClose();
    } else {
      setError(response.data.message || response.data.msg || '重置密码失败');
    }
  } catch (error: any) {
    console.error('重置密码失败:', error);
    
    const errorData = error.response?.data;
    if (errorData?.message?.includes('token') || errorData?.msg?.includes('token')) {
      // token错误，清除本地token并提示重新登录
      localStorage.removeItem('pz_token');
      setError('登录已过期，请重新登录后再尝试重置密码');
    } else if (errorData?.message) {
      setError(errorData.message);
    } else if (errorData?.msg) {
      setError(errorData.msg);
    } else {
      setError('重置密码失败，请重试');
    }
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="forgot-password-modal">
      <div className="modal-content">
        <h2>忘记密码</h2>
        <div className="form-steps">
          <div className={`step-indicator ${step === 'phone' ? 'active' : ''}`}>1. 输入手机号</div>
          <div className={`step-indicator ${step === 'verify' ? 'active' : ''}`}>2. 验证身份</div>
          <div className={`step-indicator ${step === 'reset' ? 'active' : ''}`}>3. 重置密码</div>
        </div>

        {step === 'phone' && (
          <div className="form-step">
            <div className="input-field">
              <i className="fas fa-phone" />
              <input
                type="text"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              className="btn"
              onClick={handleSendCode}
              disabled={loading || countdown > 0}
            >
              {loading ? '发送中...' : countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
            </button>
          </div>
        )}

        {step === 'verify' && (
          <div className="form-step">
            <p className="verification-tip">验证码已发送至 {phone}，请输入验证码</p>
            <div className="input-field verification-code-field">
              <i className="fas fa-sms" />
              <input
                type="text"
                placeholder="请输入验证码"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={4}
              />
              {countdown > 0 ? (
                <span className="verification-code-btn disabled">{countdown}秒后重试</span>
              ) : (
                <button
                  className="verification-code-btn"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                >
                  重新发送
                </button>
              )}
            </div>
            <button
              className="btn"
              onClick={handleVerifyCode}
              disabled={loading || verificationCode.length !== 4}
            >
              {loading ? '验证中...' : '验证'}
            </button>
          </div>
        )}

        {step === 'reset' && (
          <div className="form-step">
            <p className="reset-tip">请设置新密码</p>
            <div className="input-field">
              <i className="fas fa-lock" />
              <input
                type="password"
                placeholder="请输入新密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="input-field">
              <i className="fas fa-lock" />
              <input
                type="password"
                placeholder="请确认新密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button className="btn" onClick={handleResetPassword} disabled={loading}>
              {loading ? '重置中...' : '重置密码'}
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button className="btn close-btn" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export { ForgotPasswordForm };
export default ForgotPasswordForm;