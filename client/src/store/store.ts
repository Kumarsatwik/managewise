import { immer } from "zustand/middleware/immer";
import createSelectors from "./selectors";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { create, StateCreator } from "zustand";

type AuthState = {
  accessToken: string | null;
  user: null;
  setAccessToken: (token: string | null) => void;
  clearAccessToken: () => void;
};

const createAuthSlice: StateCreator<AuthState> = (set) => ({
  user: null,
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => set({ accessToken: null }),
});

type StoreType = AuthState;

export const useStoreBase = create<StoreType>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((...a) => ({
          ...createAuthSlice(...a),
        }))
      ),
      {
        name: "session-storage", // Name of the item in localStorage (or sessionStorage)
        getStorage: () => sessionStorage, // (optional) by default it's localStorage
      }
    )
  )
);
export const useStore = createSelectors(useStoreBase);
