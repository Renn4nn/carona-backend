import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import { createApiResponseErrorFromZodFlattenError } from '../errors/error.utils';
import { ZodError } from 'zod';
import { Response } from 'express';

@Catch(ZodValidationException)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const zodEx: ZodError = exception.getZodError() as ZodError;
    const error = createApiResponseErrorFromZodFlattenError(zodEx);

    response.status(status).json(error);
  }
}
