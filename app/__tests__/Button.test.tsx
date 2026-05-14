import { render, screen } from '@testing-library/react'

function Button({ children }: { children: React.ReactNode }) {
  return <button>{children}</button>
}

describe('Button', () => {
  it('renders text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})