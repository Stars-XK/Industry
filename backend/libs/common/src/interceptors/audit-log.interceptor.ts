import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';
import { AuditLog } from '../../../entities/src/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly dataSource: DataSource) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const method = req.method;

    // 只拦截可能产生修改的操作 (POST, PUT, DELETE, PATCH)
    if (['GET', 'OPTIONS', 'HEAD'].includes(method)) {
      return next.handle();
    }

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        const executionTime = Date.now() - now;
        
        try {
          const auditLog = new AuditLog();
          auditLog.user_id = req.user ? req.user.id : null;
          auditLog.ip_address = req.ip || req.connection?.remoteAddress;
          auditLog.req_method = method;
          auditLog.req_url = req.originalUrl || req.url;
          
          // 脱敏或过滤掉敏感信息
          const bodyClone = { ...req.body };
          if (bodyClone.password) {
            bodyClone.password = '******';
          }
          auditLog.req_body = bodyClone;
          auditLog.execution_time = executionTime;

          // 异步记录审计日志，不阻塞主流程
          if (this.dataSource && this.dataSource.isInitialized) {
            this.dataSource.getRepository(AuditLog).save(auditLog).catch(err => {
              this.logger.error('Failed to save audit log', err);
            });
          }
        } catch (error) {
          this.logger.error('Error constructing audit log', error);
        }
      })
    );
  }
}
