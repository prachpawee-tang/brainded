import { graphql } from './generated'

export const PetTasksQuery = graphql(`
  query PetTasks($id: ID!, $includeDone: Boolean) {
    pet(id: $id) {
      id
      tasks(includeDone: $includeDone) {
        id
        title
        note
        dueOn
        completedAt
      }
    }
  }
`)

export const AddPetTaskMutation = graphql(`
  mutation AddPetTask($input: AddPetTaskInput!) {
    addPetTask(input: $input) {
      __typename
      ... on MutationAddPetTaskSuccess {
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

export const UpdatePetTaskMutation = graphql(`
  mutation UpdatePetTask($input: UpdatePetTaskInput!) {
    updatePetTask(input: $input) {
      __typename
      ... on MutationUpdatePetTaskSuccess {
        data {
          id
          title
          note
          dueOn
          completedAt
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

export const SetPetTaskDoneMutation = graphql(`
  mutation SetPetTaskDone($input: SetPetTaskDoneInput!) {
    setPetTaskDone(input: $input) {
      __typename
      ... on MutationSetPetTaskDoneSuccess {
        data {
          id
          completedAt
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const DeletePetTaskMutation = graphql(`
  mutation DeletePetTask($input: DeletePetTaskInput!) {
    deletePetTask(input: $input) {
      __typename
      ... on Error {
        code
      }
    }
  }
`)

/** Everything the device needs to plan local notifications, for all pets at once. */
export const PetsReminderSourcesQuery = graphql(`
  query PetsReminderSources {
    pets(first: 50) {
      edges {
        node {
          id
          name
          medications {
            id
            name
            dosage
            times
            everyDays
            startOn
            endOn
          }
          appointments {
            id
            reason
            clinic
            scheduledAt
            status
          }
          tasks {
            id
            title
            dueOn
            completedAt
          }
        }
      }
    }
  }
`)
