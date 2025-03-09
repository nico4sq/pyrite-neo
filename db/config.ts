import { defineDb, defineTable, column, NOW } from 'astro:db';

const Users = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        username: column.text(),
        email: column.text(),
        password: column.text(),
        created_at: column.date({ default: NOW }),
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