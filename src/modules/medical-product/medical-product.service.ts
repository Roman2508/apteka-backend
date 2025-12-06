import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateMedicalProductDto } from "./dto/create-medical-product.dto"
import { UpdateMedicalProductDto } from "./dto/update-medical-product.dto"
import * as XLSX from "xlsx"
import * as fs from "fs"
import * as path from "path"

@Injectable()
export class MedicalProductService {
  constructor(private prisma: PrismaService) {}

  async create(createMedicalProductDto: CreateMedicalProductDto) {
    return this.prisma.medicalProduct.create({
      data: createMedicalProductDto,
      include: {
        manufacturer: true,
        photos: true,
      },
    })
  }

  async findAll() {
    return this.prisma.medicalProduct.findMany({
      include: {
        manufacturer: true,
        photos: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: {
        name: "asc",
      },
    })
  }

  async findOne(id: number) {
    const product = await this.prisma.medicalProduct.findUnique({
      where: { id },
      include: {
        manufacturer: true,
        photos: {
          orderBy: { order: "asc" },
        },
        batches: {
          include: {
            supplier: true,
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundException(`Medical product with ID ${id} not found`)
    }

    return product
  }

  async update(id: number, updateMedicalProductDto: UpdateMedicalProductDto) {
    // Check if product exists
    await this.findOne(id)

    return this.prisma.medicalProduct.update({
      where: { id },
      data: updateMedicalProductDto,
      include: {
        manufacturer: true,
        photos: {
          orderBy: { order: "asc" },
        },
      },
    })
  }

  async remove(id: number) {
    // Check if product exists
    const product = await this.findOne(id)

    // Delete associated photo files
    for (const photo of product.photos) {
      const filePath = path.join(process.cwd(), photo.filePath)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    }

    return this.prisma.medicalProduct.delete({
      where: { id },
    })
  }

  async uploadPhotos(productId: number, files: Express.Multer.File[]) {
    // Check if product exists
    const product = await this.findOne(productId)

    // Check total photos count (max 10)
    const existingPhotosCount = product.photos.length
    if (existingPhotosCount + files.length > 10) {
      throw new BadRequestException(
        `Cannot upload more than 10 photos. Current: ${existingPhotosCount}, Trying to add: ${files.length}`,
      )
    }

    // Create photo records
    const photos = await Promise.all(
      files.map((file, index) =>
        this.prisma.productPhoto.create({
          data: {
            productId,
            filePath: `uploads/products/${file.filename}`,
            order: existingPhotosCount + index,
          },
        }),
      ),
    )

    return photos
  }

  async deletePhoto(productId: number, photoId: number) {
    const photo = await this.prisma.productPhoto.findFirst({
      where: { id: photoId, productId },
    })

    if (!photo) {
      throw new NotFoundException(`Photo not found`)
    }

    // Delete file
    const filePath = path.join(process.cwd(), photo.filePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete record
    await this.prisma.productPhoto.delete({
      where: { id: photoId },
    })

    return { message: "Photo deleted successfully" }
  }

  async importFromExcel(filePath: string) {
    try {
      const workbook = XLSX.readFile(filePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const data = XLSX.utils.sheet_to_json(worksheet)

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      }

      for (const row of data as any[]) {
        try {
          await this.prisma.medicalProduct.create({
            data: {
              name: row.name || row["Найменування"],
              brand_name: row.brand_name || row["Торгова марка"] || null,
              form: row.form || row["Форма"] || "tablet",
              dosage_value: row.dosage_value || row["Доза"] || null,
              dosage_unit: row.dosage_unit || row["Одиниця дози"] || "mg",
              barcode: row.barcode || row["Штрих-код"] || null,
              inn: row.inn || row["МНН"] || null,
              atc_code: row.atc_code || row["ATC"] || null,
              registration_number: row.registration_number || row["Реєстрація"] || null,
              in_national_list: row.in_national_list === true || row["Нац. перелік"] === "Так",
              in_reimbursed_program: row.in_reimbursed_program === true || row["Доступні ліки"] === "Так",
              retail_price: parseFloat(row.retail_price || row["Ціна"] || 0),
              vat_rate: parseInt(row.vat_rate || row["ПДВ"] || 7),
            },
          })
          results.success++
        } catch (error: any) {
          results.failed++
          results.errors.push(`Row ${results.success + results.failed}: ${error?.message}`)
        }
      }

      // Clean up temp file
      fs.unlinkSync(filePath)

      return results
    } catch (error: any) {
      throw new BadRequestException(`Failed to parse Excel file: ${error?.message}`)
    }
  }

  async exportToExcel() {
    const products = await this.prisma.medicalProduct.findMany({
      orderBy: { name: "asc" },
      include: { manufacturer: true },
    })

    const data = products.map((product) => ({
      ID: product.id,
      Найменування: product.name,
      "Торгова марка": product.brand_name || "",
      Форма: product.form,
      Доза: product.dosage_value || "",
      "Одиниця дози": product.dosage_unit || "",
      "Штрих-код": product.barcode || "",
      МНН: product.inn || "",
      ATC: product.atc_code || "",
      Реєстрація: product.registration_number || "",
      "Нац. перелік": product.in_national_list ? "Так" : "Ні",
      "Доступні ліки": product.in_reimbursed_program ? "Так" : "Ні",
      Ціна: product.retail_price,
      ПДВ: product.vat_rate,
      Виробник: product.manufacturer?.name || "",
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Товари")

    return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  }
}
