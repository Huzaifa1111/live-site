import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    UseGuards,
    Req
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { Address } from './address.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users/addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
    constructor(private readonly addressesService: AddressesService) { }

    @Get()
    findAll(@Req() req) {
        console.log('Finding all addresses for user:', req.user.id);
        return this.addressesService.findAll(req.user.id);
    }

    @Post()
    create(@Req() req, @Body() addressData: Partial<Address>) {
        console.log('Creating address for user:', req.user.id, addressData);
        return this.addressesService.create(req.user.id, addressData);
    }

    @Patch(':id')
    update(
        @Req() req,
        @Param('id') id: string,
        @Body() addressData: Partial<Address>
    ) {
        return this.addressesService.update(id, req.user.id, addressData);
    }

    @Delete(':id')
    remove(@Req() req, @Param('id') id: string) {
        return this.addressesService.remove(id, req.user.id);
    }
}
