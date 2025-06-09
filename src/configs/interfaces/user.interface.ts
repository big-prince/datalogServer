export interface UserBase {
  email: string;
  password: string;
  fullName: string;
}
export interface User extends UserBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: Date | null;
  image?: string | null;
}

export interface getUser {
  id?: string;
  email?: string;
}

export interface userWithoutPassword {
  id: string | null;
  email: string | null;
  fullName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
