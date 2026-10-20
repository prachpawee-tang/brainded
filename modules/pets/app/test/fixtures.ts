import type { PetProfileQuery, PetTimelineQuery } from '../graphql/generated/graphql'
import {
  PetListQuery,
  PetProfileQuery as PetProfileDoc,
  PetTimelineQuery as PetTimelineDoc,
} from '../graphql/pets'

export const PET_ID = 'UGV0OnBldC0x'

type Profile = NonNullable<PetProfileQuery['pet']>
type TimelineEdge = NonNullable<PetTimelineQuery['pet']>['timeline']['edges'][number]

export const buildProfile = (overrides: Partial<Profile> = {}): Profile => ({
  __typename: 'Pet',
  id: PET_ID,
  name: 'Mango',
  species: 'CAT',
  speciesOther: null,
  breed: 'Thai',
  sex: 'FEMALE',
  birthDate: '2024-07-20',
  notes: 'Allergic to chicken',
  photoUrl: null,
  latestWeight: { __typename: 'PetWeight', id: 'w2', weightGrams: 4350, measuredOn: '2026-10-01' },
  previousWeight: {
    __typename: 'PetWeight',
    id: 'w1',
    weightGrams: 4200,
    measuredOn: '2026-09-01',
  },
  ...overrides,
})

export const profileMock = (pet: Profile | null = buildProfile()) => ({
  request: { query: PetProfileDoc, variables: { id: PET_ID } },
  result: { data: { pet } },
})

export const timelineEdge = (id: string, node: Partial<TimelineEdge['node']>): TimelineEdge => ({
  __typename: 'PetTimelineConnectionEdge',
  cursor: `c-${id}`,
  node: {
    __typename: 'PetTimelineEvent',
    id,
    kind: 'NOTE_GENERAL',
    occurredOn: '2026-10-01',
    body: null,
    weightGrams: null,
    ...node,
  },
})

export const timelineMock = (
  edges: TimelineEdge[],
  { after, hasNextPage = false }: { after?: string; hasNextPage?: boolean } = {},
) => ({
  request: { query: PetTimelineDoc, variables: after ? { id: PET_ID, after } : { id: PET_ID } },
  result: {
    data: {
      pet: {
        __typename: 'Pet',
        id: PET_ID,
        timeline: {
          __typename: 'PetTimelineConnection',
          edges,
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage,
            endCursor: edges.at(-1)?.cursor ?? null,
          },
        },
      },
    },
  },
})

export const listMock = (
  pets: {
    id: string
    name: string
    species: 'DOG' | 'CAT' | 'OTHER'
    birthDate?: string | null
    weightGrams?: number
  }[],
) => ({
  request: { query: PetListQuery },
  result: {
    data: {
      pets: {
        __typename: 'QueryPetsConnection',
        edges: pets.map((pet) => ({
          __typename: 'QueryPetsConnectionEdge',
          node: {
            __typename: 'Pet',
            id: pet.id,
            name: pet.name,
            species: pet.species,
            speciesOther: null,
            birthDate: pet.birthDate ?? null,
            photoUrl: null,
            latestWeight: pet.weightGrams
              ? {
                  __typename: 'PetWeight',
                  id: `w-${pet.id}`,
                  weightGrams: pet.weightGrams,
                  measuredOn: '2026-10-01',
                }
              : null,
          },
        })),
      },
    },
  },
})
