import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Input label="Email Address" />)
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styles when error is present', () => {
    render(<Input error="Error message" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-300')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)

    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })

    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test value')
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" />)
    expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password')
  })
})