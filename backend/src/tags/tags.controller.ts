import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    async create(
        @Request() req: any,
        @Body() body: { name: string; color?: string },
    ) {
        return this.tagsService.create(req.user, body.name, body.color);
    }

    @Get()
    async findAll(@Request() req: any) {
        return this.tagsService.findAll(req.user.id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { name?: string; color?: string },
    ) {
        return this.tagsService.update(id, body.name, body.color);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        await this.tagsService.delete(id);
        return { success: true };
    }
}