import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddToFavorites from '@/components/content/AddToFavorites'; 
import { useSession } from 'next-auth/react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-auth/react');

describe('AddToFavorites Component', () => {
  const contentId = 'test-123';
  const mockedUseSession = useSession as jest.Mock; 

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('відображає кнопку додавання, якщо контент не в обраному', async () => {
    mockedUseSession.mockReturnValue({ data: { user: { id: '1' } } });
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ isFavorite: false }),
    });

    render(<AddToFavorites contentId={contentId} />);

    const button = await screen.findByRole('button');
    expect(button).toHaveTextContent('+ Обране');
  });

  it('змінює текст на "В обраному" після кліку', async () => {
    mockedUseSession.mockReturnValue({ data: { user: { id: '1' } } });
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({ isFavorite: false }),
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(<AddToFavorites contentId={contentId} />);

    const button = await screen.findByText('+ Обране');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/В обраному/i)).toBeInTheDocument();
    });
  });
});