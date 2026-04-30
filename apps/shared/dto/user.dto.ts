export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}