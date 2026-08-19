import { ApolloClient, ApolloLink, InMemoryCache, split } from "@apollo/client";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { ReduxGraphqlConfig } from "../types/envTypes";
import { createClient } from "graphql-ws";
// @ts-ignore
import { createUploadLink } from "apollo-upload-client";
import { getConfig } from "../config";
import { getMainDefinition } from "@apollo/client/utilities";
import { map } from "rxjs";
import { setContext } from "@apollo/client/link/context";

export class ClientCommunicators {
  static #instance: ClientCommunicators;

  // Save a reference to the Redux store setup by the host app
  private store: any = null;

  private communicatorConfig: ReduxGraphqlConfig = getConfig();

  private guardedClient: ApolloClient | null = null;

  private constructor() {
    this.communicatorConfig = getConfig();
  }

  public static get instance(): ClientCommunicators {
    if (!ClientCommunicators.#instance) {
      ClientCommunicators.#instance = new ClientCommunicators();
    }
    return ClientCommunicators.#instance;
  }

  /**
   * Initialize the singleton with the host application's Redux Store
   */
  public initialize(storeInstance: any) {
    this.store = storeInstance;
  }

  /**
   * Helper to safely extract the token from the Redux state tree
   */
  private getLiveToken(): string {
    if (!this.store) {
      // @ts-ignore
      console.warn("Library store not initialized. Returning empty token.");
      return "";
    }
    // Access the state dynamically. Adjust the key names to match your final store setup.
    const state = this.store.getState();
    return state.reduxGraphqlAuth?.accessToken || "";
  }

  public getGuardedOrOpenClient() {
    if (this.guardedClient) {
      return this.guardedClient;
    }

    const wsLink = new GraphQLWsLink(
      createClient({
        url: `${this.communicatorConfig.WS_ENDPOINT}/${this.communicatorConfig.API_PREFIX}`,
        retryAttempts: Infinity,
        shouldRetry: () => true,
        connectionParams: async () => {
          // Grabs the fresh token directly from Redux right before connecting
          const token = this.getLiveToken();
          return {
            Authorization: token ? `Bearer ${token}` : "",
          };
        },
      }),
    );

    const loggingLink = new ApolloLink((operation, forward) => {
      // @ts-ignore
      console.tron.log("GraphQL Request:", operation);
      const observable = forward(operation);
      return observable.pipe(
        map((response) => {
          // @ts-ignore
          console.tron.log("GraphQL Response:", response);
          return response;
        }),
      );
    });

    const authLink = setContext(async (_, { headers }) => {
      // Grabs the fresh token from Redux for every standard HTTP request
      const token = this.getLiveToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    const uploadLink = createUploadLink({
      uri: `${this.communicatorConfig.ENDPOINT}/${this.communicatorConfig.API_PREFIX}`,
      headers: {
        "apollo-require-preflight": "true",
      },
    });

    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      uploadLink,
    );

    this.guardedClient = new ApolloClient({
      link: ApolloLink.from([loggingLink, authLink, splitLink]),
      cache: new InMemoryCache(),
    });

    return this.guardedClient;
  }

  /**
   * Clears the Apollo Client cache (useful on logout)
   */
  public async clearCache() {
    if (this.guardedClient) {
      await this.guardedClient.clearStore();
    }
  }
}
