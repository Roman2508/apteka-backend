import { PartialType } from '@nestjs/mapped-types';
import { CreateDocumentItemDto } from './create-document-item.dto';

export class UpdateDocumentItemDto extends PartialType(CreateDocumentItemDto) {}
