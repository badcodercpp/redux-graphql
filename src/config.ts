import { ReduxGraphqlConfig } from "./types/envTypes";

// local reference inside library
let config: ReduxGraphqlConfig = {
  ENDPOINT: "http://192.168.31.125:3000",
  WS_ENDPOINT: "ws://192.168.31.125:3000",
  API_PREFIX: "graphql",
};

// function the host React Native app can call when it starts up
export const initializeReduxGraphqlConfig = (
  reduxGraphqlConfig: ReduxGraphqlConfig,
) => {
  config = { ...config, ...reduxGraphqlConfig };
};

// Export active config
export const getConfig = () => config;
