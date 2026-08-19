export type ReduxGraphqlExactType<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
