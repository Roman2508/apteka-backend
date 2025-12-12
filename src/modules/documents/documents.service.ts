import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateDocumentDto } from "./dto/create-document.dto"
import { UpdateDocumentDto } from "./dto/update-document.dto"
import { DocumentStatus, DocumentType } from "../../../prisma/generated/client"
import { ProductBatchService } from "../product-batch/product-batch.service"
import { RegisterDiscrepancyDto } from "./dto/register-discrepancy.dto"
import { InventoryService } from "../inventory/inventory.service"

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private productBatchService: ProductBatchService,
    private inventoryService: InventoryService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto) {
    // Logic: Create Document with status 'in_process' and items
    // Mapping:
    // code -> document_number
    // totalPrice -> expected_total

    const {
      code,
      counterpartyId,
      pharmacyId,
      warehouseId,
      userId,
      totalPrice,
      items,
    } = createDocumentDto

    return this.prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          document_number: code.toString(), // converting number to string
          document_date: new Date(),
          status: DocumentStatus.in_process,
          counterparty: { connect: { id: counterpartyId } },
          pharmacy: { connect: { id: pharmacyId } },
          warehouse: { connect: { id: warehouseId } },
          user: { connect: { id: userId } },
          expected_total: totalPrice,
          items: {
            create: items.map((item) => ({
              medicalProduct: { connect: { id: item.id } },
              quantity_expected: item.count,
              price: item.price,
              expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
              barcode: item.bartcode,
              batch_number: item.batch_number,
            })),
          },
        },
        include: {
          items: true,
        },
      })
      return document
    })
  }

  findAll() {
    return this.prisma.document.findMany()
  }

  findOne(id: number) {
    return this.prisma.document.findUnique({ where: { id }, include: { items: true } })
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`
  }

  remove(id: number) {
    return this.prisma.document.delete({ where: { id } })
  }

  async validateScannedProduct(documentId: number, productId: number) {
    return this.prisma.$transaction(async (tx) => {
      const documentItem = await tx.documentItem.findFirst({
        where: {
          documentId,
          medicalProductId: productId,
        },
        include: {
          medicalProduct: {
            include: { photos: true },
          },
        },
      })

      if (!documentItem) {
        throw new NotFoundException(`Product ${productId} not found in document ${documentId}`)
      }

      if (documentItem.quantity_scanned >= documentItem.quantity_expected) {
        throw new BadRequestException("Product already fully scanned")
      }

      // Increase scanned count
      const updatedItem = await tx.documentItem.update({
        where: { id: documentItem.id },
        data: {
          quantity_scanned: { increment: 1 },
        },
        include: {
          medicalProduct: {
            include: { photos: true },
          },
        },
      })

      return updatedItem
    })
  }

  // Step III A: Accept Scanned Item
  async acceptScannedItem(documentItemId: number) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.documentItem.findUnique({
        where: { id: documentItemId },
        include: { document: true, medicalProduct: true },
      })

      if (!item) throw new NotFoundException(`DocumentItem ${documentItemId} not found`)

      if (item.quantity_scanned >= item.quantity_expected) {
        throw new BadRequestException("Cannot accept: quantity scanned >= expected")
      }
      
      // Note: If validateScannedProduct was called before, scanned count is already incremented.
      // But prompt says explicitly: "update quantity_scanned += 1".
      // Assuming this is called INSTEAD of validate, or sequentially?
      // I will implement as requested (+1 scanned, +1 accepted).

      // Find or Create Batch
      // We need batch_number. Did we save it in Create? Yes, we mapped it.
      // But schema says DocumentItem.batch_number is String?.
      // If null, we can't create batch.
      if (!item.batch_number) {
        throw new BadRequestException("Item does not have a batch number linked")
      }

      // We need expiry_date.
      if (!item.expiry_date) {
        throw new BadRequestException("Item does not have expiry_date")
      }

      const batch = await this.productBatchService.findOrCreate(
        {
          productId: item.medicalProductId,
          supplierId: item.document.counterpartyId, // Supplier from Document
          batch_number: item.batch_number,
          expiry_date: item.expiry_date,
          purchase_price: Number(item.price),
        },
        tx,
      )

      const updatedItem = await tx.documentItem.update({
        where: { id: documentItemId },
        data: {
          quantity_scanned: { increment: 1 },
          quantity_accepted: { increment: 1 },
          batchId: batch.id,
        },
      })

      // Update Document scanned_at
      await tx.document.update({
        where: { id: item.documentId },
        data: { scanned_at: new Date() },
      })

      return updatedItem
    })
  }

  // Step III B: Register Discrepancy
  async registerDiscrepancy(dto: RegisterDiscrepancyDto) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.documentItem.findUnique({
        where: { id: dto.documentItemId },
      })
      if (!item) throw new NotFoundException("Item not found")

      // Update DocumentItem
      // Check limits? "need to check if quantity + scanned > expected? No, check if passed qty + scanned > scanned? No"
      // Prompt: "Check if user passed quantity which when added to quantity_scanned > quantity_scanned"?
      // "Check if user passed value which upon addition to scanned > expected"? (Likely typo in prompt "scanned > scanned").
      // Assuming check: new_scanned <= expected.

      // But discrepancy IMPLIES it's NOT accepted as normal.
      // It adds to scanned count.
      if (item.quantity_scanned + dto.quantity > item.quantity_expected) {
        // Prompt says "return error with explanation"
         throw new BadRequestException(`Cannot register discrepancy: total scanned (${item.quantity_scanned} + ${dto.quantity}) exceeds expected (${item.quantity_expected})`)
      }

      await tx.documentItem.update({
        where: { id: dto.documentItemId },
        data: {
          quantity_scanned: { increment: dto.quantity },
          is_discrepancy: true,
        },
      })

      const discrepancy = await tx.incomingDiscrepancy.create({
        data: {
          documentItemId: dto.documentItemId,
          documentId: item.documentId,
          reason: dto.reason,
          quantity: dto.quantity,
          comment: dto.comment,
          photo_url: dto.photo_url,
        },
      })

      return discrepancy
    })
  }

  // Step IV: Complete Incoming Document
  async completeIncomingDocument(documentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const document = await tx.document.findUnique({
        where: { id: documentId },
        include: { items: true },
      })
      if (!document) throw new NotFoundException("Document not found")

      // Calculate actual_total
      let actualTotal = 0
      for (const item of document.items) {
        // actual_total = sum(quantity_accepted * price)
        actualTotal += item.quantity_accepted * Number(item.price)

        // Update Inventory (if accepted > 0)
        if (item.quantity_accepted > 0) {
          if (!item.batchId) {
             throw new BadRequestException(`Item ${item.id} has accepted quantity but no batch linked`)
          }
          // Find/Create Inventory
          // We can use InventoryService or direct Prisma.
          // InventoryService methods might not take 'tx'.
          // I will use direct prisma (tx) or update InventoryService to use tx.
          // Direct prisma is easier here to pass tx.
          // Logic: Find Inventory by warehouseId (from Document) and batchId.
          const inventory = await tx.inventory.findUnique({
            where: {
              warehouseId_batchId: {
                warehouseId: document.warehouseId,
                batchId: item.batchId,
              },
            },
          })

          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantity: { increment: item.quantity_accepted } },
            })
          } else {
            await tx.inventory.create({
              data: {
                warehouseId: document.warehouseId,
                batchId: item.batchId,
                quantity: item.quantity_accepted,
              },
            })
          }
        }
      }

      // Update Document
      const updatedDoc = await tx.document.update({
        where: { id: documentId },
        data: {
          status: DocumentStatus.completed,
          actual_total: actualTotal,
          completed_at: new Date(),
        },
      })

      return updatedDoc
    })
  }

  // Step V: Create Return Document
  async createReturnDocument(originalDocumentId: number) {
    return this.prisma.$transaction(async (tx) => {
      const discrepancies = await tx.incomingDiscrepancy.findMany({
        where: { documentId: originalDocumentId },
        include: { documentItem: true },
      })

      if (!discrepancies.length) {
        throw new BadRequestException("No discrepancies found for return")
      }

      const originalDoc = await tx.document.findUnique({
        where: { id: originalDocumentId },
      })
      if (!originalDoc) throw new NotFoundException("Original document not found")

      // Create outgoing document
      const newDoc = await tx.document.create({
        data: {
          document_number: `RET-${originalDoc.document_number}-${Date.now()}`, // Generate unique number
          document_date: new Date(),
          type: DocumentType.outgoing,
          status: DocumentStatus.completed,
          
          counterparty: { connect: { id: originalDoc.counterpartyId } },
          pharmacy: { connect: { id: originalDoc.pharmacyId } }, // Assuming originalDoc has these populated or we fetch them? 
          // originalDoc is fetched with findUnique. It has scalars.
          warehouse: { connect: { id: originalDoc.warehouseId } },
          user: { connect: { id: originalDoc.userId } },
          
          completed_at: new Date(),
          items: {
            create: discrepancies.map((d) => ({
              medicalProduct: { connect: { id: d.documentItem.medicalProductId } },
              quantity_expected: d.quantity,
              quantity_accepted: d.quantity, // "quantity_accepted = discrepancy.quantity"
              batchId: d.documentItem.batchId, // "batchId (from DocumentItem)" - wait, discrepancy items might NOT have batch if rejected?
              // If rejected due to "wrong_batch", maybe no batchId linked?
              // But Prompt says "batchId (from DocumentItem)".
              // If DocumentItem.batchId is null, this will fail or be null?
              // Schema DocumentItem has batchId?
              // If Item was rejected (scanned but discrepant), batchId might be null if validation failed before batch assignment?
              // III B does NOT assign batchId. III A does.
              // So if discrepancy, batchId might be null.
              // But prompt says "batchId (from DocumentItem)".
              // I will use it if present.
              price: d.documentItem.price,
            })),
          },
        },
      })
      
      return {
        returnId: newDoc.id,
        summary: {
            totalReturnedQuantity: discrepancies.reduce((sum, d) => sum + d.quantity, 0)
        }
      }
    })
  }
}
