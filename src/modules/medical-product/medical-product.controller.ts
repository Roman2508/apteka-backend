import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Res,
  BadRequestException,
} from "@nestjs/common"
import { FilesInterceptor, FileInterceptor } from "@nestjs/platform-express"
import { Response } from "express"
import { MedicalProductService } from "./medical-product.service"
import { CreateMedicalProductDto } from "./dto/create-medical-product.dto"
import { UpdateMedicalProductDto } from "./dto/update-medical-product.dto"
import { diskStorage } from "multer"
import { extname, join } from "path"

@Controller("medical-products")
export class MedicalProductController {
  constructor(private readonly medicalProductService: MedicalProductService) {}

  @Post()
  create(@Body() createMedicalProductDto: CreateMedicalProductDto) {
    return this.medicalProductService.create(createMedicalProductDto)
  }

  @Get()
  findAll() {
    return this.medicalProductService.findAll()
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.medicalProductService.findOne(id)
  }

  @Patch(":id")
  update(@Param("id", ParseIntPipe) id: number, @Body() updateMedicalProductDto: UpdateMedicalProductDto) {
    return this.medicalProductService.update(id, updateMedicalProductDto)
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.medicalProductService.remove(id)
  }

  // Photo upload endpoint - max 10 photos
  @Post(":id/photos")
  @UseInterceptors(FilesInterceptor("photos", 10))
  async uploadPhotos(@Param("id", ParseIntPipe) id: number, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files uploaded")
    }
    return this.medicalProductService.uploadPhotos(id, files)
  }

  // Delete single photo
  @Delete(":id/photos/:photoId")
  async deletePhoto(@Param("id", ParseIntPipe) id: number, @Param("photoId", ParseIntPipe) photoId: number) {
    return this.medicalProductService.deletePhoto(id, photoId)
  }

  // Serve uploaded photos
  @Get("photos/:filename")
  servePhoto(@Param("filename") filename: string, @Res() res: Response) {
    res.sendFile(join(process.cwd(), "uploads", "products", filename))
  }

  // Excel import endpoint
  @Post("import-excel")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads/temp",
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
          cb(null, `import-${uniqueSuffix}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.mimetype === "application/vnd.ms-excel"
        ) {
          cb(null, true)
        } else {
          cb(new Error("Only Excel files are allowed!"), false)
        }
      },
    }),
  )
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file uploaded")
    }
    return this.medicalProductService.importFromExcel(file.path)
  }
}
