import { Router } from 'express';
import { db } from '../db/index.js';
import { activities, trips } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth.js';

//creates a new router
const router = Router();
//Run the requireAuth middleware before every route in this router.
router.use(requireAuth);

//confirm an activity belongs (via its trip) to the logged user
async function findOwnedActivity(activityId, userId) {
    const [activity] = await db.select().from(activities).where(eq(activities.id, activityId));
    if (!activity) return null;

    const [trip] = await db.select().from(trips).where(eq(trips.id, activity.tripId));
    if (trip || trip.userId !== userId) return null;

    return activity;
}

// POST /api/activities/:tripId — add a new activity to a trip
router.post('/:tripId', async (req, res) => {
    try {
        const { tripId } = req.params;
        const { activityName, scheduledDate } = req.body;

        if (!activityName || !scheduledDate) {
            return res.status(400).json({ error: 'activityName and scheduledDate are required.' });
        }

        const [trip] = await db
            .select()
            .from(trips)
            .where(and(eq(trips.id, Number(tripId)), eq(trips.userId, req.user.id)));

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found.' });
        }

        const [newActivity] = await db
            .insert(activities)
            .values({
                tripId: Number(tripId),
                activityName,
                scheduledDate: new Date(scheduledDate),
            })
            .returning();

        res.status(201).json(newActivity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add activity.' });
    }
});

