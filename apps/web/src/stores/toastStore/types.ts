export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info'
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}