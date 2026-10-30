import { describe, expect, it } from 'vitest'
import { planPetReminders } from './reminders'

// Wed 2026-11-04 10:00 local
const NOW = new Date(2026, 10, 4, 10, 0)
const at = (y: number, m: number, d: number, h: number, min = 0) =>
  new Date(y, m - 1, d, h, min).getTime()

const ALL = { doses: true, appointments: true, tasks: true }

const pet = (overrides = {}) => ({
  id: 'p1',
  name: 'Mango',
  medications: [],
  appointments: [],
  tasks: [],
  ...overrides,
})

describe('planPetReminders', () => {
  it('plans future doses for the next 7 days on dosing days only', () => {
    const items = planPetReminders({
      pets: [
        pet({
          medications: [
            {
              id: 'm1',
              name: 'Apoquel',
              dosage: '½',
              times: ['08:00', '20:00'],
              everyDays: 2,
              startOn: '2026-11-04',
              endOn: null,
            },
          ],
        }),
      ],
      now: NOW,
      kinds: ALL,
    })
    expect(items.map((i) => i.at.getTime())).toEqual([
      at(2026, 11, 4, 20),
      at(2026, 11, 6, 8),
      at(2026, 11, 6, 20),
      at(2026, 11, 8, 8),
      at(2026, 11, 8, 20),
      at(2026, 11, 10, 8),
      at(2026, 11, 10, 20),
    ])
    expect(items[0]).toMatchObject({
      kind: 'DOSE',
      id: 'pets.dose:m1:2026-11-04:20:00',
      petId: 'p1',
      petName: 'Mango',
      subject: 'Apoquel',
      detail: '½',
    })
  })

  it('respects medication end dates', () => {
    const items = planPetReminders({
      pets: [
        pet({
          medications: [
            {
              id: 'm1',
              name: 'A',
              dosage: null,
              times: ['09:00'],
              everyDays: 1,
              startOn: '2026-11-01',
              endOn: '2026-11-05',
            },
          ],
        }),
      ],
      now: NOW,
      kinds: ALL,
    })
    expect(items.map((i) => i.at.getTime())).toEqual([at(2026, 11, 5, 9)])
  })

  it('reminds 1 day and 2 hours before scheduled appointments, skipping past and cancelled ones', () => {
    const items = planPetReminders({
      pets: [
        pet({
          appointments: [
            {
              id: 'a1',
              reason: 'Vaccines',
              scheduledAt: new Date(at(2026, 11, 6, 9, 30)).toISOString(),
              status: 'SCHEDULED',
            },
            {
              id: 'a2',
              reason: 'Soon',
              scheduledAt: new Date(at(2026, 11, 4, 11)).toISOString(),
              status: 'SCHEDULED',
            },
            {
              id: 'a3',
              reason: 'Off',
              scheduledAt: new Date(at(2026, 11, 7, 9)).toISOString(),
              status: 'CANCELLED',
            },
          ],
        }),
      ],
      now: NOW,
      kinds: ALL,
    })
    expect(items.map((i) => [i.id, i.at.getTime()])).toEqual([
      ['pets.appointment:a1:1d', at(2026, 11, 5, 9, 30)],
      ['pets.appointment:a1:2h', at(2026, 11, 6, 7, 30)],
    ])
  })

  it('reminds at 09:00 on the due day of open to-dos', () => {
    const items = planPetReminders({
      pets: [
        pet({
          tasks: [
            { id: 't1', title: 'Buy drops', dueOn: '2026-11-07', completedAt: null },
            { id: 't2', title: 'Today', dueOn: '2026-11-04', completedAt: null },
            { id: 't3', title: 'Done', dueOn: '2026-11-08', completedAt: '2026-11-03T00:00:00Z' },
            { id: 't4', title: 'Undated', dueOn: null, completedAt: null },
          ],
        }),
      ],
      now: NOW,
      kinds: ALL,
    })
    expect(items.map((i) => [i.kind, i.subject, i.at.getTime()])).toEqual([
      ['TASK', 'Buy drops', at(2026, 11, 7, 9)],
    ])
  })

  it('honours the kind switches and caps the total', () => {
    const many = {
      id: 'm1',
      name: 'A',
      dosage: null,
      times: ['01:00', '05:00', '09:00', '13:00', '17:00', '21:00'],
      everyDays: 1,
      startOn: '2026-11-01',
      endOn: null,
    }
    const pets = [
      pet({
        medications: [many],
        tasks: [{ id: 't1', title: 'x', dueOn: '2026-11-05', completedAt: null }],
      }),
    ]
    expect(
      planPetReminders({ pets, now: NOW, kinds: { ...ALL, doses: false } }).map((i) => i.kind),
    ).toEqual(['TASK'])
    expect(planPetReminders({ pets, now: NOW, kinds: ALL, limit: 5 })).toHaveLength(5)
  })
})
