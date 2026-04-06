import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { RoleController } from './role.controller';
import { DeptController } from './dept.controller';
import { SystemMenuController } from './menu.controller';
import { User } from '../../../../libs/entities/src/user.entity';
import { Role } from '../../../../libs/entities/src/role.entity';
import { Dept } from '../../../../libs/entities/src/dept.entity';
import { Menu } from '../../../../libs/entities/src/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Dept, Menu])],
  controllers: [UserController, RoleController, DeptController, SystemMenuController],
})
export class SystemModule {}
