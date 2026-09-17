import {Router} from 'express';
import {db} from '../db/index.js';
import {trips, packingItems, activities} from '../db/schema.js';
import {eq,and} from 'drizzle-orm';
import {requireAuth} from '../middleware/auth.js';
import {generatePackingItems} from '..utils/packingEngine.js';

const router = Router();
router.use(requireAuth);

//get api trips - list this users trips
router.get('/', async (req, res) => {
    try {
        const userTrips = await db.query.trips.findMany({
            where: eq(trips.userId, req.user.id),
            with: { packingItems: true, activities: true},
        });

        res.json(userTrips);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});

//get api trips/:id - get a specific trip by id with packing items and activities
router.get('/:id', async (req, res) => {
    try {
        const trip = await db.query.trips.findFirst({
            where: and(eq(trips.id, Number(req.params.id)), eq(trips.userId, req.user.id)),
            with: { packingItems: true, activities: true, location: true},
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        res.json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch trip' });
    }
});

