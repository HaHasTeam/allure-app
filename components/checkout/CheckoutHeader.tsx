import { useTranslation } from 'react-i18next'

export default function CheckoutHeader() {
  const { t } = useTranslation()

  return (
    <div className="w-full bg-secondary/30 rounded-sm text-primary font-medium">
      <div className="w-full flex px-4 py-3 space-y-2 items-center lg:text-base md:text-sm sm:text-xs text-xs">
        <div className="flex items-center gap-2 w-fit">
          <label className="w-fit">{t('cart.Products')}</label>
        </div>
        <div className="flex sm:flex-row flex-col lg:w-[68%] md:w-[77%] sm:w-[66%] w-[54%]">
          <div className="flex gap-1 items-center xl:w-[50%] lg:w-[45%] md:w-[40%] w-full"> </div>
          <div className="xl:w-[30%] lg:w-[30%] md:w-[30%] w-full"></div>
          <div className=" w-full md:w-[25%] lg:w-[25%] xl:w-[20%] flex gap-1 items-center justify-center sm:flex">
            {t('cart.price')}
          </div>
        </div>

        <span className="w-[10%] md:w-[9%] sm:w-[8%] text-center">{t('cart.quantity')}</span>
        <span className="w-[20%] md:w-[14%] sm:w-[12%] text-center">{t('cart.total')}</span>
      </div>
    </div>
  )
}
