import { renderHook } from '@testing-library/react-native'
import { usePetsServices } from './pets-services'

describe('usePetsServices', () => {
  it('fails loudly outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    await expect(renderHook(() => usePetsServices())).rejects.toThrow('PetsServicesProvider')
  })
})
