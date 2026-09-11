import 'dotenv/config';
import express from 'express';
import cors from 'cors';

//creates the express application
const app = express(); 
//it uses the port defined in the environment variable PORT or defaults to 5000 if not defined    
const PORT = process.env.PORT || 5000;

//allows communication between frontend and backend of different origins
app.use(cors());
//allows the express application to convert incoming JSON data to javascript objects
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'WeatherWise API is running'});
});

//Starts the backend server and makes it listen for requests on the specified PORT.
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});