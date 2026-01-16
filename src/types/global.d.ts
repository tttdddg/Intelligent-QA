declare module '@/types/auth' {
  export interface FormData {
    username: string;
    password: string;
    role: string;
  }

  export type FormMode = 'signin' | 'signup';
}

declare module '@/components/auth/LoginForm/AuthForm' {
  import { FC } from 'react';
  import { FormData, FormMode } from '@/types/auth';

  export interface AuthFormProps {
    mode: FormMode;
    data: FormData;
    error: string;
    onChange: (field: keyof FormData, value: string) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onFocus: () => void;
  }

  const AuthForm: FC<AuthFormProps>;
  export default AuthForm;
}

declare module '@/components/auth/LoginForm' {
  export { default } from './AuthForm';
  export type { AuthFormProps } from './AuthForm';
}
declare module '@/pages/Login/login' {
  import { FC } from 'react';
  const Login: FC;
  export default Login;
}

declare module '@/pages/IntelligentDocQA/QA' {
  import { FC } from 'react';
  const QA: FC;
  export default QA;
}

declare module '@/pages/EnterpriseShowroom/room' {
  import { FC } from 'react';
  const Room: FC;
  export default Room;
}

declare module '@/pages/IntelligentDocQA/qa_list' {
  import { FC } from 'react';
  const QAList: FC;
  export default QAList;
}

declare module '@/pages/IntelligentDocQA/qa_stats' {
  import { FC } from 'react';
  const QAStats: FC;
  export default QAStats;
}

declare module '@/pages/IntelligentDocQA/qa_listWithLayout' {
  import { FC } from 'react';
  const QAListWithLayout: FC;
  export default QAListWithLayout;
}
declare module '@/components/auth/LoginForm/ForgotPasswordForm' {
  import { FC } from 'react';
  export const ForgotPasswordForm: FC<ForgotPasswordFormProps>;
  export interface ForgotPasswordFormProps {
    onClose: () => void;
    onSuccess: () => void;
  }
}

declare module '@/components/ui/FileManager'{
  import {FC} from 'react';
  const FileManager:FC;
  export default FileManager;
}
