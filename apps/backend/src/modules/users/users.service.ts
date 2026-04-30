import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AdminService } from '../admin/admin.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private adminService: AdminService,
  ) { }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const { ObjectId } = require('mongodb');
    const user = await this.usersRepository.findOne({ where: { _id: new ObjectId(id) } as any });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }


  async create(createUserDto: CreateUserDto): Promise<User> {
    // Note: Creating users directly via UsersService might need password hashing if not called from AuthService.
    // Assuming this is used by Admin where they might set a temporary password or similar.
    // Ideally duplicate check logic should be here or in controller.
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }
    const user = this.usersRepository.create(createUserDto);
    const savedUser = await this.usersRepository.save(user);

    // Trigger real-time analytics update
    this.adminService.notifyAnalyticsUpdate();

    return savedUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const { ObjectId } = require('mongodb');
    await this.usersRepository.update(new ObjectId(id) as any, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const { ObjectId } = require('mongodb');
    await this.usersRepository.delete(new ObjectId(id) as any);
  }
}