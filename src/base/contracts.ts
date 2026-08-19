import { ApolloClient, TypedDocumentNode } from "@apollo/client";

import { ClientCommunicators } from "../communicator";
import { ExecutionResult } from "graphql";
import { ReduxGraphqlExactType } from "../types/exact";

/**
 * Abstract base class for executing typed GraphQL queries and mutations.
 * @template TVariables Shape of the input variables required by the GraphQL operation
 * @template TData Expected shape of the response payload
 */
export abstract class BaseGraphQLAccessor<
  TVariables extends { [key: string]: unknown },
  TData,
> {
  /**
   * Retrieves the authenticated Apollo Client instance.
   */
  protected async getGuardedOrOpenClient(): Promise<ApolloClient> {
    return await ClientCommunicators.instance.getGuardedOrOpenClient();
  }

  /**
   * Executes the GraphQL operation with the given variables.
   * @param variables Input parameters required by the GraphQL operation
   */
  abstract execute(
    variables: TVariables,
    targetGraphQL: TypedDocumentNode<TData, ReduxGraphqlExactType<TVariables>>,
  ): Promise<ExecutionResult<TData>>;
}
