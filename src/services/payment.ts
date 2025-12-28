import { WEBHOOK_PAYMENT_PROOF } from '../config'

export async function submitPaymentProof(trxId: string, file: File, outlet: string, nomorInvoice?: string): Promise<boolean> {
  const formData = new FormData()
  formData.append('trxId', trxId)
  formData.append('outlet', outlet)
  formData.append('file', file)
  if (nomorInvoice) formData.append('nomorInvoice', nomorInvoice)

  try {
    const response = await fetch(WEBHOOK_PAYMENT_PROOF, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    throw error
  }
}
