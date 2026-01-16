export interface FormData {
  username: string;
  password: string;
  role: 'employee' | 'visitor' | '';
  verificationCode?: string;
}


export type FormMode = 'signin' | 'signup';

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

export interface Tab {
  id: string;
  title: string;
  path: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: FileInfo[];
}

export interface FileInfo {
  name: string;
  type: string;
  size: number;
}

export interface QAHistory {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  files?: FileInfo[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}



export const menuItems: MenuItem[] = [
  {
    id: 'qa', title: '智能助手', path: '/qa', icon: '',
    children: [
      { id: 'qa-main', title: '问答助手', path: '/qa', icon: '' },
      { id: 'qa-history', title: '历史问答', path: '/qa/list', icon: '' },
      { id: 'qa-stats', title: '文档管理', path: '/qa/stats', icon: '' }
    ]
  },
  { id: 'room', title: '数字人展厅', path: '/room', icon: '' }
];