import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { RegisterDiscrepancyDto } from './dto/register-discrepancy.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(+id);
  }

  @Post(':id/validate-product')
  validateProduct(@Param('id') id: string, @Body('productId') productId: number) {
    return this.documentsService.validateScannedProduct(+id, +productId);
  }

  @Post('items/:itemId/accept')
  acceptItem(@Param('itemId') itemId: string) {
    return this.documentsService.acceptScannedItem(+itemId);
  }

  @Post('discrepancy')
  registerDiscrepancy(@Body() dto: RegisterDiscrepancyDto) {
    return this.documentsService.registerDiscrepancy(dto);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string) {
    return this.documentsService.completeIncomingDocument(+id);
  }

  @Post(':id/return')
  createReturn(@Param('id') id: string) {
    return this.documentsService.createReturnDocument(+id);
  }
}
