import { db, Users } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	db.insert(Users).values({username: 'Max Mustermann', email: '	max@mustermann.de', password: '123456'});
}
