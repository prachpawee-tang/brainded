import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { createI18n } from '@brain/i18n'
import { renderHook, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { petsLocales } from '../../../../src/locales'
import { PetsReminderSourcesQuery } from '../../../graphql/tasks'
import { usePetsReminderItems } from '../use-pets-reminder-items'

const inHours = (h: number) => new Date(Date.now() + h * 3_600_000)

const sourcesMock = {
  request: { query: PetsReminderSourcesQuery },
  result: {
    data: {
      pets: {
        __typename: 'QueryPetsConnection',
        edges: [
          {
            __typename: 'QueryPetsConnectionEdge',
            node: {
              __typename: 'Pet',
              id: 'p1',
              name: 'Mango',
              medications: [],
              tasks: [],
              appointments: [
                {
                  __typename: 'PetAppointment',
                  id: 'a1',
                  reason: 'Vaccines',
                  clinic: null,
                  scheduledAt: inHours(5).toISOString(),
                  status: 'SCHEDULED',
                },
              ],
            },
          },
        ],
      },
    },
  },
}

const wrapperFor = async (mocks: unknown[]) => {
  const i18n = await createI18n({
    lng: 'en',
    namespaces: { pets: petsLocales },
    plugins: [initReactI18next],
  })
  return ({ children }: { children: ReactNode }) => (
    <I18nextProvider i18n={i18n}>
      <MockedProvider mocks={mocks as never[]} cache={new InMemoryCache()}>
        {children}
      </MockedProvider>
    </I18nextProvider>
  )
}

const ON = { isEnabled: true, doses: true, appointments: true, tasks: true }

describe('usePetsReminderItems', () => {
  it('turns pet data into translated reminder items that open the pet', async () => {
    const { result } = await renderHook(() => usePetsReminderItems(ON), {
      wrapper: await wrapperFor([sourcesMock]),
    })
    expect(result.current).toBeNull()
    await waitFor(() => expect(result.current).toHaveLength(1))
    expect(result.current?.[0]).toMatchObject({
      id: 'pets.appointment:a1:2h',
      title: '🩺 Mango · Vaccines',
      body: 'Vet visit in 2 hours',
      route: '/pets/p1',
    })
  })

  it('returns nothing (and does not query) when reminders are off', async () => {
    const { result } = await renderHook(() => usePetsReminderItems({ ...ON, isEnabled: false }), {
      wrapper: await wrapperFor([]),
    })
    expect(result.current).toEqual([])
  })
})
