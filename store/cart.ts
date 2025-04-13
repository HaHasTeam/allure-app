import { create } from 'zustand'

import { ICartByBrand } from '@/types/cart'
import { TGroupBuying } from '@/types/group-buying'
import { IOrder } from '@/types/order'
import { TVoucher } from '@/types/voucher'

export interface CartState {
  //myCart
  cartItems: ICartByBrand
  groupBuying?: TGroupBuying
  groupBuyingOrder?: IOrder
  setGroupBuyingOrder: (groupBuyingOrder?: IOrder) => void
  setGroupBuying: (groupBuying?: TGroupBuying) => void
  setCartItems: (cartItem: ICartByBrand) => void
  // Selected cart items
  selectedCartItem: ICartByBrand | null
  setSelectedCartItem: (cart: ICartByBrand | null) => void

  // Vouchers by brand
  chosenBrandVouchers: { [brandId: string]: TVoucher | null }
  setChosenBrandVouchers: (vouchers: { [brandId: string]: TVoucher | null }) => void
  updateBrandVoucher: (brandId: string, voucher: TVoucher | null) => void

  // Platform voucher
  chosenPlatformVoucher: TVoucher | null
  setChosenPlatformVoucher: (voucher: TVoucher | null) => void

  // Reset state
  resetSelectedCartItem: () => void
  resetCart: () => void
}

const initialState = {
  groupBuying: undefined,
  cartItems: {},
  selectedCartItem: null,
  chosenBrandVouchers: {},
  chosenPlatformVoucher: null,
  groupBuyingOrder: undefined
}

const useCartStore = create<CartState>((set) => ({
  // Initial state
  ...initialState,

  // Setters
  setSelectedCartItem: (cart) => set({ selectedCartItem: cart }),
  setCartItems: (cartItem) => set({ cartItems: cartItem }),
  setChosenBrandVouchers: (vouchers) => set({ chosenBrandVouchers: vouchers }),

  updateBrandVoucher: (brandId, voucher) =>
    set((state) => ({
      chosenBrandVouchers: {
        ...state.chosenBrandVouchers,
        [brandId]: voucher
      }
    })),

  setChosenPlatformVoucher: (voucher) => set({ chosenPlatformVoucher: voucher }),
  resetSelectedCartItem: () =>
    set({
      selectedCartItem: null,
      chosenBrandVouchers: {},
      chosenPlatformVoucher: null
    }),

  // Reset function
  resetCart: () => set(initialState),
  setGroupBuying: (groupBuying) => set({ groupBuying }),
  setGroupBuyingOrder: (groupBuyingOrder) => set({ groupBuyingOrder })
}))

export default useCartStore

export const useSelectedCartItem = () => useCartStore((state) => state.selectedCartItem)
export const useChosenVouchersByBrand = () => useCartStore((state) => state.chosenBrandVouchers)
export const usePlatformChosenVoucher = () => useCartStore((state) => state.chosenPlatformVoucher)
