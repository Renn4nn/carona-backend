import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

  async assertActive(userId: string) {
    const user = await this.userRepository.findAccessById(userId);
    if (!user || !user.active || !user.role.active) {
      throw new UnauthorizedException('Usuário inativo ou não encontrado.');
    }

    return user;
  }

  async assertAdmin(userId: string) {
    const user = await this.assertActive(userId);
    if (user.role.code !== 'ADMIN') {
      throw new ForbiddenException(
        'Acesso permitido apenas para administradores.',
      );
    }

    return user;
  }
}
