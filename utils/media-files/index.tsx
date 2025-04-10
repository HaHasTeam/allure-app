export const getFileExtension = (fileUrl: string | undefined) => {
  if (!fileUrl) return ''
  const baseUrl = fileUrl.split('?')[0]
  const parts = baseUrl.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}
export const isImageFile = (fileUrl: string | undefined) => {
  const ext = getFileExtension(fileUrl)
  return ['jpg', 'jpeg', 'png'].includes(ext)
}
export const isVideoFile = (fileUrl: string | undefined) => {
  const ext = getFileExtension(fileUrl)
  return ['mp4', 'wmv', 'mov', 'avi', 'mkv', 'flv'].includes(ext)
}
