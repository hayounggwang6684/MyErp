import bcrypt from "bcryptjs";
import { connectPostgres, query } from "../../src/shared/infrastructure/persistence/postgres.js";

async function seed() {
  await connectPostgres();

  const employees = [
    {
      id: "emp_001",
      employeeNo: "E-1001",
      name: "일반 사용자",
      department: "영업부",
      jobTitle: "부품 판매 담당",
      contact: "010-1000-1001",
      workStatus: "상담 진행",
      assignedWorkCount: 4,
    },
    {
      id: "emp_002",
      employeeNo: "E-1000",
      name: "관리자",
      department: "관리부",
      jobTitle: "운영 관리자",
      contact: "010-1000-1000",
      workStatus: "운영 점검",
      assignedWorkCount: 1,
    },
    {
      id: "emp_003",
      employeeNo: "E-2001",
      name: "박민수",
      department: "정비부",
      jobTitle: "정비 팀장",
      contact: "010-1000-2001",
      workStatus: "현장 작업",
      assignedWorkCount: 6,
    },
    {
      id: "emp_004",
      employeeNo: "E-3001",
      name: "이현우",
      department: "영업부",
      jobTitle: "영업 지원",
      contact: "010-1000-3001",
      workStatus: "견적 준비",
      assignedWorkCount: 3,
    },
  ];

  for (const employee of employees) {
    await query(
      `insert into identity.employees (
         id,
         employee_no,
         name,
         department,
         job_title,
         contact,
         work_status,
         assigned_work_count
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do update
       set employee_no = excluded.employee_no,
           name = excluded.name,
           department = excluded.department,
           job_title = excluded.job_title,
           contact = excluded.contact,
           work_status = excluded.work_status,
           assigned_work_count = excluded.assigned_work_count,
           updated_at = now()`,
      [
        employee.id,
        employee.employeeNo,
        employee.name,
        employee.department,
        employee.jobTitle,
        employee.contact,
        employee.workStatus,
        employee.assignedWorkCount,
      ],
    );
  }

  const users = [
    {
      id: "usr_user_001",
      employeeId: "emp_001",
      username: "ha",
      password: "1234",
      name: "일반 사용자",
      department: "영업부",
      roles: ["CUSTOMER_MANAGE", "ORDER_MANAGE", "PARTS_SALES", "INVENTORY_VIEW"],
    },
    {
      id: "usr_admin_001",
      employeeId: "emp_002",
      username: "admin.ha",
      password: "dudrhkd2026!",
      name: "관리자",
      department: "관리부",
      roles: ["SYSTEM_ADMIN"],
    },
  ];

  for (const user of users) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await query(
      `insert into identity.users (
         id,
         employee_id,
         username,
         password_hash,
         name,
         department,
         roles,
         status,
         failed_password_attempts,
         locked_until,
         last_failed_password_at
       ) values ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', 0, null, null)
       on conflict (username) do update
       set employee_id = excluded.employee_id,
           password_hash = excluded.password_hash,
           name = excluded.name,
           department = excluded.department,
           roles = excluded.roles,
           status = 'ACTIVE',
           failed_password_attempts = 0,
           locked_until = null,
           last_failed_password_at = null,
           updated_at = now()`,
      [user.id, user.employeeId, user.username, passwordHash, user.name, user.department, user.roles],
    );
  }

  console.log("Database seed completed.");
}

seed().catch((error) => {
  console.error("Database seed failed.");
  console.error(error);
  process.exitCode = 1;
});
