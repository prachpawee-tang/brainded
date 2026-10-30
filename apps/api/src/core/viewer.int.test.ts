import { describe, expect, it } from 'vitest'
import { createTestApp } from '../test/create-test-app'

const VIEWER = `{ viewer { name username email locale theme modules { moduleId enabled } } }`

const UPDATE_PREFERENCES = `
  mutation ($input: UpdatePreferencesInput!) {
    updatePreferences(input: $input) {
      __typename
      ... on MutationUpdatePreferencesSuccess { data { locale theme } }
      ... on Error { code }
    }
  }`

const SET_MODULE_ENABLED = `
  mutation ($input: SetModuleEnabledInput!) {
    setModuleEnabled(input: $input) {
      __typename
      ... on MutationSetModuleEnabledSuccess { data { moduleId enabled } }
      ... on Error { code }
    }
  }`

describe('viewer', () => {
  it('is null when signed out', async () => {
    const { gql } = await createTestApp()
    expect((await gql(VIEWER)).data).toEqual({ viewer: null })
  })

  it('returns the signed-in user with default preferences and modules', async () => {
    const { gql, signUp } = await createTestApp()
    const cookie = await signUp('tnk')
    const { data, errors } = await gql(VIEWER, { cookie })
    expect(errors).toBeUndefined()
    expect(data?.viewer).toEqual({
      name: 'tnk',
      username: 'tnk',
      email: 'tnk@example.com',
      locale: 'TH',
      theme: 'SYSTEM',
      modules: [
        { moduleId: 'pets', enabled: true },
        { moduleId: 'colors', enabled: true },
      ],
    })
  })
})

describe('updatePreferences', () => {
  it('requires sign-in', async () => {
    const { gql } = await createTestApp()
    const { data } = await gql(UPDATE_PREFERENCES, { variables: { input: { locale: 'EN' } } })
    expect(data?.updatePreferences).toEqual({
      __typename: 'UnauthenticatedError',
      code: 'UNAUTHENTICATED',
    })
  })

  it('updates only the provided preferences', async () => {
    const { gql, signUp } = await createTestApp()
    const cookie = await signUp()
    await gql(UPDATE_PREFERENCES, { cookie, variables: { input: { theme: 'DARK' } } })
    const { data } = await gql(UPDATE_PREFERENCES, {
      cookie,
      variables: { input: { locale: 'EN' } },
    })
    expect(data?.updatePreferences).toMatchObject({ data: { locale: 'EN', theme: 'DARK' } })
  })
})

describe('setModuleEnabled', () => {
  it('requires sign-in', async () => {
    const { gql } = await createTestApp()
    const { data } = await gql(SET_MODULE_ENABLED, {
      variables: { input: { moduleId: 'pets', enabled: false } },
    })
    expect(data?.setModuleEnabled).toMatchObject({ code: 'UNAUTHENTICATED' })
  })

  it('disables and re-enables a module for the viewer only', async () => {
    const { gql, signUp } = await createTestApp()
    const alice = await signUp('alice')
    const bob = await signUp('bob')

    const off = await gql(SET_MODULE_ENABLED, {
      cookie: alice,
      variables: { input: { moduleId: 'pets', enabled: false } },
    })
    expect(off.data?.setModuleEnabled).toMatchObject({ data: { moduleId: 'pets', enabled: false } })

    const aliceView = await gql<{ viewer: { modules: unknown[] } }>(VIEWER, { cookie: alice })
    const bobView = await gql<{ viewer: { modules: unknown[] } }>(VIEWER, { cookie: bob })
    expect(aliceView.data?.viewer.modules).toEqual([
      { moduleId: 'pets', enabled: false },
      { moduleId: 'colors', enabled: true },
    ])
    expect(bobView.data?.viewer.modules).toEqual([
      { moduleId: 'pets', enabled: true },
      { moduleId: 'colors', enabled: true },
    ])

    const on = await gql(SET_MODULE_ENABLED, {
      cookie: alice,
      variables: { input: { moduleId: 'pets', enabled: true } },
    })
    expect(on.data?.setModuleEnabled).toMatchObject({ data: { enabled: true } })
  })

  it('rejects unknown modules', async () => {
    const { gql, signUp } = await createTestApp()
    const cookie = await signUp()
    const { data } = await gql(SET_MODULE_ENABLED, {
      cookie,
      variables: { input: { moduleId: 'finance', enabled: true } },
    })
    expect(data?.setModuleEnabled).toEqual({
      __typename: 'NotFoundError',
      code: 'MODULE_NOT_FOUND',
    })
  })
})
