export type TGetProductByBrandIdRequestParams = {
  brandId: string
}
export type TGetProductFilterRequestParams = {
  search?: string
  brandId?: string
  categoryId?: string
  status?: string
  sortBy?: string
  order?: string
  page?: string | number
  limit?: string | number
}
