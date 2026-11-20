import { z } from 'zod';

/** Filtros opcionales de `GET /api/products`. */
export const listProductsQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  // Solo dígitos: rechaza '', negativos y decimales (z.coerce convertiría '' en 0).
  maxPriceCents: z
    .string()
    .regex(/^\d+$/, 'Debe ser un número entero de céntimos')
    .transform(Number)
    .optional(),
});

export type ProductFilters = z.output<typeof listProductsQuerySchema>;
