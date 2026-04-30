import { Controller, Get, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { AttributesService } from './attributes.service';

@Controller('attributes')
export class AttributesController {
    constructor(private readonly attributesService: AttributesService) { }

    @Get()
    async findAll(@Query('q') query: string) {
        return this.attributesService.findAll(query);
    }

    @Post()
    async create(@Body() body: { name: string }) {
        return this.attributesService.create(body.name);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.attributesService.remove(id);
    }

    @Get('values')
    async findValues(@Query('attribute') attribute: string, @Query('q') query: string) {
        return this.attributesService.findValuesByAttribute(attribute, query);
    }

    @Post('values')
    async createValue(@Body() body: { attribute: string; value: string }) {
        return this.attributesService.createAttributeValue(body.attribute, body.value);
    }
}
