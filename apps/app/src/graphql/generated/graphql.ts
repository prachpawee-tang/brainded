/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Language =
  | 'EN'
  | 'TH';

export type SetModuleEnabledInput = {
  enabled: boolean;
  moduleId: string;
};

export type ThemePreference =
  | 'DARK'
  | 'LIGHT'
  | 'SYSTEM';

export type UpdatePreferencesInput = {
  locale?: Language | null | undefined;
  theme?: ThemePreference | null | undefined;
};

export type ViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type ViewerQuery = { __typename: 'Query', viewer: { __typename: 'Viewer', id: string, name: string, username: string | null, email: string, locale: Language, theme: ThemePreference, modules: Array<{ __typename: 'UserModule', moduleId: string, enabled: boolean }> } | null };

export type UpdatePreferencesMutationVariables = Exact<{
  input: UpdatePreferencesInput;
}>;


export type UpdatePreferencesMutation = { __typename: 'Mutation', updatePreferences:
    | { __typename: 'MutationUpdatePreferencesSuccess', data: { __typename: 'Viewer', id: string, locale: Language, theme: ThemePreference } }
    | { __typename: 'UnauthenticatedError', code: string }
   };

export type SetModuleEnabledMutationVariables = Exact<{
  input: SetModuleEnabledInput;
}>;


export type SetModuleEnabledMutation = { __typename: 'Mutation', setModuleEnabled:
    | { __typename: 'MutationSetModuleEnabledSuccess', data: { __typename: 'UserModule', moduleId: string, enabled: boolean } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
   };


export const ViewerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"viewer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}},{"kind":"Field","name":{"kind":"Name","value":"modules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moduleId"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}}]}}]} as unknown as DocumentNode<ViewerQuery, ViewerQueryVariables>;
export const UpdatePreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePreferences"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePreferencesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePreferences"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationUpdatePreferencesSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"theme"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePreferencesMutation, UpdatePreferencesMutationVariables>;
export const SetModuleEnabledDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetModuleEnabled"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetModuleEnabledInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setModuleEnabled"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSetModuleEnabledSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moduleId"}},{"kind":"Field","name":{"kind":"Name","value":"enabled"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<SetModuleEnabledMutation, SetModuleEnabledMutationVariables>;