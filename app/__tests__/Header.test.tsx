import { render, screen } from '@testing-library/react'
import Header from '../../components/Header'
import { SessionProvider } from 'next-auth/react'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
}))

describe('Header', () => {
  it('renders navigation', () => {
    render(
      <SessionProvider session={null}>
        <Header />
      </SessionProvider>
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})