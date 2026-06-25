import { IsDefined, IsOptional, IsString } from 'class-validator';

export class CustomerDto {
  @IsString()
  @IsDefined()
  name: string;

  @IsString()
  @IsOptional()
  picture?: string;
}
