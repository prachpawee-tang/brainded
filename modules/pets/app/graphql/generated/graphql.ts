/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AddPetAppointmentInput = {
  clinic?: string | null | undefined;
  note?: string | null | undefined;
  petId: string | number;
  reason: string;
  scheduledAt: string;
};

export type AddPetLabResultInput = {
  clinic?: string | null | undefined;
  note?: string | null | undefined;
  petId: string | number;
  photoKeys?: Array<string> | null | undefined;
  takenOn: string;
  title: string;
  values: Array<PetLabValueInput>;
};

export type AddPetMedicationInput = {
  dosage?: string | null | undefined;
  endOn?: string | null | undefined;
  everyDays: number;
  name: string;
  note?: string | null | undefined;
  petId: string | number;
  startOn: string;
  times: Array<string>;
};

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

export type DeletePetLabResultInput = {
  id: string | number;
};

export type LogPetWeightInput = {
  measuredOn: string;
  note?: string | null | undefined;
  petId: string | number;
  weightKg: number;
};

export type PetAppointmentStatus =
  | 'CANCELLED'
  | 'DONE'
  | 'SCHEDULED';

export type PetLabFlag =
  | 'HIGH'
  | 'LOW'
  | 'NORMAL'
  | 'UNKNOWN';

export type PetLabValueInput = {
  name: string;
  refHigh?: number | null | undefined;
  refLow?: number | null | undefined;
  unit?: string | null | undefined;
  value: number;
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
  | 'APPOINTMENT_DONE'
  | 'LAB_RESULT'
  | 'MEDICATION_STARTED'
  | 'NOTE_GENERAL'
  | 'NOTE_GROOMING'
  | 'NOTE_VACCINE'
  | 'NOTE_VET_VISIT'
  | 'WEIGHT';

export type SetDoseTakenInput = {
  date: string;
  medicationId: string | number;
  taken: boolean;
  time: string;
};

export type SetPetAppointmentStatusInput = {
  id: string | number;
  localDate?: string | null | undefined;
  status: PetAppointmentStatus;
};

export type UpdatePetAppointmentInput = {
  clinic?: string | null | undefined;
  id: string | number;
  note?: string | null | undefined;
  reason: string;
  scheduledAt: string;
};

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

export type UpdatePetMedicationInput = {
  dosage?: string | null | undefined;
  endOn?: string | null | undefined;
  everyDays: number;
  id: string | number;
  name: string;
  note?: string | null | undefined;
  startOn: string;
  times: Array<string>;
};

export type PetWeightsQueryVariables = Exact<{
  id: string | number;
  since?: string | null | undefined;
}>;


export type PetWeightsQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, weights: Array<{ __typename: 'PetWeight', id: string, weightGrams: number, measuredOn: string }> } | null };

export type PetTodayQueryVariables = Exact<{
  id: string | number;
  date: string;
}>;


export type PetTodayQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, dosesOn: Array<{ __typename: 'PetDose', id: string, time: string, takenAt: string | null, medication: { __typename: 'PetMedication', id: string, name: string, dosage: string | null } }>, nextAppointment: { __typename: 'PetAppointment', id: string, scheduledAt: string, reason: string, clinic: string | null } | null } | null };

export type SetDoseTakenMutationVariables = Exact<{
  input: SetDoseTakenInput;
}>;


export type SetDoseTakenMutation = { __typename: 'Mutation', setDoseTaken:
    | { __typename: 'MutationSetDoseTakenSuccess', data: { __typename: 'PetDose', id: string, takenAt: string | null } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
   };

export type PetLabResultsQueryVariables = Exact<{
  id: string | number;
  first?: number | null | undefined;
}>;


export type PetLabResultsQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, labResults: Array<{ __typename: 'PetLabResult', id: string, takenOn: string, title: string, clinic: string | null, abnormalCount: number }> } | null };

export type PetLabResultQueryVariables = Exact<{
  id: string | number;
  labId: string | number;
}>;


export type PetLabResultQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, name: string, labResult: { __typename: 'PetLabResult', id: string, takenOn: string, title: string, clinic: string | null, note: string | null, abnormalCount: number, values: Array<{ __typename: 'PetLabValue', id: string, name: string, value: number, unit: string | null, refLow: number | null, refHigh: number | null, flag: PetLabFlag }>, photos: Array<{ __typename: 'PetAttachment', id: string, url: string }> } | null } | null };

export type AddPetLabResultMutationVariables = Exact<{
  input: AddPetLabResultInput;
}>;


export type AddPetLabResultMutation = { __typename: 'Mutation', addPetLabResult:
    | { __typename: 'ForbiddenError', code: string }
    | { __typename: 'MutationAddPetLabResultSuccess', data: { __typename: 'PetLabResult', id: string } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type DeletePetLabResultMutationVariables = Exact<{
  input: DeletePetLabResultInput;
}>;


export type DeletePetLabResultMutation = { __typename: 'Mutation', deletePetLabResult:
    | { __typename: 'MutationDeletePetLabResultSuccess' }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
   };

export type PetMedicationsQueryVariables = Exact<{
  id: string | number;
}>;


export type PetMedicationsQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, medications: Array<{ __typename: 'PetMedication', id: string, name: string, dosage: string | null, times: Array<string>, everyDays: number, startOn: string, endOn: string | null, note: string | null }> } | null };

export type AddPetMedicationMutationVariables = Exact<{
  input: AddPetMedicationInput;
}>;


export type AddPetMedicationMutation = { __typename: 'Mutation', addPetMedication:
    | { __typename: 'MutationAddPetMedicationSuccess', data: { __typename: 'PetMedication', id: string } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type UpdatePetMedicationMutationVariables = Exact<{
  input: UpdatePetMedicationInput;
}>;


export type UpdatePetMedicationMutation = { __typename: 'Mutation', updatePetMedication:
    | { __typename: 'MutationUpdatePetMedicationSuccess', data: { __typename: 'PetMedication', id: string, name: string, dosage: string | null, times: Array<string>, everyDays: number, startOn: string, endOn: string | null, note: string | null } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type PetAppointmentsQueryVariables = Exact<{
  id: string | number;
}>;


export type PetAppointmentsQuery = { __typename: 'Query', pet: { __typename: 'Pet', id: string, appointments: Array<{ __typename: 'PetAppointment', id: string, scheduledAt: string, reason: string, clinic: string | null, note: string | null, status: PetAppointmentStatus }> } | null };

export type AddPetAppointmentMutationVariables = Exact<{
  input: AddPetAppointmentInput;
}>;


export type AddPetAppointmentMutation = { __typename: 'Mutation', addPetAppointment:
    | { __typename: 'MutationAddPetAppointmentSuccess', data: { __typename: 'PetAppointment', id: string } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type UpdatePetAppointmentMutationVariables = Exact<{
  input: UpdatePetAppointmentInput;
}>;


export type UpdatePetAppointmentMutation = { __typename: 'Mutation', updatePetAppointment:
    | { __typename: 'MutationUpdatePetAppointmentSuccess', data: { __typename: 'PetAppointment', id: string, scheduledAt: string, reason: string, clinic: string | null, note: string | null, status: PetAppointmentStatus } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
    | { __typename: 'ValidationError', code: string, issues: Array<{ __typename: 'ValidationIssue', path: Array<string>, code: string }> }
   };

export type SetPetAppointmentStatusMutationVariables = Exact<{
  input: SetPetAppointmentStatusInput;
}>;


export type SetPetAppointmentStatusMutation = { __typename: 'Mutation', setPetAppointmentStatus:
    | { __typename: 'MutationSetPetAppointmentStatusSuccess', data: { __typename: 'PetAppointment', id: string, status: PetAppointmentStatus } }
    | { __typename: 'NotFoundError', code: string }
    | { __typename: 'UnauthenticatedError', code: string }
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


export const PetWeightsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetWeights"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"since"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LocalDate"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weights"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"since"},"value":{"kind":"Variable","name":{"kind":"Name","value":"since"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}}]} as unknown as DocumentNode<PetWeightsQuery, PetWeightsQueryVariables>;
export const PetTodayDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetToday"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LocalDate"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dosesOn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"date"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"time"}},{"kind":"Field","name":{"kind":"Name","value":"takenAt"}},{"kind":"Field","name":{"kind":"Name","value":"medication"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dosage"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextAppointment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"clinic"}}]}}]}}]}}]} as unknown as DocumentNode<PetTodayQuery, PetTodayQueryVariables>;
export const SetDoseTakenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetDoseTaken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetDoseTakenInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setDoseTaken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSetDoseTakenSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"takenAt"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<SetDoseTakenMutation, SetDoseTakenMutationVariables>;
export const PetLabResultsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetLabResults"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"labResults"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"takenOn"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"clinic"}},{"kind":"Field","name":{"kind":"Name","value":"abnormalCount"}}]}}]}}]}}]} as unknown as DocumentNode<PetLabResultsQuery, PetLabResultsQueryVariables>;
export const PetLabResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetLabResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"labId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"labResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"labId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"takenOn"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"clinic"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"abnormalCount"}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"refLow"}},{"kind":"Field","name":{"kind":"Name","value":"refHigh"}},{"kind":"Field","name":{"kind":"Name","value":"flag"}}]}},{"kind":"Field","name":{"kind":"Name","value":"photos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PetLabResultQuery, PetLabResultQueryVariables>;
export const AddPetLabResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPetLabResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPetLabResultInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPetLabResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationAddPetLabResultSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AddPetLabResultMutation, AddPetLabResultMutationVariables>;
export const DeletePetLabResultDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeletePetLabResult"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"DeletePetLabResultInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deletePetLabResult"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<DeletePetLabResultMutation, DeletePetLabResultMutationVariables>;
export const PetMedicationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetMedications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"medications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dosage"}},{"kind":"Field","name":{"kind":"Name","value":"times"}},{"kind":"Field","name":{"kind":"Name","value":"everyDays"}},{"kind":"Field","name":{"kind":"Name","value":"startOn"}},{"kind":"Field","name":{"kind":"Name","value":"endOn"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}}]}}]} as unknown as DocumentNode<PetMedicationsQuery, PetMedicationsQueryVariables>;
export const AddPetMedicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPetMedication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPetMedicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPetMedication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationAddPetMedicationSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AddPetMedicationMutation, AddPetMedicationMutationVariables>;
export const UpdatePetMedicationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePetMedication"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePetMedicationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePetMedication"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationUpdatePetMedicationSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"dosage"}},{"kind":"Field","name":{"kind":"Name","value":"times"}},{"kind":"Field","name":{"kind":"Name","value":"everyDays"}},{"kind":"Field","name":{"kind":"Name","value":"startOn"}},{"kind":"Field","name":{"kind":"Name","value":"endOn"}},{"kind":"Field","name":{"kind":"Name","value":"note"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePetMedicationMutation, UpdatePetMedicationMutationVariables>;
export const PetAppointmentsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetAppointments"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"appointments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"clinic"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]}}]} as unknown as DocumentNode<PetAppointmentsQuery, PetAppointmentsQueryVariables>;
export const AddPetAppointmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPetAppointment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPetAppointmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPetAppointment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationAddPetAppointmentSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AddPetAppointmentMutation, AddPetAppointmentMutationVariables>;
export const UpdatePetAppointmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePetAppointment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePetAppointmentInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePetAppointment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationUpdatePetAppointmentSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"scheduledAt"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"clinic"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePetAppointmentMutation, UpdatePetAppointmentMutationVariables>;
export const SetPetAppointmentStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetPetAppointmentStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SetPetAppointmentStatusInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setPetAppointmentStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationSetPetAppointmentStatusSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<SetPetAppointmentStatusMutation, SetPetAppointmentStatusMutationVariables>;
export const PetListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"species"}},{"kind":"Field","name":{"kind":"Name","value":"speciesOther"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"latestWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<PetListQuery, PetListQueryVariables>;
export const PetProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"species"}},{"kind":"Field","name":{"kind":"Name","value":"speciesOther"}},{"kind":"Field","name":{"kind":"Name","value":"breed"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"latestWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}}]} as unknown as DocumentNode<PetProfileQuery, PetProfileQueryVariables>;
export const PetTimelineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PetTimeline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timeline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"occurredOn"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PetTimelineQuery, PetTimelineQueryVariables>;
export const CreatePetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationCreatePetSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<CreatePetMutation, CreatePetMutationVariables>;
export const UpdatePetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdatePet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdatePetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updatePet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationUpdatePetSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"species"}},{"kind":"Field","name":{"kind":"Name","value":"speciesOther"}},{"kind":"Field","name":{"kind":"Name","value":"breed"}},{"kind":"Field","name":{"kind":"Name","value":"sex"}},{"kind":"Field","name":{"kind":"Name","value":"birthDate"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"photoUrl"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<UpdatePetMutation, UpdatePetMutationVariables>;
export const ArchivePetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ArchivePet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ArchivePetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"archivePet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<ArchivePetMutation, ArchivePetMutationVariables>;
export const LogPetWeightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LogPetWeight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LogPetWeightInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logPetWeight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MutationLogPetWeightSuccess"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"latestWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousWeight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"weightGrams"}},{"kind":"Field","name":{"kind":"Name","value":"measuredOn"}}]}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<LogPetWeightMutation, LogPetWeightMutationVariables>;
export const AddPetNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPetNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddPetNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPetNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ValidationError"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Error"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]} as unknown as DocumentNode<AddPetNoteMutation, AddPetNoteMutationVariables>;