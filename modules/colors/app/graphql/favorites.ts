import { graphql } from './generated'

export const ColorFavoritesQuery = graphql(`
  query ColorFavorites {
    colorFavorites {
      id
      kind
      ref
    }
  }
`)

export const SetColorFavoriteMutation = graphql(`
  mutation SetColorFavorite($input: SetColorFavoriteInput!) {
    setColorFavorite(input: $input) {
      __typename
      ... on MutationSetColorFavoriteSuccess {
        data {
          id
          kind
          ref
        }
      }
      ... on Error {
        code
      }
    }
  }
`)
