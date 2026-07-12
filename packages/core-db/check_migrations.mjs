import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMigrations() {
  try {
    // Query the _prisma_migrations table directly
    const migrations = await prisma.$queryRaw`
      SELECT id, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 10
    `;
    console.log('=== Recorded Migrations ===');
    console.log(JSON.stringify(migrations, null, 2));
    
    // Check for UserRoleAssignment table
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('\n=== All Tables ===');
    console.log(tables.map(t => t.table_name).join('\n'));
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations();
