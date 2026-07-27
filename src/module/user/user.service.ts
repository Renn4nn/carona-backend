import { Injectable } from '@nestjs/common';
import {
  UpdateUserDto,
  CreateUserDto,
  UserSchema,
} from 'src/utils/schemas/user.schema';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  getUsers(): Promise<UserSchema[]> {
    return this.userRepository.users();
  }
  getUser(id: string): Promise<UserSchema> {
    return this.userRepository.user({ id });
  }

  createUser(data: CreateUserDto): Promise<UserSchema> {
    return this.userRepository.createUser(data);
  }

  updateUser(id: string, data: UpdateUserDto): Promise<UserSchema> {
    return this.userRepository.updateUser(id, data);
  }

  deleteUser(id: string): Promise<UserSchema> {
    return this.userRepository.deleteUser(id);
  }
}
