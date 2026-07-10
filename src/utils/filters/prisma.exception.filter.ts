import { ArgumentsHost, Catch } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { generatePrismaExceptionResponse } from 'src/utils/errors/error'
import { Prisma } from 'generated/prisma/client'
import { ApiErrorResponse } from 'src/utils/types/api'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse()

		const { statusCode, ...prismaEx } =
			generatePrismaExceptionResponse(exception)
		const error: ApiErrorResponse = {
			error: {
				type: 'PrismaException',
				message: prismaEx.message,
				details: `PrismaCode (${prismaEx.prismaCode})`
			}
		}

		response.status(statusCode).json(error)
	}
}
