import { graphql } from './generated'

export const PetWeightsQuery = graphql(`
  query PetWeights($id: ID!, $since: LocalDate) {
    pet(id: $id) {
      id
      weights(since: $since) {
        id
        weightGrams
        measuredOn
      }
    }
  }
`)

export const PetTodayQuery = graphql(`
  query PetToday($id: ID!, $date: LocalDate!) {
    pet(id: $id) {
      id
      dosesOn(date: $date) {
        id
        time
        takenAt
        medication {
          id
          name
          dosage
        }
      }
      nextAppointment {
        id
        scheduledAt
        reason
        clinic
      }
    }
  }
`)

export const SetDoseTakenMutation = graphql(`
  mutation SetDoseTaken($input: SetDoseTakenInput!) {
    setDoseTaken(input: $input) {
      __typename
      ... on MutationSetDoseTakenSuccess {
        data {
          id
          takenAt
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const PetLabResultsQuery = graphql(`
  query PetLabResults($id: ID!, $first: Int) {
    pet(id: $id) {
      id
      labResults(first: $first) {
        id
        takenOn
        title
        clinic
        abnormalCount
      }
    }
  }
`)

export const PetLabResultQuery = graphql(`
  query PetLabResult($id: ID!, $labId: ID!) {
    pet(id: $id) {
      id
      name
      labResult(id: $labId) {
        id
        takenOn
        title
        clinic
        note
        abnormalCount
        values {
          id
          name
          value
          unit
          refLow
          refHigh
          flag
        }
        photos {
          id
          url
        }
      }
    }
  }
`)

export const AddPetLabResultMutation = graphql(`
  mutation AddPetLabResult($input: AddPetLabResultInput!) {
    addPetLabResult(input: $input) {
      __typename
      ... on MutationAddPetLabResultSuccess {
        data {
          id
        }
      }
      ... on ValidationError {
        issues {
          path
          code
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const DeletePetLabResultMutation = graphql(`
  mutation DeletePetLabResult($input: DeletePetLabResultInput!) {
    deletePetLabResult(input: $input) {
      __typename
      ... on Error {
        code
      }
    }
  }
`)

export const PetMedicationsQuery = graphql(`
  query PetMedications($id: ID!) {
    pet(id: $id) {
      id
      medications {
        id
        name
        dosage
        times
        everyDays
        startOn
        endOn
        note
      }
    }
  }
`)

export const AddPetMedicationMutation = graphql(`
  mutation AddPetMedication($input: AddPetMedicationInput!) {
    addPetMedication(input: $input) {
      __typename
      ... on MutationAddPetMedicationSuccess {
        data {
          id
        }
      }
      ... on ValidationError {
        issues {
          path
          code
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const UpdatePetMedicationMutation = graphql(`
  mutation UpdatePetMedication($input: UpdatePetMedicationInput!) {
    updatePetMedication(input: $input) {
      __typename
      ... on MutationUpdatePetMedicationSuccess {
        data {
          id
          name
          dosage
          times
          everyDays
          startOn
          endOn
          note
        }
      }
      ... on ValidationError {
        issues {
          path
          code
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const PetAppointmentsQuery = graphql(`
  query PetAppointments($id: ID!) {
    pet(id: $id) {
      id
      appointments {
        id
        scheduledAt
        reason
        clinic
        note
        status
      }
    }
  }
`)

export const AddPetAppointmentMutation = graphql(`
  mutation AddPetAppointment($input: AddPetAppointmentInput!) {
    addPetAppointment(input: $input) {
      __typename
      ... on MutationAddPetAppointmentSuccess {
        data {
          id
        }
      }
      ... on ValidationError {
        issues {
          path
          code
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const UpdatePetAppointmentMutation = graphql(`
  mutation UpdatePetAppointment($input: UpdatePetAppointmentInput!) {
    updatePetAppointment(input: $input) {
      __typename
      ... on MutationUpdatePetAppointmentSuccess {
        data {
          id
          scheduledAt
          reason
          clinic
          note
          status
        }
      }
      ... on ValidationError {
        issues {
          path
          code
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const SetPetAppointmentStatusMutation = graphql(`
  mutation SetPetAppointmentStatus($input: SetPetAppointmentStatusInput!) {
    setPetAppointmentStatus(input: $input) {
      __typename
      ... on MutationSetPetAppointmentStatusSuccess {
        data {
          id
          status
        }
      }
      ... on Error {
        code
      }
    }
  }
`)
