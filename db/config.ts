import { defineDb, defineTable, column, NOW } from 'astro:db';

const Users = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        username: column.text(),
        email: column.text({ unique: true }),
        passwordHash: column.text(),
        created_at: column.date({ default: NOW }),
        emailVerified: column.boolean({ default: false }),
        verificationToken: column.text({ optional: true }),
        tokenExpiry: column.date({ optional: true }),
        resetToken: column.text({ optional: true }),
        resetTokenExpiry: column.date({ optional: true }),
        createdAt: column.date({ default: NOW })
    },
});

const Favorites = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        userId: column.number(),
        postId: column.number(),
        created_at: column.date({ default: NOW }),
    },
});

export default defineDb({
    tables: { Users, Favorites },
});
