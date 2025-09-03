// Frontend TypeScript Types

export interface NavigationConfig {
  smoothScroll: boolean;
  activeClass: string;
  offset: number;
}

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: number;
}

export interface ObserverOptions {
  threshold: number;
  rootMargin: string;
}

export interface StatAnimation {
  element: HTMLElement;
  startValue: number;
  endValue: number;
  duration: number;
  originalText: string;
}

export interface TooltipConfig {
  className: string;
  offset: number;
  showDelay: number;
  hideDelay: number;
}

export interface ModalConfig {
  overlayClass: string;
  modalClass: string;
  closeButtonClass: string;
  animationDuration: number;
}

export interface LoginStep {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

export interface UserData {
  email: string;
  password?: string;
  testHistory?: TestSession[];
}

export interface TestSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  score?: number;
  answers: Answer[];
}

export interface Answer {
  questionId: number;
  selectedOption: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface ScoreCard {
  name: string;
  score: number;
  timeAgo: string;
  avatar: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EmailCheckResponse extends ApiResponse {
  exists: boolean;
  redirectUrl?: string;
}

export interface LoginResponse extends ApiResponse {
  token?: string;
  user?: UserData;
  redirectUrl?: string;
}
