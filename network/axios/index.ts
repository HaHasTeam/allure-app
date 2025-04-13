import type { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'

import { axiosBaseOptions, axiosProvincesOptions } from '@/network/axios/axios-setup'
import type { AxiosDownload, Upload, UrlDownload } from '@/network/axios/type'
import { UploadStream } from '@/network/axios/type'

function analysisFilename(contentDisposition: string): string {
  let regex = /filename\*=\S+?''(.+?)(;|$)/
  if (regex.test(contentDisposition)) {
    return RegExp.$1
  }
  regex = /filename="{0,1}([\S\s]+?)"{0,1}(;|$)/
  if (regex.test(contentDisposition)) {
    return RegExp.$1
  }
  return 'filename="' + contentDisposition
}

class MyAxios {
  private readonly axiosInstance: AxiosInstance
  constructor(options: AxiosRequestConfig) {
    this.axiosInstance = axios.create(options)
    this.initInterceptors()
  }

  private initInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response.data
      },
      (error: AxiosError) => {
        throw error.response?.data
      }
    )
  }

  get<T>(url: string, data?: object): Promise<T> {
    return this.axiosInstance.get(url, { params: data })
  }

  post<T>(url: string, data?: object, params?: object): Promise<T> {
    return this.axiosInstance.post(url, data, { params })
  }

  put<T>(url: string, data?: object, params?: object): Promise<T> {
    return this.axiosInstance.put(url, data, { params })
  }

  delete<T>(url: string, data?: object): Promise<T> {
    return this.axiosInstance.delete(url, { params: data })
  }

  upload<T>(data: Upload): Promise<T> {
    const { url, formData, controller, onUploadProgress } = data
    return this.axiosInstance.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
      signal: controller ? controller.signal : undefined
    })
  }

  async uploadStream<T>(data: UploadStream): Promise<T> {
    const { url, file, controller, onUploadProgress } = data
    /** generateSHA  hash crypto-js **/
    // async function generateSHA(file: File): Promise<string> {
    //   const wordArray = CryptoJs.lib.WordArray.create(await file.arrayBuffer())
    //   const sha256 = CryptoJs.SHA256(wordArray)
    //   return sha256.toString()
    // }
    // const Hash = await generateSHA(File)
    const fileArrayBuffer = await file.arrayBuffer()
    return this.axiosInstance.post(url, fileArrayBuffer, {
      headers: { 'Content-Type': 'application/octet-stream' },
      onUploadProgress,
      signal: controller ? controller.signal : undefined
    })
  }

  axiosDownload(params: AxiosDownload): Promise<{ fileName: string }> {
    const { url, data, controller, fileName, onDownloadProgress } = params
    return new Promise((resolve, reject) => {
      this.axiosInstance
        .get<Blob>(url, {
          params: data,
          responseType: 'blob',
          onDownloadProgress,
          signal: controller ? controller.signal : undefined
        })
        .then((res) => {
          const blob = new Blob([res.data])
          const a = document.createElement('a')
          a.style.display = 'none'
          if (fileName) {
            a.download = fileName
          } else {
            a.download = decodeURIComponent(analysisFilename(res.headers['content-disposition']))
          }
          a.href = URL.createObjectURL(blob)
          document.body.appendChild(a)
          const downloadFileName = a.download
          a.click()
          URL.revokeObjectURL(a.href)
          document.body.removeChild(a)
          resolve({ fileName: downloadFileName })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  urlDownload(params: UrlDownload) {
    const { fileName, serveBaseUrl = process.env.EXPO_PUBLIC_API_URL, fileUrl } = params
    const a = document.createElement('a')
    a.style.display = 'none'
    a.download = fileName
    a.href = fileUrl.startsWith('http') ? fileUrl : `${serveBaseUrl}${fileUrl}`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }

  async axiosRequest<T>(options: AxiosRequestConfig): Promise<T> {
    console.log(options)
    return this.axiosInstance.request(options)
  }
}

export const request = new MyAxios(axiosBaseOptions)

export const axiosRequest = request.axiosRequest.bind(request)

export const provincesRequest = new MyAxios(axiosProvincesOptions)

export const axiosProvincesRequest = provincesRequest.axiosRequest.bind(provincesRequest)
