import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/JwtGuard';
import z from 'zod';
import { GeoService } from './geo.service';

const querySchema = z.string().trim().min(3).max(255);

@Controller('geo')
@UseGuards(JwtAuthGuard)
export class GeoController {
  constructor(private readonly service: GeoService) {}

  @Get('autocomplete')
  async autocomplete(@Query('q') query: string) {
    return { data: await this.service.autocomplete(querySchema.parse(query)) };
  }
}
