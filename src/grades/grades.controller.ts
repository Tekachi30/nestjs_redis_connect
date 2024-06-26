import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { CustomValidationPipe } from 'src/assist/pipe/custom-validation.pipe';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(CustomValidationPipe)
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  findAll() {
    return this.gradesService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.gradesService.findOne(key);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(key, updateGradeDto);
  }

  @Delete(':key')
  remove(@Param('key') key: string) {
    return this.gradesService.remove(key);
  }

  @Delete()
  removeAll() {
    return this.gradesService.removeAll();
  }
}
