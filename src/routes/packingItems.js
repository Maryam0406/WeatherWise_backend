import { Router } from 'express';
import { db } from '../db/index.js';
import { packingItems, trips } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

async function findOwnedItem(itemId, userId) {
    const [item] = await db.select().from(packingItems).where(eq(packingItems.id, itemId));
    if (!item) return null;

    const [trip] = await db.select().from(trips).where(eq(trips.id, item.tripId));
    if (!trip || trip.userId !== userId) return null;

    return item;
}

router.post('/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { itemName } = req.body;

        if (!itemName) {
            return res.status(400).json({ error: 'itemName is required' });
        }

        const [trip] = await db
            .select()
            .from(trips)
            .where(and(eq(trips.id, Number(tripId)), eq(trips.userId, req.user.id)));

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const [newItem] = await db
            .insert(packingItems)
            .values({
                tripId: Number(tripId),
                itemName,
                isPacked: false,
                isSuggested: false,
            })
            .returning();

        res.status(201).json(newItem);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add packing item' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { isPacked, itemName } = req.body;

        const existing = await findOwnedItem(Number(id), req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Packing item not found' });
        }

        const [updated] = await db
            .update(packingItems)
            .set({
                isPacked: isPacked ?? existing.isPacked,
                itemName: itemName ?? existing.itemName,
            })
            .where(eq(packingItems.id, Number(id)))
            .returning();

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update packing item' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await findOwnedItem(Number(id), req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Packing item not found' });
        }

        await db.delete(packingItems).where(eq(packingItems.id, Number(id)));
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete packing item' });
    }
});

export default router;