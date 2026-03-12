import type { DemoUser } from "./user.types.js";

const demoUsers: DemoUser[] = [
  {
    id: "usr_user_001",
    username: "ha",
    password: "1234",
    name: "일반 사용자",
    roles: ["PARTS_SALES", "INVENTORY_VIEW"],
    status: "ACTIVE",
  },
  {
    id: "usr_admin_001",
    username: "admin.ha",
    password: "dudrhkd2026!",
    name: "관리자",
    roles: ["SYSTEM_ADMIN"],
    status: "ACTIVE",
  },
];

export class UserService {
  findByUsername(username: string) {
    return demoUsers.find((user) => user.username === username) || null;
  }
}

export const userService = new UserService();
