const express = require('express');
const router  = express.Router();
const prisma = require('../db/prisma');
const { createValidationError, createBusinessError } = require('../middleware/errorHandler');

const getEmpresaId = (req) => req.user?.empresaId || req.user?.id;

// GET /api/clientes
router.get('/', async (req, res, next) => {
  try {
    const { q, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const empresaId = getEmpresaId(req);

    let where = { empresaId };
    if (q) {
      const terms = q.split(' ').filter(t => t.length > 0);
      where.AND = terms.map(term => ({
        OR: [
          { razonSocial: { contains: term, mode: 'insensitive' } },
          { rifCedula:   { contains: term, mode: 'insensitive' } },
          { correo:      { contains: term, mode: 'insensitive' } },
        ]
      }));
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { razonSocial: 'asc' },
        include: { _count: { select: { facturas: true } } },
      }),
      prisma.cliente.count({ where }),
    ]);

    res.json({ data: clientes, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { next(err); }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const empresaId = getEmpresaId(req);
    const cliente = await prisma.cliente.findFirstOrThrow({
      where: { id: req.params.id, empresaId },
      include: {
        facturas: {
          orderBy: { fechaEmision: 'desc' },
          take: 10,
          include: { _count: { select: { items: true } } },
        },
        _count: { select: { facturas: true } },
      },
    });
    res.json(cliente);
  } catch (err) { next(err); }
});

// POST /api/clientes
router.post('/', async (req, res, next) => {
  try {
    const { razonSocial, rifCedula, direccion, telefono, correo } = req.body;
    const empresaId = getEmpresaId(req);

    if (!razonSocial?.trim()) throw createValidationError('La razón social es obligatoria', { razonSocial: 'Campo requerido' });
    if (!rifCedula?.trim())   throw createValidationError('El Documento/Identificación es obligatorio', { rifCedula: 'Campo requerido' });

    const idRegex = /^[a-zA-Z0-9\-\.]{4,20}$/;
    const cleanRif = rifCedula.trim().toUpperCase();
    if (!idRegex.test(cleanRif)) {
      throw createValidationError('Formato de Identificación inválido (debe contener entre 4 y 20 caracteres alfanuméricos)', { rifCedula: 'Formato inválido' });
    }

    // Verificar si ya existe este RIF para la misma empresa
    const existente = await prisma.cliente.findUnique({
      where: { empresaId_rifCedula: { empresaId, rifCedula: cleanRif } }
    });
    if (existente) {
      throw createBusinessError(`Ya existe un cliente registrado con la identificación ${cleanRif} en tu empresa`);
    }

    const cliente = await prisma.cliente.create({
      data: {
        razonSocial: razonSocial.trim(),
        rifCedula: cleanRif,
        direccion: direccion?.trim() || null,
        telefono: telefono?.trim() || null,
        correo: correo?.trim().toLowerCase() || null,
        empresaId,
      },
    });
    res.status(201).json(cliente);
  } catch (err) { next(err); }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { razonSocial, rifCedula, direccion, telefono, correo } = req.body;
    const empresaId = getEmpresaId(req);

    if (!razonSocial?.trim()) throw createValidationError('La razón social es obligatoria');
    if (!rifCedula?.trim())   throw createValidationError('El Documento/Identificación es obligatorio');

    const idRegex = /^[a-zA-Z0-9\-\.]{4,20}$/;
    const cleanRif = rifCedula.trim().toUpperCase();
    if (!idRegex.test(cleanRif)) {
      throw createValidationError('Formato de Identificación inválido (debe contener entre 4 y 20 caracteres alfanuméricos)');
    }

    // Validar pertenencia
    const clienteExistente = await prisma.cliente.findFirst({
      where: { id: req.params.id, empresaId }
    });
    if (!clienteExistente) {
      throw createBusinessError('Cliente no encontrado o no pertenece a tu empresa');
    }

    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: {
        razonSocial: razonSocial.trim(),
        rifCedula: cleanRif,
        direccion: direccion?.trim() || null,
        telefono: telefono?.trim() || null,
        correo: correo?.trim().toLowerCase() || null,
      },
    });
    res.json(cliente);
  } catch (err) { next(err); }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const empresaId = getEmpresaId(req);
    const cliente = await prisma.cliente.findFirst({
      where: { id: req.params.id, empresaId }
    });
    if (!cliente) {
      throw createBusinessError('Cliente no encontrado o no pertenece a tu empresa');
    }

    const facturaCount = await prisma.factura.count({ where: { clienteId: req.params.id } });
    if (facturaCount > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar',
        message: `Este cliente tiene ${facturaCount} factura(s) asociada(s). Anule las facturas antes de eliminar el cliente.`,
      });
    }
    await prisma.cliente.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
