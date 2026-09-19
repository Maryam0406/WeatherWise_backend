import { Router } from 'express';
import { db } from '../db/index.js';
import { savedLocations, trips } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

//get api locations
router.get('/', async (req, res) => {
    try {
        const userLocations = await db
            .select()
            .from(savedLocations)
            .where(eq(savedLocations.userId, req.user.id));
        res.json(userLocations);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch saved locations.' });
    }
});

//post api locations - create a new saved location
router.post('/', async (req, res) => {
    try {
        const { label, cityName, latitude, longitude } = req.body;


        if (!label || !cityName || !latitude || !longitude) {
            return res.status(400).json({ error: 'label, city name, latitude, and longitude are required.' });
        }

        const [newLocation] = await db
            .insert(savedLocations)
            .values({
                userId: req.user.id,
                label,
                cityName,
                latitude: String(latitude),
                longitude: String(longitude),
            })
            .returning();

        res.status(201).json(newLocation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create location.' });
    }
});

//put api locations - update a saved location
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { label, cityName, latitude, longitude } = req.body;

        const [existing] = await db
            .select()
            .from(savedLocations)
            .where(and(eq(savedLocations.id, Number(id)), eq(savedLocations.userId, req.user.id)));

        if (!existing) {
            return res.status(404).json({ error: 'Location not found' });
        }

        const [updated] = await db
            .update(savedLocations)
            .set({
                label: label ?? existing.label,
                cityName: cityName ?? existing.cityName,
                latitude: latitude ? String(latitude) : existing.latitude,
                longitude: longitude ? String(longitude) : existing.longitude
            })
            .where(eq(savedLocations.id, Number(id)))
            .returning();

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update location.' });
    }
});

//DELETE api - delete but restricts if trips reference it
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db
            .select()
            .from(savedLocations)
            .where(and(eq(savedLocations.id, Number(id)), eq(savedLocations.userId, req.user.id)));

        if (!existing) {
            return res.status(404).json({ error: 'Location not found' });
        }

        //check if any trips reference this location
        const linkedTrips = await db.select().from(trips).where(eq(trips.locationId, Number(id)));
        if (linkedTrips.length > 0) {
            return res.status(409).json({ error: "Cant delete this location - it's linked to one or more existing trips." });
        }

        await db.delete(savedLocations).where(eq(savedLocations.id, Number(id)));
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete location.' });
    }
});

export default router;