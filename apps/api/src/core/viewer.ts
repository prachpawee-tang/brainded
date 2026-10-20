import { findModule } from '@brain/core'
import { and, authUsers, type Database, eq, userModules } from '@brain/db'
import { type Builder, NotFoundError, requireViewer, UnauthenticatedError } from '@brain/graphql'
import { MODULES } from '../modules'

type UserRow = typeof authUsers.$inferSelect
type UserModuleState = { moduleId: string; enabled: boolean }

const LANGUAGES = { TH: 'th', EN: 'en' } as const
const THEMES = { LIGHT: 'light', DARK: 'dark', SYSTEM: 'system' } as const

const toEnumValues = (map: Record<string, string>) =>
  Object.fromEntries(Object.entries(map).map(([name, value]) => [name, { value }]))

const findUser = async (db: Database, id: string) => {
  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, id))
  if (!user) throw new UnauthenticatedError()
  return user
}

/** Registry modules merged with the user's stored state (no row = enabled). */
const loadModules = async (db: Database, ownerId: string): Promise<UserModuleState[]> => {
  const rows = await db.select().from(userModules).where(eq(userModules.ownerId, ownerId))
  return MODULES.map(({ id }) => ({
    moduleId: id,
    enabled: rows.find((row) => row.moduleId === id)?.enabled ?? true,
  }))
}

export const registerViewer = (builder: Builder) => {
  const Language = builder.enumType('Language', { values: toEnumValues(LANGUAGES) })
  const ThemePreference = builder.enumType('ThemePreference', { values: toEnumValues(THEMES) })

  const UserModule = builder.objectRef<UserModuleState>('UserModule').implement({
    fields: (t) => ({
      moduleId: t.exposeString('moduleId'),
      enabled: t.exposeBoolean('enabled'),
    }),
  })

  const Viewer = builder.objectRef<UserRow>('Viewer').implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      name: t.exposeString('name'),
      email: t.exposeString('email'),
      username: t.exposeString('username', { nullable: true }),
      image: t.exposeString('image', { nullable: true }),
      locale: t.field({ type: Language, resolve: (user) => user.locale ?? LANGUAGES.TH }),
      theme: t.field({ type: ThemePreference, resolve: (user) => user.theme ?? THEMES.SYSTEM }),
      modules: t.field({
        type: [UserModule],
        resolve: (user, _args, { db }) => loadModules(db, user.id),
      }),
    }),
  })

  builder.queryField('viewer', (t) =>
    t.field({
      type: Viewer,
      nullable: true,
      resolve: (_root, _args, { db, viewer }) => (viewer ? findUser(db, viewer.id) : null),
    }),
  )

  const UpdatePreferencesInput = builder.inputType('UpdatePreferencesInput', {
    fields: (t) => ({
      locale: t.field({ type: Language, required: false }),
      theme: t.field({ type: ThemePreference, required: false }),
    }),
  })

  builder.mutationField('updatePreferences', (t) =>
    t.field({
      type: Viewer,
      errors: { types: [UnauthenticatedError] },
      args: { input: t.arg({ type: UpdatePreferencesInput, required: true }) },
      resolve: async (_root, { input }, context) => {
        const { id } = requireViewer(context)
        const [user] = await context.db
          .update(authUsers)
          .set({
            ...(input.locale ? { locale: input.locale } : {}),
            ...(input.theme ? { theme: input.theme } : {}),
          })
          .where(eq(authUsers.id, id))
          .returning()
        if (!user) throw new UnauthenticatedError()
        return user
      },
    }),
  )

  const SetModuleEnabledInput = builder.inputType('SetModuleEnabledInput', {
    fields: (t) => ({
      moduleId: t.string({ required: true }),
      enabled: t.boolean({ required: true }),
    }),
  })

  builder.mutationField('setModuleEnabled', (t) =>
    t.field({
      type: UserModule,
      errors: { types: [UnauthenticatedError, NotFoundError] },
      args: { input: t.arg({ type: SetModuleEnabledInput, required: true }) },
      resolve: async (_root, { input }, context) => {
        const { id: ownerId } = requireViewer(context)
        if (!findModule(MODULES, input.moduleId)) throw new NotFoundError('MODULE_NOT_FOUND')
        await context.db
          .insert(userModules)
          .values({ ownerId, moduleId: input.moduleId, enabled: input.enabled })
          .onConflictDoUpdate({
            target: [userModules.ownerId, userModules.moduleId],
            set: { enabled: input.enabled },
          })
        const [row] = await context.db
          .select()
          .from(userModules)
          .where(and(eq(userModules.ownerId, ownerId), eq(userModules.moduleId, input.moduleId)))
        return { moduleId: input.moduleId, enabled: row?.enabled ?? input.enabled }
      },
    }),
  )
}
