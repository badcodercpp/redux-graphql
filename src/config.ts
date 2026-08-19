import { ReduxGraphqlConfig } from "./types/envTypes";

// local reference inside library
let config: ReduxGraphqlConfig = {
  REDUX_GRAPGQL_NATIVE_ENDPOINT: "http://192.168.31.125:3000",
  REDUX_GRAPGQL_NATIVE_WS_ENDPOINT: "ws://192.168.31.125:3000",
  REDUX_GRAPGQL_NATIVE_API_PREFIX: "graphql",
};

// function the host React Native app can call when it starts up
export const initializeReduxGraphqlNativeConfig = (
  reduxGraphqlNativeConfig: ReduxGraphqlConfig,
) => {
  config = { ...config, ...reduxGraphqlNativeConfig };
};

// Export active config
export const getConfig = () => config;
