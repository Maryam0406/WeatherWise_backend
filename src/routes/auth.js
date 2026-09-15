import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

//creates an express router instance to define routes for authentication
const router = Router();

//POST signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password ) {
            return res.status(400).json({ error: 'Name, email and password are required'});
        }

        //check if a user with the provided email already exists in the database
        const existing = await db.select().from(users).where(eq(users.email, email));
        if (existing.length > 0) {
            return res.status(409).json({ error: 'An account with this email alreadxy exists'});
        }

        //Hash the password using bcrypt
        const passwordHash = await bcrypt.hash(password, 10);

        const [newUser] = await db
          .insert(users)
          .values({
            name,
            email,
            passwordHash,
            role: role === 'admin'? 'admin' : 'user',
          })
          .returning();

        const token = jwt.sign(
            { id: newUser.id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d'}
        ); 

        res.status(201).json({
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },

        });
        
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Sommething went wrong during signup'});  
    }
});
