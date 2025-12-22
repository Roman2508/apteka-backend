import { join } from "path"
import { NestFactory } from "@nestjs/core"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { NestExpressApplication } from "@nestjs/platform-express"

import { CoreModule } from "./core/core.module"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(CoreModule)

  // Serve static files from uploads folder
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads/" })

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Apteka Workstation")
    .setDescription("API for Apteka Workstation")
    .setVersion("1.0")
    .addTag("Apteka Workstation")
    .build()

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("api", app, swaggerDocument, {
    swaggerOptions: { persistAuthorization: true },
  })

  // Enable CORS for frontend // http tunnel - loclx
  // app.enableCors({
  //   origin: [...process.env.ALLOWED_ORIGINS.split(",")],
  //   credentials: true,
  // })

  app.enableCors({ origin: true, credentials: true })

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))

  const port = process.env.APP_PORT || 7777

  try {
    await app.listen(port)
    console.log(`🚀 Server is running at port: ${port}`)
  } catch (error: any) {
    console.error(`❌ Failed to start server: ${error.message}`, error)
    process.exit(1)
  }
}

bootstrap()
