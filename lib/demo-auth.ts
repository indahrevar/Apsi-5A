export type AppRole = "customer" | "admin" | "production" | "owner";

export type DemoAccount = {
  role: AppRole;
  username: string;
  password: string;
  id: string;
  name: string;
};

export const demoAccounts: DemoAccount[] = [
  {
    role: "customer",
    username: "rizky",
    password: "rizky123",
    id: "PLGDEMO1",
    name: "Rizky Ramadhan",
  },
  {
    role: "admin",
    username: "admin",
    password: "admin123",
    id: "ADMDEMO1",
    name: "Admin Dapur",
  },
  {
    role: "production",
    username: "produksi",
    password: "produksi123",
    id: "KRYDEMO1",
    name: "Budi Produksi",
  },
  {
    role: "owner",
    username: "owner",
    password: "owner123",
    id: "OWNDEMO1",
    name: "Fauziah Abita",
  },
];

export const rolePaths: Record<AppRole, string> = {
  customer: "/customer",
  admin: "/admin",
  production: "/produksi",
  owner: "/owner",
};

export const roleLabels: Record<AppRole, string> = {
  customer: "Customer",
  admin: "Admin",
  production: "Produksi",
  owner: "Owner",
};

export function isAppRole(value: unknown): value is AppRole {
  return (
    value === "customer" ||
    value === "admin" ||
    value === "production" ||
    value === "owner"
  );
}
