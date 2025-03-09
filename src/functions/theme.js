export const SITENAME = 'Pyrite';
export const API_URL = 'https://api.pyrite-events.de/wp-json/wp/v2';
export const CUSTOM_QUERY_URL = 'https://api.pyrite-events.de/wp-json/custom/v1';

import { registerUser } from '../utils/auth';

// export const API_URL = 'http://localhost:8070/wp-json/wp/v2';
// export const CUSTOM_QUERY_URL = 'http://localhost:8070/wp-json/pyrite/v2/customQuery';

export async function handleSubmit(username, email, password) {
    try {
        await registerUser(username, email, password);
        console.log('Registration successful!');
        console.log(username, email, password);
    } catch (error) {
        console.error(`Registration failed: ${error}`);
    }
}