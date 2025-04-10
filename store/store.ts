import { create } from 'zustand'
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { createAuthSlice } from './auth/auth-slice'
// import { createCartSlice } from './cart-slice'
import { Store } from './store.type'

export const useStore = create<Store>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...a) => ({
          ...createAuthSlice(...a),
          // ...createCartSlice(...a),
        })),
      ),
      {
        name: 'local-storage',
      },
    ),
  ),
)
