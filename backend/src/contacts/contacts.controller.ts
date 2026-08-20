import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    ValidationPipe,
    Query
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contacts')
@UseGuards(JwtAuthGuard)
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Post()
    create(@Body(ValidationPipe) createContactDto: CreateContactDto, @Request() req) {
        return this.contactsService.create(createContactDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.contactsService.findAll(req.user);
    }

    @Get('search')
    search(@Query('q') query: string, @Request() req) {
        return this.contactsService.search(query, req.user);
    }

    @Get('application/:applicationId')
    findByApplication(@Param('applicationId') applicationId: string, @Request() req) {
        return this.contactsService.findByApplication(applicationId, req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.contactsService.findOne(id, req.user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body(ValidationPipe) updateContactDto: UpdateContactDto,
        @Request() req,
    ) {
        return this.contactsService.update(id, updateContactDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.contactsService.remove(id, req.user);
    }
}