import { toast } from 'sonner'

export function toastError(message: string, description?: string): void {
  toast.error(message, { description })
}

export function toastSuccess(message: string, description?: string): void {
  toast.success(message, { description })
}

export function toastInfo(message: string, description?: string): void {
  toast.message(message, { description })
}

export function toastWarning(message: string, description?: string): void {
  toast.warning(message, { description })
}

export async function copyWithToast(
  text: string,
  successLabel = 'Copied to clipboard'
): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    toastSuccess(successLabel)
    return true
  } catch {
    toastError('Could not copy', 'Clipboard access was blocked by the browser.')
    return false
  }
}
