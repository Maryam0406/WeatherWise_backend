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