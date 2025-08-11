import { toast as sonnerToast } from 'sonner'

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  title?: string
  description?: string
  type?: ToastType
  duration?: number
}

export function useToast() {
  const toast = (options: ToastOptions) => {
    const { title, description, type = 'default', duration = 5000 } = options

    switch (type) {
      case 'success':
        return sonnerToast.success(title, { description, duration })
      case 'error':
        return sonnerToast.error(title, { description, duration })
      case 'warning':
        return sonnerToast(title, { description, duration })
      case 'info':
        return sonnerToast.info(title, { description, duration })
      default:
        return sonnerToast(title, { description, duration })
    }
  }

  return { toast }
}
