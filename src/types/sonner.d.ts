import { ToastT as SonnerToast } from 'sonner';

declare module 'sonner' {
  interface Toast extends SonnerToast {}
}
