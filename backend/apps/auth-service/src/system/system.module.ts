import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { RoleController } from './role.controller';
import { DeptController } from './dept.controller';
import { SystemMenuController } from './menu.controller';
import { DictController } from './dict.controller';
import { AuditLogController } from './audit-log.controller';
import { ConfigController } from './config.controller';
import { User } from '../../../../libs/entities/src/user.entity';
import { Role } from '../../../../libs/entities/src/role.entity';
import { Dept } from '../../../../libs/entities/src/dept.entity';
import { Menu } from '../../../../libs/entities/src/menu.entity';
import { DictType } from '../../../../libs/entities/src/dict-type.entity';
import { DictData } from '../../../../libs/entities/src/dict-data.entity';
import { AuditLog } from '../../../../libs/entities/src/audit-log.entity';
import { SysConfig } from '../../../../libs/entities/src/sys-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Dept, Menu, DictType, DictData, AuditLog, SysConfig])],
  controllers: [UserController, RoleController, DeptController, SystemMenuController, DictController, AuditLogController, ConfigController],
})
export class SystemModule {}
