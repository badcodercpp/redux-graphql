import { BaseGraphQLAccessor } from "./contracts";
import { ReduxGraphqlExactType } from "../types/exact";
import { TypedDocumentNode } from "@apollo/client";

export class GuardedOrOpenQueryAccessor<
  TVariables extends { [key: string]: unknown },
  TData,
> extends BaseGraphQLAccessor<TVariables, TData> {
  async execute(
    variables: TVariables,
    targetGraphQL: TypedDocumentNode<TData, ReduxGraphqlExactType<TVariables>>,
  ) {
    const graphqlGuardedOrOpenClient = await this.getGuardedOrOpenClient();

    const response = await graphqlGuardedOrOpenClient.query({
      query: targetGraphQL,
      variables,
    });
    return response;
  }
}
