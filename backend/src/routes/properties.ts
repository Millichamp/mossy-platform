import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all properties
router.get('/', async (req, res) => {
  const properties = await prisma.property.findMany();
  res.json(properties);
});

// Get property by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return res.status(404).json({ error: 'Property not found' });
  res.json(property);
});

// Create property
router.post('/', async (req, res) => {
  try {
    const property = await prisma.property.create({ data: req.body });
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create property', details: err });
  }
});

// Update property
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const property = await prisma.property.update({ where: { id }, data: req.body });
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update property', details: err });
  }
});

// Delete property
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.property.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete property', details: err });
  }
});

export default router;
