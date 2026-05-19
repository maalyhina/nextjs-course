import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from '@/components/Header';
import { SessionProvider } from 'next-auth/react';
import { useSession, signOut } from 'next-auth/react';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockedUseSession = useSession as jest.Mock;

describe('Header', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Базове ──────────────────────────────────────────────────

  it('відображає nav елемент', () => {
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('відображає логотип CINEMAX', () => {
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getByText('CINEMAX')).toBeInTheDocument();
  });

  // ─── Незалогінений ───────────────────────────────────────────

  it('показує кнопку "Увійти" якщо не залогінений', () => {
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getByText('Увійти')).toBeInTheDocument();
  });

  it('показує посилання на фільми для незалогіненого', () => {
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getByText('Фільми')).toBeInTheDocument();
    expect(screen.getByText('Серіали')).toBeInTheDocument();
    expect(screen.getByText('Аніме')).toBeInTheDocument();
    expect(screen.getByText('Мультики')).toBeInTheDocument();
    expect(screen.getByText('Обране')).toBeInTheDocument();
  });

  // ─── Залогінений юзер ────────────────────────────────────────

  it('показує ім\'я залогіненого юзера', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Ангеліна', email: 'anya@test.com', role: 'USER' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getByText('Ангеліна')).toBeInTheDocument();
  });

  it('відкриває dropdown меню після кліку на ім\'я', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Ангеліна', email: 'anya@test.com', role: 'USER' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    fireEvent.click(screen.getByText('Ангеліна'));

    await waitFor(() => {
      expect(screen.getByText('Профіль')).toBeInTheDocument();
      expect(screen.getByText('Історія')).toBeInTheDocument();
      expect(screen.getByText('Підписка')).toBeInTheDocument();
      expect(screen.getByText('Вийти')).toBeInTheDocument();
    });
  });

  it('викликає signOut після кліку "Вийти"', async () => {
    (signOut as jest.Mock).mockResolvedValue({});
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Ангеліна', email: 'anya@test.com', role: 'USER' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    fireEvent.click(screen.getByText('Ангеліна'));
    await waitFor(() => screen.getByText('Вийти'));
    fireEvent.click(screen.getByText('Вийти'));

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ redirect: false });
    });
  });

  // ─── Адмін ───────────────────────────────────────────────────

  it('показує адмін навігацію для адміністратора', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Адмін', email: 'admin@test.com', role: 'ADMIN' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getByText('Панель')).toBeInTheDocument();
    expect(screen.getByText('Користувачі')).toBeInTheDocument();
  });

  it('відкриває адмін dropdown з посиланням на адмін панель', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Адмін', email: 'admin@test.com', role: 'ADMIN' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    fireEvent.click(screen.getByText(/⚙ Адмін/));

    await waitFor(() => {
      expect(screen.getByText('Адміністратор')).toBeInTheDocument();
      expect(screen.getByText('Керування фільмами')).toBeInTheDocument();
    });
  });

  // ─── Пошук ───────────────────────────────────────────────────

  it('відображає поле пошуку для звичайного юзера', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Ангеліна', email: 'anya@test.com', role: 'USER' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.getAllByPlaceholderText('Пошук...')[0]).toBeInTheDocument();
  });

  it('не відображає пошук для адміна', () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Адмін', email: 'admin@test.com', role: 'ADMIN' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(screen.queryByPlaceholderText('Пошук...')).not.toBeInTheDocument();
  });

  it('виконує пошук при сабміті форми', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Ангеліна', email: 'anya@test.com', role: 'USER' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    const input = screen.getAllByPlaceholderText('Пошук...')[0];
    fireEvent.change(input, { target: { value: 'Дюна' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/search?q=%D0%94%D1%8E%D0%BD%D0%B0');
    });
  });

  // ─── Scroll ──────────────────────────────────────────────────

  it('додає scroll listener при монтуванні', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    addSpy.mockRestore();
  });

  it('видаляє scroll listener при анмонтуванні', () => {
    const removeSpy = jest.spyOn(window, 'removeEventListener');
    mockedUseSession.mockReturnValue({ data: null });
    const { unmount } = render(<SessionProvider session={null}><Header /></SessionProvider>);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeSpy.mockRestore();
  });

  // ─── Мобільне меню ───────────────────────────────────────────

  it('відкриває мобільне меню після кліку на бургер', async () => {
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    fireEvent.click(screen.getByText('☰'));

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  it('показує кнопку "Увійти" в мобільному меню для незалогіненого', async () => {
    mockedUseSession.mockReturnValue({ data: null });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    fireEvent.click(screen.getByText('☰'));

    await waitFor(() => {
      expect(screen.getAllByText('Увійти').length).toBeGreaterThan(0);
    });
  });

  it('показує профіль та вийти в мобільному меню для юзера', async () => {
    mockedUseSession.mockReturnValue({
      data: { user: { name: 'Ангеліна', email: 'anya@test.com', role: 'USER' } },
    });
    render(<SessionProvider session={null}><Header /></SessionProvider>);

    fireEvent.click(screen.getByText('☰'));

    await waitFor(() => {
      expect(screen.getByText('Профіль')).toBeInTheDocument();
      expect(screen.getByText('Історія')).toBeInTheDocument();
      expect(screen.getAllByText('Вийти').length).toBeGreaterThan(0);
    });
  });

  it('закриває мобільне меню після кліку на бургер повторно', async () => {
  mockedUseSession.mockReturnValue({ data: null });
  render(<SessionProvider session={null}><Header /></SessionProvider>);

  fireEvent.click(screen.getByText('☰'));
  await waitFor(() => expect(screen.getByText('✕')).toBeInTheDocument());

  fireEvent.click(screen.getByText('✕'));

  await waitFor(() => {
    expect(screen.queryByText('✕')).not.toBeInTheDocument();
  });
});
});