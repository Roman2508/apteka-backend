import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentItemService } from './document-item.service';
import { CreateDocumentItemDto } from './dto/create-document-item.dto';
import { UpdateDocumentItemDto } from './dto/update-document-item.dto';

@Controller('document-item')
export class DocumentItemController {
  constructor(private readonly documentItemService: DocumentItemService) {}

  // @Post()
  // create(@Body() createDocumentItemDto: CreateDocumentItemDto) {
  //   return this.documentItemService.create(createDocumentItemDto);
  // }

  // @Get()
  // findAll() {
  //   return this.documentItemService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.documentItemService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDocumentItemDto: UpdateDocumentItemDto) {
  //   return this.documentItemService.update(+id, updateDocumentItemDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.documentItemService.remove(+id);
  // }
}
