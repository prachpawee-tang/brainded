import { graphql } from '@/graphql/generated'

/** The one query for "who am I + my preferences + my modules". Shared via the Apollo cache. */
export const ViewerQuery = graphql(`
  query Viewer {
    viewer {
      id
      name
      username
      email
      locale
      theme
      modules {
        moduleId
        enabled
      }
    }
  }
`)

export const UpdatePreferencesMutation = graphql(`
  mutation UpdatePreferences($input: UpdatePreferencesInput!) {
    updatePreferences(input: $input) {
      __typename
      ... on MutationUpdatePreferencesSuccess {
        data {
          id
          locale
          theme
        }
      }
      ... on Error {
        code
      }
    }
  }
`)

export const SetModuleEnabledMutation = graphql(`
  mutation SetModuleEnabled($input: SetModuleEnabledInput!) {
    setModuleEnabled(input: $input) {
      __typename
      ... on MutationSetModuleEnabledSuccess {
        data {
          moduleId
          enabled
        }
      }
      ... on Error {
        code
      }
    }
  }
`)
