import { API_URL } from './config';

describe('API_URL Configuration', () => {
    it('should be defined', () => {
        expect(API_URL).toBeDefined();
    });

    it('should not end with a trailing slash', () => {
        expect(API_URL.endsWith('/')).toBe(false);
    });

    it('should default to the Render URL if env vars are missing', () => {
        // Note: This test assumes process.env.REACT_APP_API_URL is undefined in the test environment
        // unless mocked. If the test runner sets it, this might fail or need adjustment.
        if (!process.env.REACT_APP_API_URL) {
            expect(API_URL).toBe('https://skillshare-0yvk.onrender.com');
        }
    });
});
