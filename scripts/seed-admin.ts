import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/index.js';
import { users } from '../src/db/schema.js';

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@flip.local').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'FlipAdmin2026!';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';

  console.log('Seeding Administrator Account into Neon Postgres...');
  console.log(`Email: ${adminEmail}`);

  // Hash password with bcrypt
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

  // Check if admin user already exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (existing) {
    console.log(`User ${adminEmail} exists. Updating credentials and elevating role to 'admin'...`);
    await db
      .update(users)
      .set({
        passwordHash,
        role: 'admin',
        name: adminName,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id));
  } else {
    const id = `usr_admin_${Date.now().toString(36)}`;
    console.log(`Creating new admin account: ${id}`);
    await db.insert(users).values({
      id,
      email: adminEmail,
      passwordHash,
      name: adminName,
      role: 'admin',
      isActive: true,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminEmail}`,
    });
  }

  console.log('=============================================');
  console.log('✅ Admin Account Successfully Provisioned!');
  console.log(`👤 Username / Email: ${adminEmail}`);
  console.log(`🔑 Password:         ${adminPassword}`);
  console.log(`🛡️ Role:             admin`);
  console.log('=============================================');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('❌ Failed to seed administrator account:', err);
  process.exit(1);
});
