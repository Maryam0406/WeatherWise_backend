import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './db/index.js';
import { users } from './db/schema.js';
import authRoutes from './routes/auth.js';
import locationRoutes from './routes/location.js';
import tripRoutes from './routes/trips.js';
import packingItemRoutes from './routes/packingItems.js';
import activityRoutes from './routes/activities.js';

//creates the express application
const app = express();
//it uses the port defined in the environment variable PORT or defaults to 5000 if not defined    
const PORT = process.env.PORT || 5000;

//allows communication between frontend and backend of different origins
app.use(cors());
//allows the express application to convert incoming JSON data to javascript objects
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/packing-items', packingItemRoutes);
app.use('/api/activities', activityRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'WeatherWise API is running' });
});

app.get('/test-db', async (req, res) => {
    try {
        const allUsers = await db.select().from(users);
        res.json({ success: true, userCount: allUsers.length, users: allUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

//Starts the backend server and makes it listen for requests on the specified PORT.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});