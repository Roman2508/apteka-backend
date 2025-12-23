import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from "@nestjs/common"
import { DocumentsService } from "./documents.service"
import { CreateDocumentDto } from "./dto/create-document.dto"
import { UpdateDocumentDto } from "./dto/update-document.dto"
import { RegisterDiscrepancyDto } from "./dto/register-discrepancy.dto"

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.create(createDocumentDto)
  }

  @Get()
  findAll(@Query("type") type?: string, @Query("status") status?: string, @Query("hasDiscrepancy") hasDiscrepancy?: string) {
    return this.documentsService.findAll(type, status, hasDiscrepancy === "true")
  }

  @Get(":id")
  findOne(@Param("type") type: string, @Param("id") id: string) {
    return this.documentsService.findOne(type, +id)
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(+id, updateDocumentDto)
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.documentsService.remove(+id)
  }

  @Post(":id/validate-product")
  validateProduct(@Param("id") id: string, @Body("batchNumber") batchNumber: string) {
    return this.documentsService.validateScannedProduct(+id, batchNumber)
  }

  @Post("items/:itemId/accept")
  acceptItem(@Param("itemId") itemId: string, @Body("quantity") quantity?: number) {
    return this.documentsService.acceptScannedItem(+itemId, quantity)
  }

  @Post("discrepancy")
  registerDiscrepancy(@Body() dto: RegisterDiscrepancyDto) {
    return this.documentsService.registerDiscrepancy(dto)
  }

  @Post("discrepancy/:id/cancel")
  cancelDiscrepancy(@Param("id") id: string) {
    return this.documentsService.cancelDiscrepancy(+id)
  }

  @Post(":id/complete")
  complete(@Param("id") id: string) {
    return this.documentsService.completeIncomingDocument(+id)
  }

  @Post(":id/return")
  createReturn(@Param("id") id: string) {
    return this.documentsService.createReturnDocument(+id)
  }
}
