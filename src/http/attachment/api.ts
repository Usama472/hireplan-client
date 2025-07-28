import { API_URL } from '../apiHelper'

export const uploadAttachment = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_URL}/attachments`, {
      method: 'POST',
      body: formData,
    })
    const payload = await response.json()
    return payload?.data?.fileUrl || ''
  } catch (e: any) {
    console.error(e)
    return ''
  }
}
