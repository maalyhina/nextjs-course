import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    content: {
      findFirst: jest.fn().mockResolvedValue({
        id: '1',
        title: 'CINEMAX ТЕСТ',
        type: 'MOVIE',
        poster: '/test.jpg',
        year: 2024,
        rating: 8.5,
        description: 'Опис тестового фільму',
        genres: []
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: '2',
          title: 'Популярний фільм',
          type: 'MOVIE',
          poster: '/pop.jpg',
          year: 2023,
          rating: 9.0,
          genres: []
        }
      ]),
    },
  },
}));

describe('Home Page', () => {
  it('відображає головний заголовок та секції контенту', async () => {
    const ResolvedPage = await Home();
    render(ResolvedPage);

    const featuredTitle = await screen.findByText(/CINEMAX ТЕСТ/i);
    expect(featuredTitle).toBeInTheDocument();

    expect(screen.getByText('Популярне')).toBeInTheDocument();
    expect(screen.getByText('Новинки')).toBeInTheDocument();

    const movieCards = screen.getAllByText('Популярний фільм');
    expect(movieCards.length).toBeGreaterThan(0);
    expect(movieCards[0]).toBeInTheDocument();
  });

  it('відображає повідомлення про порожній контент, якщо даних немає', async () => {
    const { prisma } = require('@/lib/prisma');
    
    prisma.content.findFirst.mockResolvedValueOnce(null);
    prisma.content.findMany.mockResolvedValue([]);

    const ResolvedPage = await Home();
    render(ResolvedPage);

    expect(screen.getByText(/Контент ще не додано/i)).toBeInTheDocument();
    expect(screen.getByText(/CINEMAX/)).toBeInTheDocument();
  });
});