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