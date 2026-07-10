import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError, z } from 'zod';
import { ApiErrorResponse } from '../types/api';
import { Response } from 'express';

@Catch(ZodSerializationException)
export class ZodSerializationExceptionFilter implements ExceptionFilter {
  catch(exception: ZodSerializationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const zodErr: ZodError = exception.getZodError() as ZodError;
    const fallbackError =
      z.flattenError(zodErr).formErrors[0] ||
      'Erro interno na estrutura dos dados';
    const error: ApiErrorResponse = {
      error: {
        type: 'SerializationException',
        message: 'Erro ao processar a resposta do servidor',
        details: fallbackError,
      },
    };

    response.status(status).json(error);
  }
}
