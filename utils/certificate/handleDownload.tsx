import i18next from 'i18next'

export const handleDownload = async (certificateUrl: string, name?: string, index?: string) => {
  try {
    const response = await fetch(certificateUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fileName = index !== '' ? `'${name}' ${index}` : `'${name}'`
    link.href = url
    link.download = i18next.t('productDetail.certificateOfProduct', {
      name: name ? fileName : i18next.t('cart.product'),
    })
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading certificate:', error)
  }
}
