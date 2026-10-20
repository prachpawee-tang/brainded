import { describe, expect, it } from 'vitest'
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  requireViewer,
  UnauthenticatedError,
  ValidationError,
} from './errors'

describe('AppError family', () => {
  it.each([
    [new NotFoundError(), 'NOT_FOUND', 'NotFoundError'],
    [new NotFoundError('PET_NOT_FOUND'), 'PET_NOT_FOUND', 'NotFoundError'],
    [new ForbiddenError(), 'FORBIDDEN', 'ForbiddenError'],
    [new ForbiddenError('NOT_YOUR_PET'), 'NOT_YOUR_PET', 'ForbiddenError'],
    [new ValidationError([]), 'VALIDATION_FAILED', 'ValidationError'],
    [new UnauthenticatedError(), 'UNAUTHENTICATED', 'UnauthenticatedError'],
  ])('%s has code %s and name %s', (error, code, name) => {
    expect(error).toBeInstanceOf(AppError)
    expect(error.code).toBe(code)
    expect(error.name).toBe(name)
  })

  it('keeps the original cause for logging', () => {
    const cause = new Error('db down')
    expect(new AppError('INTERNAL', { cause }).cause).toBe(cause)
  })
})

describe('requireViewer', () => {
  it('returns the viewer when signed in', () => {
    expect(requireViewer({ viewer: { id: 'u1' } })).toEqual({ id: 'u1' })
  })

  it('throws UnauthenticatedError when signed out', () => {
    expect(() => requireViewer({ viewer: null })).toThrow(UnauthenticatedError)
  })
})
