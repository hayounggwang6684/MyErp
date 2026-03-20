import bcrypt from "bcryptjs";
import { connectPostgres, query } from "../../src/shared/infrastructure/persistence/postgres.js";

async function seed() {
  await connectPostgres();

  const users = [
    {
      id: "usr_user_001",
      username: "ha",
      password: "1234",
      name: "일반 사용자",
      roles: ["PARTS_SALES", "INVENTORY_VIEW"],
    },
    {
      id: "usr_admin_001",
      username: "admin.ha",
      password: "dudrhkd2026!",
      name: "관리자",
      roles: ["SYSTEM_ADMIN"],
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await query(
      `insert into identity.users (
         id,
         username,
         password_hash,
         name,
         roles,
         status,
         failed_password_attempts,
         locked_until,
         last_failed_password_at
       ) values ($1, $2, $3, $4, $5, 'ACTIVE', 0, null, null)
       on conflict (username) do update
       set password_hash = excluded.password_hash,
           name = excluded.name,
           roles = excluded.roles,
           status = 'ACTIVE',
           failed_password_attempts = 0,
           locked_until = null,
           last_failed_password_at = null,
           updated_at = now()`,
      [user.id, user.username, passwordHash, user.name, user.roles],
    );
  }

  console.log("Database seed completed.");
}

seed().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  process.exitCode = 1;
});
