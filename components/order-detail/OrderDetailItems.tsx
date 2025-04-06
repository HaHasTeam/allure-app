import { useTranslation } from 'react-i18next'

import { IBrand } from '@/types/brand'
import { ClassificationTypeEnum, ShippingStatusEnum, StatusEnum } from '@/types/enum'
import { IMasterConfig } from '@/types/master-config'
import { IOrderDetail } from '@/types/order'
import { IStatusTracking } from '@/types/status-tracking'

import ProductOrderDetailLandscape from './ProductOrderDetailLandscape'

interface OrderDetailItemsProps {
  orderDetails: IOrderDetail[]
  status: ShippingStatusEnum
  brand: IBrand | null
  accountAvatar: string
  accountName: string
  statusTracking?: IStatusTracking[]
  masterConfig?: IMasterConfig[]
}
const OrderDetailItems = ({
  accountAvatar,
  accountName,
  orderDetails,
  status,
  brand,
  statusTracking,
  masterConfig,
}: OrderDetailItemsProps) => {
  const { t } = useTranslation()
  return (
    <div className="w-full">
      <div className="w-full flex gap-2 p-2 md:p-3 lg:p-4 bg-secondary/30 rounded-sm text-secondary-foreground">
        <div className="overflow-x-visible text-nowrap flex gap-1 items-center lg:w-[10%] md:w-[10%] sm:w-[14%] w-[16%] justify-start text-xs sm:text-sm md:text-base text-center">
          {t('orderDetail.products')} ({orderDetails?.length} {t('cart.products')})
        </div>
        {/* <div className='order-3 sm:order-2 xl:w-[30%] lg:w-[30%] md:w-[30%] w-full flex md:flex-row flex-col justify-center items-center'>
          {t('orderDetail.classification')}
        </div> */}
        <div className="flex sm:flex-row flex-col lg:w-[67%] md:w-[67%] sm:w-[66%] w-[54%] gap-2">
          <div className="flex gap-1 items-center xl:w-[50%] lg:w-[45%] md:w-[40%] w-full"></div>
          <div className="xl:w-[30%] lg:w-[30%] md:w-[30%] w-full"></div>
          <div className="hidden w-full md:w-[25%] lg:w-[25%] xl:w-[20%] sm:flex gap-1 items-center justify-start sm:justify-end">
            {t('orderDetail.price')}
          </div>
          {/* <div className='order-2 sm:order-3 w-full md:w-[25%] lg:w-[25%] xl:w-[20%] flex items-center justify-end text-xs sm:text-sm md:text-base text-end'>
            {t('orderDetail.price')}
          </div> */}
        </div>
        <div className="w-[10%] md:w-[9%] sm:w-[8%] flex items-center justify-end text-xs sm:text-sm md:text-base text-center">
          {t('orderDetail.quantity')}
        </div>
        <div className="w-[20%] md:w-[14%] sm:w-[12%] flex items-center justify-end text-xs sm:text-sm md:text-base text-center">
          {t('orderDetail.subTotal')}
        </div>
      </div>
      <div className="bg-white rounded-md">
        {orderDetails?.map((orderDetail) => (
          <div
            key={
              orderDetail?.id +
              orderDetail?.type +
              (
                orderDetail?.productClassification?.preOrderProduct ??
                orderDetail?.productClassification?.productDiscount ??
                orderDetail?.productClassification
              )?.product?.id
            }
          >
            <ProductOrderDetailLandscape
              productImage={
                (orderDetail?.productClassification?.type === ClassificationTypeEnum.DEFAULT
                  ? (
                      orderDetail?.productClassification?.preOrderProduct ??
                      orderDetail?.productClassification?.productDiscount ??
                      orderDetail?.productClassification
                    )?.product?.images?.filter((img) => img?.status === StatusEnum.ACTIVE)[0]?.fileUrl
                  : orderDetail?.productClassification?.images?.[0]?.fileUrl) ?? ''
              }
              productId={
                (
                  orderDetail?.productClassification?.preOrderProduct ??
                  orderDetail?.productClassification?.productDiscount ??
                  orderDetail?.productClassification
                )?.product?.id ?? ''
              }
              productName={
                (
                  orderDetail?.productClassification?.preOrderProduct ??
                  orderDetail?.productClassification?.productDiscount ??
                  orderDetail?.productClassification
                )?.product?.name ?? ''
              }
              eventType={orderDetail?.type ?? ''}
              unitPriceAfterDiscount={orderDetail?.unitPriceAfterDiscount}
              unitPriceBeforeDiscount={orderDetail?.unitPriceBeforeDiscount}
              subTotal={orderDetail?.subTotal}
              productQuantity={orderDetail?.quantity}
              productClassification={orderDetail?.productClassification}
              status={status}
              feedback={orderDetail?.feedback ?? null}
              orderDetailId={orderDetail?.id}
              brand={brand || null}
              accountAvatar={accountAvatar}
              accountName={accountName}
              masterConfig={masterConfig}
              statusTracking={statusTracking}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderDetailItems
