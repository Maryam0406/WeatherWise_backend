import { Router } from 'express';
import { db } from '../db/index.js';
import { packingItems, trips } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

//creates a new express router
const router = Router();
router.use(requireAuth);

//confirm that a packing item belongs ( via trips ) to the logged in user
async function findOwnedItem(itemId, userId) {
    const [item] = await db.select().from(packingItems).where(eq(packingItems.id, itemId));
    if (!item) return null;

    const [trip] = await db.select().from(trips).where(eq(trips.id, item.tripId));
    if (!trip || trip.userId !== userId) return null;

    return item;

}

//Post api packing items - add a new item to a trip
router.post('/:tripId', async (req, res) => {
    try {
        const { id } = req.params;
        const { itemName } = req.body;

        if (!itemName) {
            return res.status(400).json({ error: 'itemName is required' });
        }

        const [trip] = await db
            .select()
            .from(trips)
            .where(and(eq(trips.id, Number(id)), eq(trips.userId, req.user.id)));

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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add packing item' });
    }
});
