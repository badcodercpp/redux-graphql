import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ReduxGraphqlAuthtokenState {
  accessToken?: string;
  refreshToken?: string;
}

const initialState: ReduxGraphqlAuthtokenState = {};

// Then, handle actions in your reducers:
export const reduxGraphqlSlice = createSlice({
  name: "reduxGraphqlAuth",
  initialState,
  reducers: {
    // standard reducer logic, with auto-generated action types per reducer
    setReduxGraphqlAuthTokens: (
      state,
      action: PayloadAction<{
        accessToken: string;
        refreshToken?: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    resetReduxGraphqlAuthTokens: (state) => {
      state.accessToken = undefined;
      state.refreshToken = undefined;
    },
  },
});

export const { setReduxGraphqlAuthTokens, resetReduxGraphqlAuthTokens } =
  reduxGraphqlSlice.actions;

export const reduxGraphqlReducer = reduxGraphqlSlice.reducer;
