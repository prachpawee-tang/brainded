/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query PetList {\n    pets(first: 50) {\n      edges {\n        node {\n          id\n          name\n          species\n          speciesOther\n          birthDate\n          photoUrl\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n    }\n  }\n": typeof types.PetListDocument,
    "\n  query PetProfile($id: ID!) {\n    pet(id: $id) {\n      id\n      name\n      species\n      speciesOther\n      breed\n      sex\n      birthDate\n      notes\n      photoUrl\n      latestWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n      previousWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n    }\n  }\n": typeof types.PetProfileDocument,
    "\n  query PetTimeline($id: ID!, $after: String) {\n    pet(id: $id) {\n      id\n      timeline(first: 20, after: $after) {\n        edges {\n          cursor\n          node {\n            id\n            kind\n            occurredOn\n            body\n            weightGrams\n          }\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n": typeof types.PetTimelineDocument,
    "\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      __typename\n      ... on MutationCreatePetSuccess {\n        data {\n          id\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": typeof types.CreatePetDocument,
    "\n  mutation UpdatePet($input: UpdatePetInput!) {\n    updatePet(input: $input) {\n      __typename\n      ... on MutationUpdatePetSuccess {\n        data {\n          id\n          name\n          species\n          speciesOther\n          breed\n          sex\n          birthDate\n          notes\n          photoUrl\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": typeof types.UpdatePetDocument,
    "\n  mutation ArchivePet($input: ArchivePetInput!) {\n    archivePet(input: $input) {\n      __typename\n      ... on Error {\n        code\n      }\n    }\n  }\n": typeof types.ArchivePetDocument,
    "\n  mutation LogPetWeight($input: LogPetWeightInput!) {\n    logPetWeight(input: $input) {\n      __typename\n      ... on MutationLogPetWeightSuccess {\n        data {\n          id\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n          previousWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": typeof types.LogPetWeightDocument,
    "\n  mutation AddPetNote($input: AddPetNoteInput!) {\n    addPetNote(input: $input) {\n      __typename\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": typeof types.AddPetNoteDocument,
};
const documents: Documents = {
    "\n  query PetList {\n    pets(first: 50) {\n      edges {\n        node {\n          id\n          name\n          species\n          speciesOther\n          birthDate\n          photoUrl\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n    }\n  }\n": types.PetListDocument,
    "\n  query PetProfile($id: ID!) {\n    pet(id: $id) {\n      id\n      name\n      species\n      speciesOther\n      breed\n      sex\n      birthDate\n      notes\n      photoUrl\n      latestWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n      previousWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n    }\n  }\n": types.PetProfileDocument,
    "\n  query PetTimeline($id: ID!, $after: String) {\n    pet(id: $id) {\n      id\n      timeline(first: 20, after: $after) {\n        edges {\n          cursor\n          node {\n            id\n            kind\n            occurredOn\n            body\n            weightGrams\n          }\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n": types.PetTimelineDocument,
    "\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      __typename\n      ... on MutationCreatePetSuccess {\n        data {\n          id\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": types.CreatePetDocument,
    "\n  mutation UpdatePet($input: UpdatePetInput!) {\n    updatePet(input: $input) {\n      __typename\n      ... on MutationUpdatePetSuccess {\n        data {\n          id\n          name\n          species\n          speciesOther\n          breed\n          sex\n          birthDate\n          notes\n          photoUrl\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": types.UpdatePetDocument,
    "\n  mutation ArchivePet($input: ArchivePetInput!) {\n    archivePet(input: $input) {\n      __typename\n      ... on Error {\n        code\n      }\n    }\n  }\n": types.ArchivePetDocument,
    "\n  mutation LogPetWeight($input: LogPetWeightInput!) {\n    logPetWeight(input: $input) {\n      __typename\n      ... on MutationLogPetWeightSuccess {\n        data {\n          id\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n          previousWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": types.LogPetWeightDocument,
    "\n  mutation AddPetNote($input: AddPetNoteInput!) {\n    addPetNote(input: $input) {\n      __typename\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n": types.AddPetNoteDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PetList {\n    pets(first: 50) {\n      edges {\n        node {\n          id\n          name\n          species\n          speciesOther\n          birthDate\n          photoUrl\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PetList {\n    pets(first: 50) {\n      edges {\n        node {\n          id\n          name\n          species\n          speciesOther\n          birthDate\n          photoUrl\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PetProfile($id: ID!) {\n    pet(id: $id) {\n      id\n      name\n      species\n      speciesOther\n      breed\n      sex\n      birthDate\n      notes\n      photoUrl\n      latestWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n      previousWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n    }\n  }\n"): (typeof documents)["\n  query PetProfile($id: ID!) {\n    pet(id: $id) {\n      id\n      name\n      species\n      speciesOther\n      breed\n      sex\n      birthDate\n      notes\n      photoUrl\n      latestWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n      previousWeight {\n        id\n        weightGrams\n        measuredOn\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PetTimeline($id: ID!, $after: String) {\n    pet(id: $id) {\n      id\n      timeline(first: 20, after: $after) {\n        edges {\n          cursor\n          node {\n            id\n            kind\n            occurredOn\n            body\n            weightGrams\n          }\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query PetTimeline($id: ID!, $after: String) {\n    pet(id: $id) {\n      id\n      timeline(first: 20, after: $after) {\n        edges {\n          cursor\n          node {\n            id\n            kind\n            occurredOn\n            body\n            weightGrams\n          }\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      __typename\n      ... on MutationCreatePetSuccess {\n        data {\n          id\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation CreatePet($input: CreatePetInput!) {\n    createPet(input: $input) {\n      __typename\n      ... on MutationCreatePetSuccess {\n        data {\n          id\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdatePet($input: UpdatePetInput!) {\n    updatePet(input: $input) {\n      __typename\n      ... on MutationUpdatePetSuccess {\n        data {\n          id\n          name\n          species\n          speciesOther\n          breed\n          sex\n          birthDate\n          notes\n          photoUrl\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation UpdatePet($input: UpdatePetInput!) {\n    updatePet(input: $input) {\n      __typename\n      ... on MutationUpdatePetSuccess {\n        data {\n          id\n          name\n          species\n          speciesOther\n          breed\n          sex\n          birthDate\n          notes\n          photoUrl\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ArchivePet($input: ArchivePetInput!) {\n    archivePet(input: $input) {\n      __typename\n      ... on Error {\n        code\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation ArchivePet($input: ArchivePetInput!) {\n    archivePet(input: $input) {\n      __typename\n      ... on Error {\n        code\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LogPetWeight($input: LogPetWeightInput!) {\n    logPetWeight(input: $input) {\n      __typename\n      ... on MutationLogPetWeightSuccess {\n        data {\n          id\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n          previousWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation LogPetWeight($input: LogPetWeightInput!) {\n    logPetWeight(input: $input) {\n      __typename\n      ... on MutationLogPetWeightSuccess {\n        data {\n          id\n          latestWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n          previousWeight {\n            id\n            weightGrams\n            measuredOn\n          }\n        }\n      }\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddPetNote($input: AddPetNoteInput!) {\n    addPetNote(input: $input) {\n      __typename\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation AddPetNote($input: AddPetNoteInput!) {\n    addPetNote(input: $input) {\n      __typename\n      ... on ValidationError {\n        issues {\n          path\n          code\n        }\n      }\n      ... on Error {\n        code\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;