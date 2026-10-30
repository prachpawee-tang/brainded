import { useMutation, useQuery } from '@apollo/client/react'
import type { FavoriteKind } from '../../shared/validation'
import { ColorFavoritesQuery, SetColorFavoriteMutation } from '../graphql/favorites'

/** Server-backed favorites; the mutation returns the whole list, which replaces the cached one. */
export const useFavorites = () => {
  const { data, loading } = useQuery(ColorFavoritesQuery)
  const [setFavorite] = useMutation(SetColorFavoriteMutation, {
    update: (cache, { data: result }) => {
      const payload = result?.setColorFavorite
      if (payload?.__typename !== 'MutationSetColorFavoriteSuccess') return
      cache.writeQuery({
        query: ColorFavoritesQuery,
        data: { __typename: 'Query', colorFavorites: payload.data },
      })
    },
  })
  const favorites = data?.colorFavorites ?? []
  const isFavorite = (kind: FavoriteKind, ref: string) =>
    favorites.some((f) => f.kind === kind && f.ref === ref)
  const toggle = (kind: FavoriteKind, ref: string) =>
    setFavorite({ variables: { input: { kind, ref, isFavorite: !isFavorite(kind, ref) } } })
  return { favorites, isLoading: loading && !data, isFavorite, toggle }
}
