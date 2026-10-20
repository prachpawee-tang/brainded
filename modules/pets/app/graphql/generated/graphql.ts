/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddPetNoteInput = {
  body: string;
  occurredOn: string;
  petId: string | number;
  type: PetNoteType;
};

export type ArchivePetInput = {
  id: string | number;
};

export type CreatePetInput = {
  birthDate?: string | null | undefined;
  breed?: string | null | undefined;
  name: string;
  notes?: string | null | undefined;
  photoKey?: string | null | undefined;
  sex?: PetSex | null | undefined;
  species: PetSpecies;
  speciesOther?: string | null | undefined;
};

export type LogPetWeightInput = {
  measuredOn: string;
  note?: string | null | undefined;
  petId: string | number;
  weightKg: number;
};

export type PetNoteType =
  | 'GENERAL'
  | 'GROOMING'
  | 'VACCINE'
  | 'VET_VISIT';

export type PetSex =
  | 'FEMALE'
  | 'MALE'
  | 'UNKNOWN';

export type PetSpecies =
  | 'CAT'
  | 'DOG'
  | 'OTHER';

export type PetTimelineKind =
  | 'NOTE_GENERAL'
  | 'NOTE_GROOMING'
  | 'NOTE_VACCINE'
  | 'NOTE_VET_VISIT'
  | 'WEIGHT';

export type UpdatePetInput = {
  birthDate?: string | null | undefined;
  breed?: string | null | undefined;
  id: string | number;
  name?: string | null | undefined;
  notes?: string | null | undefined;
  photoKey?: string | null | undefined;
  sex?: PetSex | null | undefined;
  species?: PetSpecies | null | undefined;
  speciesOther?: string | null | undefined;
};

export type PetListQueryVariables = Exact<{ [key: string]: never; }>;


export type PetListQuery = { __typename: 'Query', pets: { __typename: 'QueryPetsConnection', edges: Array<{ __typename: 'QueryPetsConnectionEdge', node: { __typename: 'Pet', id: string, name: string, species: PetSpecies, speciesOther: string | null, birthDate: string | null, photoUrl: string | null, latestWeight: { __typename: 'PetWeight', id: string, weightGrams: number, measuredOn: string } | null } }> } };

export type PetProfileQueryVariables = Exact<{
  id: string | number;
}>;


export type PetProfileQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, name: string, species: PetSpecies, speciesOther: string | null, breed: string | null, sex: PetSex, birthDate: string | null, notes: string | null, photoUrl: string | null, latestWeight: { __typename: 'PetWeight', id: string, weightGrams: number, measuredOn: string } | null, previousWeight: { __typename: 'PetWeight', id: string, weightGrams: number, measuredOn: string } | null } | null };

export type PetTimelineQueryVariables = Exact<{
  id: string | number;
  after?: string | null | undefined;
}>;


export type PetTimelineQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, timeline: { __typename: 'PetTimelineConnection', edges: Array<{ __typename: 'PetTimelineConnectionEdge', cursor: string, node: { __typename: 'PetTimelineEvent', id: string, kind: PetTimelineKind, occurredOn: string, body: string | null, weightGrams: number | null } }>, pageInfo: { __typename: 'PageInfo', hasNextPage: boolean, endCursor: string | null } } } | null };

export type CreatePetMutationVariables = Exact<{
  input: CreatePetInput;
}>;


export type CreatePetMutation = { __typename: 'Mutation', createPet:
    | { __typename: 'ForbiddenError', code: string }
    | { __typename: 'MutationCreatePetSuccess', data: { __typename: 'Pet', id: string } }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type UpdatePetMutationVariables = Exact<{
  input: UpdatePetInput;
}>;


export type UpdatePetMutation = { __typename: 'Mutation', updatePet:
    | { __typename: 'ForbiddenError', code: string }
    | { __typename: 'MutationUpdatePetSuccess', data: { __typename: 'Pet', id: string, name: string, species: PetSpecies, speciesOther: string | null, breed: string | null, sex: PetSex, birthDate: string | null, notes: string | null, photoUrl: string | null } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type ArchivePetMutationVariables = Exact<{
  input: ArchivePetInput;
}>;


export type ArchivePetMutation = { __typename: 'Mutation', archivePet:
    | { __typename: 'MutationArchivePetSuccess' }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
   };

export type LogPetWeightMutationVariables = Exact<{
  input: LogPetWeightInput;
}>;


export type LogPetWeightMutation = { __typename: 'Mutation', logPetWeight:
    | { __typename: 'MutationLogPetWeightSuccess', data: { __typename: 'Pet', id: string, latestWeight: { __typename: 'PetWeight', id: string, weightGrams: number, measuredOn: string } | null, previousWeight: { __typename: 'PetWeight', id: string, weightGrams: number, measuredOn: string } | null } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type AddPetNoteMutationVariables = Exact<{
  input: AddPetNoteInput;
}>;


export type AddPetNoteMutation = { __typename: 'Mutation', addPetNote:
    | { __typename: 'MutationAddPetNoteSuccess' }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };


export const PetListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"species"}},{"kind":"Field","name":{"kind":"Name","value":"speciesOther"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"latestWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PetListQuery, PetListQueryVariables>;
export const PetProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"species"}},{"kind":"Field","name":{"kind":"Name","value":"speciesOther"}},{"kind":"Field","name":{"kind":"Name","value":"breed"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"latestWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}}]} as unknown as DocumentNode<PetProfileQuery, PetProfileQueryVariables>;
export const PetTimelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetTimeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredOn"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PetTimelineQuery, PetTimelineQueryVariables>;
export const CreatePetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationCreatePetSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePetMutation, CreatePetMutationVariables>;
export const UpdatePetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationUpdatePetSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"species"}},{"kind":"Field","name":{"kind":"Name","value":"speciesOther"}},{"kind":"Field","name":{"kind":"Name","value":"breed"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePetMutation, UpdatePetMutationVariables>;
export const ArchivePetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchivePet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchivePetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archivePet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<ArchivePetMutation, ArchivePetMutationVariables>;
export const LogPetWeightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogPetWeight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LogPetWeightInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logPetWeight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationLogPetWeightSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"latestWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<LogPetWeightMutation, LogPetWeightMutationVariables>;
export const AddPetNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPetNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPetNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPetNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AddPetNoteMutation, AddPetNoteMutationVariables>;