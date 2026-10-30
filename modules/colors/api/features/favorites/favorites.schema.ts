import { type Builder, UnauthenticatedError, ValidationError } from '@brain/graphql'
import { FAVORITE_KINDS, type FavoriteKind } from '../../../shared/validation'
import { toServiceContext } from '../../lib/context'
import { type ColorFavoriteRow, listFavorites, setFavorite } from './favorites.service'

export const registerFavorites = (builder: Builder) => {
  const Kind = builder.enumType('ColorFavoriteKind', { values: FAVORITE_KINDS })

  const ColorFavorite = builder.objectRef<ColorFavoriteRow>('ColorFavorite').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      kind: t.field({ type: Kind, resolve: (f) => f.kind as FavoriteKind }),
      ref: t.exposeString('ref'),
      createdAt: t.field({ type: 'DateTime', resolve: (f) => f.createdAt }),
    }),
  })

  builder.queryField('colorFavorites', (t) =>
    t.field({
      type: [ColorFavorite],
      resolve: (_root, _args, context) => listFavorites(toServiceContext(context)),
    }),
  )

  const SetColorFavoriteInput = builder.inputType('SetColorFavoriteInput', {
    fields: (t) => ({
      kind: t.field({ type: Kind, required: true }),
      ref: t.string({ required: true }),
      isFavorite: t.boolean({ required: true }),
    }),
  })

  builder.mutationField('setColorFavorite', (t) =>
    t.field({
      type: [ColorFavorite],
      errors: { types: [UnauthenticatedError, ValidationError] },
      args: { input: t.arg({ type: SetColorFavoriteInput, required: true }) },
      resolve: (_root, { input }, context) => setFavorite(toServiceContext(context), input),
    }),
  )
}
