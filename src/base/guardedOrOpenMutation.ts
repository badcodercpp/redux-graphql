import { BaseGraphQLAccessor } from "./contracts";
import { ReduxGraphqlExactType } from "../types/exact";
import { TypedDocumentNode } from "@apollo/client";

export class GuardedMutationAccessor<
  TVariables extends { [key: string]: unknown },
  TData,
> extends BaseGraphQLAccessor<TVariables, TData> {
  async execute(
    variables: TVariables,
    targetGraphQL: TypedDocumentNode<TData, ReduxGraphqlExactType<TVariables>>,
  ) {
    const graphqlGuardedOrOpenClient = await this.getGuardedOrOpenClient();

    const response = await graphqlGuardedOrOpenClient.mutate({
      mutation: targetGraphQL,
      variables,
    });
    return response;
  }
}
