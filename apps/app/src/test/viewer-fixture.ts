import { ViewerQuery } from '@/features/viewer/graphql/viewer'
import type { ViewerQuery as ViewerQueryResult } from '@/graphql/generated/graphql'

type Viewer = NonNullable<ViewerQueryResult['viewer']>

export const buildViewer = (overrides: Partial<Viewer> = {}): Viewer => ({
  __typename: 'Viewer',
  id: 'u1',
  name: 'Tnk',
  username: 'tnk',
  email: 'tnk@example.com',
  locale: 'EN',
  theme: 'SYSTEM',
  modules: [{ __typename: 'UserModule', moduleId: 'pets', enabled: true }],
  ...overrides,
})

export const viewerMock = (viewer: Viewer = buildViewer()) => ({
  request: { query: ViewerQuery },
  result: { data: { viewer } },
})
