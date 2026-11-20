import { describe, expect, it } from 'vitest';
import { api, createProduct } from './helpers.ts';

const ids = (body: { id: number }[]) => body.map((product) => product.id);

describe('GET /api/products con filtros', () => {
  it('filtra por categoría', async () => {
    const res = await api().get('/api/products?category=hogar');

    expect(res.status).toBe(200);
    expect(ids(res.body)).toEqual([6, 7]);
  });

  it('devuelve una lista vacía si la categoría no tiene productos', async () => {
    const res = await api().get('/api/products?category=jardin');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('filtra por precio máximo, incluido el propio límite', async () => {
    const limite = createProduct({ priceCents: 3000 });
    createProduct({ priceCents: 3001 });

    const res = await api().get('/api/products?maxPriceCents=3000');

    expect(res.status).toBe(200);
    expect(ids(res.body)).toEqual([2, 4, 5, 6, limite.id]);
  });

  it('combina categoría y precio máximo', async () => {
    const res = await api().get('/api/products?category=electronica&maxPriceCents=10000');

    expect(res.status).toBe(200);
    expect(ids(res.body)).toEqual([1, 2]);
  });

  it.each([
    ['maxPriceCents no numérico', 'maxPriceCents=barato'],
    ['maxPriceCents negativo', 'maxPriceCents=-1'],
    ['maxPriceCents con decimales', 'maxPriceCents=29.99'],
    ['maxPriceCents vacío', 'maxPriceCents='],
    ['category vacía', 'category='],
    ['category repetida', 'category=hogar&category=libros'],
  ])('responde 400 si %s', async (_caso, query) => {
    const res = await api().get(`/api/products?${query}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /api/products', () => {
  it('devuelve el catálogo completo', async () => {
    const res = await api().get('/api/products');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    expect(res.body[0]).toEqual({
      id: 1,
      name: 'Teclado mecánico',
      category: 'electronica',
      priceCents: 8990,
      stock: 12,
    });
  });
});

describe('GET /api/products/:id', () => {
  it('devuelve el producto', async () => {
    const res = await api().get('/api/products/4');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Cuaderno A5 de tapa dura');
  });

  it('responde 404 si no existe', async () => {
    const res = await api().get('/api/products/999');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('responde 400 si el id no es un número', async () => {
    const res = await api().get('/api/products/abc');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
