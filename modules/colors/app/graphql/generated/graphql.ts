/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type ColorFavoriteKind =
  | 'COLOR'
  | 'COMBINATION';

export type SetColorFavoriteInput = {
  isFavorite: boolean;
  kind: ColorFavoriteKind;
  ref: string;
};

export type ColorFavoritesQueryVariables = Exact<{ [key: string]: never; }>;


export type ColorFavoritesQuery = { __typename: 'Query', colorFavorites: Array<{ __typename: 'ColorFavorite', id: string, kind: ColorFavoriteKind, ref: string }> };

export type SetColorFavoriteMutationVariables = Exact<{
  input: SetColorFavoriteInput;
}>;


export type SetColorFavoriteMutation = { __typename: 'Mutation', setColorFavorite:
    | { __typename: 'MutationSetColorFavoriteSuccess', data: Array<{ __typename: 'ColorFavorite', id: string, kind: ColorFavoriteKind, ref: string }> }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string }
   };


export const ColorFavoritesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ColorFavorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"colorFavorites"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"ref"}}]}}]}}]} as unknown as DocumentNode<ColorFavoritesQuery, ColorFavoritesQueryVariables>;
export const SetColorFavoriteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetColorFavorite"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetColorFavoriteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setColorFavorite"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSetColorFavoriteSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"ref"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<SetColorFavoriteMutation, SetColorFavoriteMutationVariables>;