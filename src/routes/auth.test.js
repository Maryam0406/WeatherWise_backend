import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth routes', () => {
    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,//unique email each run
        password: 'testpassword123',
    };

    //it defines one individual test
    it('should sign up a new user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send(testUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user.email).toBe(testUser.email);
        expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject signup with a missing password', async () => {
        const res = await request(app)
            .post('/api/auth/signup')
            .send({ name: 'No Password', email: `nopass_${Date.now()}@example.com` });

        expect(res.status).toBe(400);
    });

    it('should log in with correct credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password, });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should reject login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });
        expect(res.status).toBe(401);
    });

    it('should reject creating a location without a token', async () => {
        const res = await request(app)
            .post('/api/locations')
            .send({ label: 'Test', cityName: 'Test City', latitude: 1, longitude: 1, });

        expect(res.status).toBe(401);
    });
});