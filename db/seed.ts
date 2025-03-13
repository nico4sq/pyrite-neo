import { db, Users } from 'astro:db';

// https://astro.build/db/seed
export default async function seed() {
	db.insert(Users).values({username: 'admin', email: 'max.mustermann@test.de', passwordHash: '123456', emailVerified: true}).execute();
}


// id: column.number({ primaryKey: true }),
// username: column.text(),
// email: column.text({ unique: true }),
// passwordHash: column.text(),
// created_at: column.date({ default: NOW }),
// emailVerified: column.boolean({ default: false }),
// verificationToken: column.text({ optional: true }),
// tokenExpiry: column.date({ optional: true }),
// resetToken: column.text({ optional: true }),
// resetTokenExpiry: column.date({ optional: true }),
// createdAt: column.date({ default: NOW })