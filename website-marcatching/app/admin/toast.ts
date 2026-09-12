'use client'

export type AdminToastType = 'success' | 'error'

export function showAdminToast(message = 'Updated Successfully', type: AdminToastType = 'success') {
  window.dispatchEvent(new CustomEvent('show-admin-toast', { detail: { message, type } }))
}
