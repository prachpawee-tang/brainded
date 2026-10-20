import { graphql } from './generated'

export const PetListQuery = graphql(`
  query PetList {
    pets(first: 50) {
      edges {
        node {
          id
          name
          species
          speciesOther
          birthDate
          photoUrl
          latestWeight {
            id
            weightGrams
            measuredOn
          }
        }
      }
    }
  }
`)

export const PetProfileQuery = graphql(`
  query PetProfile($id: ID!) {
    pet(id: $id) {
      id
      name
      species
      speciesOther
      breed
      sex
      birthDate
      notes
      photoUrl
      latestWeight {
        id
        weightGrams
        measuredOn
      }
      previousWeight {
        id
        weightGrams
        measuredOn
      }
    }
  }
`)

export const PetTimelineQuery = graphql(`
  query PetTimeline($id: ID!, $after: String) {
    pet(id: $id) {
      id
      timeline(first: 20, after: $after) {
        edges {
          cursor
          node {
            id
            kind
            occurredOn
            body
            weightGrams
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`)

export const CreatePetMutation = graphql(`
  mutation CreatePet($input: CreatePetInput!) {
    createPet(input: $input) {
      __typename
      ... on MutationCreatePetSuccess {
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

export const UpdatePetMutation = graphql(`
  mutation UpdatePet($input: UpdatePetInput!) {
    updatePet(input: $input) {
      __typename
      ... on MutationUpdatePetSuccess {
        data {
          id
          name
          species
          speciesOther
          breed
          sex
          birthDate
          notes
          photoUrl
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

export const ArchivePetMutation = graphql(`
  mutation ArchivePet($input: ArchivePetInput!) {
    archivePet(input: $input) {
      __typename
      ... on Error {
        code
      }
    }
  }
`)

export const LogPetWeightMutation = graphql(`
  mutation LogPetWeight($input: LogPetWeightInput!) {
    logPetWeight(input: $input) {
      __typename
      ... on MutationLogPetWeightSuccess {
        data {
          id
          latestWeight {
            id
            weightGrams
            measuredOn
          }
          previousWeight {
            id
            weightGrams
            measuredOn
          }
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

export const AddPetNoteMutation = graphql(`
  mutation AddPetNote($input: AddPetNoteInput!) {
    addPetNote(input: $input) {
      __typename
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
