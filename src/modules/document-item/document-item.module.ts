import { Module } from '@nestjs/common';
import { DocumentItemService } from './document-item.service';
import { DocumentItemController } from './document-item.controller';

@Module({
  controllers: [DocumentItemController],
  providers: [DocumentItemService],
  imports: [],
  exports: [DocumentItemService],
})
export class DocumentItemModule {}
