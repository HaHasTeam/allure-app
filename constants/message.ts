export const productFormMessage = {
  SKURequired: 'SKU phân loại sản phẩm không thể trùng',
  priceValidate: 'Price must be at least 1000đ.',
  quantityValidate: 'Quantity must be at least 1.',
  quantityRequired: 'Quantity is required when no product classifications are provided.',
  quantityClassificationRequired: 'Quantity is required',
  priceRequired: 'Price is required when no product classifications are provided.',
  priceClassificationRequired: 'Price is required',
  productNameRequired: 'Product name is required.',
  productNameLengthRequired: 'Product name must be less than 120 characters.',
  brandRequired: 'Brand is required',
  categoryRequired: 'Vui lòng chọn danh mục.',
  imagesRequired: 'Vui lòng chọn ít nhất một ảnh.',
  descriptionRequired: 'Vui lòng nhập mô tả.',
  descriptionTooLong: 'Description too long',
  statusRequired: 'Vui lòng điền trạng thái.',
  classificationTitleRequired: 'Classification title is required.',
  successCreateOfficialMessage: '',
  successUpdateOfficialMessage:
    'Product updated successfully! It is active and visible on the website after moderator approval.',
  successCreateInactiveMessage: '',
  successUpdateInactiveMessage:
    'Product updated successfully! It is currently inactive and will not be visible until activated.',
  successStatusMessage: 'Update product status successfully!',
  categoryLastLevel: 'Please select the last-level category.',
}

export const productPageMessage = {
  emptyProductTitle: 'Product Not Found',
  emptyProductMessage:
    'The product you are looking for does not exist. It may have been removed from the website or is currently unavailable.',
}
export const normalOrderFormMessage = {
  success: '',
  failed: '',
  loading: '',
  required: 'Required',
  min: 'Must be at least {min}',
  max: 'Must be at most {max}',
  pattern: 'Must match the pattern {pattern}',
}
