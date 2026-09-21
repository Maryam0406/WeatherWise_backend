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

