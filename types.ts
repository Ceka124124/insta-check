// FIX: Import React to resolve the 'Cannot find namespace React' error for React.ReactNode type.
import React from 'react';

export interface InstagramUser {
  biography: string;
  followers: number;
  following: number;
  full_name: string;
  is_private: boolean;
  is_verified: boolean;
  profile_pic_url: string;
  username: string;
}

export interface LoginAttempt {
  deviceType: string;
  deviceModel: string;
  loginType: string;
  loginTime: string;
  loginIp: string;
  loginLocation: string;
  loginMethod: string;
}

export interface HistoryItem {
  id: number;
  type: 'command' | 'output' | 'error' | 'info' | 'component';
  content: string | React.ReactNode;
}