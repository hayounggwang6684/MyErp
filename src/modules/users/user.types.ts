export type UserStatus = "ACTIVE" | "LOCKED" | "INACTIVE";

export type DemoUser = {
  id: string;
  username: string;
  password: string;
  name: string;
  roles: string[];
  status: UserStatus;
};
