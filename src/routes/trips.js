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

