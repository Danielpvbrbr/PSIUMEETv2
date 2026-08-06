import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  // Aponte para onde o seu schema está. Se estiver solto no app:
  schema: './app/db/schema.js', 
  dbCredentials: {
    // O nome do arquivo que você colocou no 'new Database()'
    url: 'banco.db', 
  },
});