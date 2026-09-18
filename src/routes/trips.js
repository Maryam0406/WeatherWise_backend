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

//POST api trips - create a trip + auto generate packing suggestions
router.post('/', async ( req, res) => {
    try {
        const { name, locationId, startDate, endDate, notes } = req.body;

        if (!name || !locationId || !startDate || !endDate) {
            return res.status(400).json({ error: 'name, locationId, startDate, and endDate are required'});
        }
        
        if (endDate < startDate) {
            return res.status(400).json({ error: 'endDate must be on or after startDate'});
        }

        const [newTrip] = await db
            .insert(trips)
            .values({
                userId: req.user.id,
                locationId: Number(locationId),
                name,
                startDate,
                endDate,
                notes: notes || null,
            })
            .returning();

        //Temporary mock forecast
        const mockForecast = { willRain: true, avgTemp: 27 };
        const suggestions = generatePackingSuggestions(mockForecast);

        if (suggestions.length > 0) {
            await db.insert(packingItems).values(
                suggestions.map((itemName) => ({
                    tripId: newTrip.id,
                    itemName,
                    isPacked: false,
                    isSuggested: true,
                }))
            );
        }

        const fullTrip = await db.query.findFirst({
            where: eq(trips.id, newTrip.id),
            with: { packingItems: true, activities: true },
        });

        res.status(201).json(fullTrip);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create trip' });
    }
});

