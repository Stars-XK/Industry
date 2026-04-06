import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const errMessage = typeof message === 'object' && message !== null && 'message' in message 
      ? (message as any).message 
      : message;

    // 打印真实的错误堆栈，防止 500 错误被吞噬
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`[${request.method}] ${request.url} - ${status} - ${exception instanceof Error ? exception.stack : exception}`);
    } else {
      this.logger.error(`[${request.method}] ${request.url} - ${status} - ${JSON.stringify(errMessage)}`);
    }

    response.status(status).json({
      code: status,
      data: null,
      message: Array.isArray(errMessage) ? errMessage[0] : errMessage,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
