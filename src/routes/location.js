import { Router } from 'express';
import db from '../db/index.js';
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
        const { label , cityName, latitude, longitude } = req.body;


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