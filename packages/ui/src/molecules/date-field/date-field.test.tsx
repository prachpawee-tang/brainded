import { fireEvent, render, screen, userEvent } from '@testing-library/react-native'
import { DateField } from './date-field'

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual('react-native')
  return {
    __esModule: true,
    default: (props: object) => <View testID="native-picker" {...props} />,
  }
})

const format = (iso: string) => `formatted:${iso}`

describe('DateField (native)', () => {
  it('shows the formatted value and opens the picker', async () => {
    const user = userEvent.setup()
    await render(
      <DateField
        label="Birthday"
        value="2022-05-01"
        onChange={jest.fn()}
        formatValue={format}
        placeholder="Pick"
      />,
    )
    expect(screen.getByText('formatted:2022-05-01')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Birthday' }))
    expect(screen.getByTestId('native-picker')).toBeOnTheScreen()
  })

  it('reports the picked date as YYYY-MM-DD', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    await render(
      <DateField
        label="Birthday"
        value={null}
        onChange={onChange}
        formatValue={format}
        placeholder="Pick"
      />,
    )
    expect(screen.getByText('Pick')).toBeOnTheScreen()
    await user.press(screen.getByRole('button', { name: 'Birthday' }))
    fireEvent(screen.getByTestId('native-picker'), 'change', { type: 'set' }, new Date(2024, 1, 29))
    expect(onChange).toHaveBeenCalledWith('2024-02-29')
  })

  it('does not change on dismiss and can be cleared', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    await render(
      <DateField
        label="Birthday"
        value="2022-05-01"
        onChange={onChange}
        formatValue={format}
        placeholder="Pick"
        clearLabel="Clear"
      />,
    )
    await user.press(screen.getByRole('button', { name: 'Birthday' }))
    fireEvent(screen.getByTestId('native-picker'), 'change', { type: 'dismissed' }, undefined)
    expect(onChange).not.toHaveBeenCalled()
    await user.press(screen.getByRole('button', { name: 'Clear' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('shows an error', async () => {
    await render(
      <DateField
        label="Birthday"
        value={null}
        onChange={jest.fn()}
        formatValue={format}
        placeholder="Pick"
        error="Bad"
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Bad')
  })
})
