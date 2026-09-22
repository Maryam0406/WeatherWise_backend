// src/routes/admin.js
import { Router } from 'express';
import { db } from '../db/index.js';
import { users, trips } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
    try {
        const allUsers = await db
            .select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt })
            .from(users);
        res.json(allUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
});

// DELETE /api/admin/trips/:id — remove any trip (moderation)
router.delete('/trips/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.select().from(trips).where(eq(trips.id, Number(id)));
        if (!existing) {
            return res.status(404).json({ error: 'Trip not found.' });
        }

        await db.delete(trips).where(eq(trips.id, Number(id)));
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete trip.' });
    }
});

export default router;