import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { RedisService } from 'src/redis/redis.service';
import { Grade } from './entities/grade.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GradesService {
  constructor(
    private readonly redisService: RedisService,

    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
  ) {}

  async create(createGradeDto: CreateGradeDto) {
    try {
      const key = createGradeDto.subject;
      const existingSubject = await this.redisService.get(key);
      if (existingSubject) {
        return 'Môn học đã tồn tại';
      } else {
        const savedgrade = await this.gradeRepository.save(createGradeDto);
        const subjectData = JSON.stringify({
          id: savedgrade.id,
          ...createGradeDto,
        });
        const ttl = 3600;
        await this.redisService.set(`Grade:${key}`, subjectData, ttl);
        return 'thêm thành công';
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async findAll() {
    try {
      const keys = await this.redisService.getAllKeys('Grade:*');
      const grades = [];

      if (!keys || keys.length === 0) {
        // Không tìm thấy môn học nào trên Redis, lấy tất cả môn học từ database
        const dbGrades = await this.gradeRepository.find();
        if (dbGrades.length === 0) {
          return 'không tìm thấy môn học nào';
        }

        // Đẩy các môn học từ database lên Redis
        for (const dbGrade of dbGrades) {
          const redisKey = `Grade:${dbGrade.subject}`;
          await this.redisService.set(redisKey, JSON.stringify(dbGrade), 3600);
          grades.push(dbGrade);
        }

        return grades;
      } else {
        for (const key of keys) {
          const gradeData = await this.redisService.get(key);
          if (gradeData) {
            grades.push(JSON.parse(gradeData));
          }
        }

        // Kiểm tra trong database để tìm môn học không có trong Redis
        const dbGrades = await this.gradeRepository.find();
        for (const dbGrade of dbGrades) {
          const gradeInRedis = grades.find((grade) => grade.id === dbGrade.id);
          if (!gradeInRedis) {
            // Đẩy môn học từ database lên Redis
            const redisKey = `Grade:${dbGrade.subject}`;
            await this.redisService.set(
              redisKey,
              JSON.stringify(dbGrade),
              3600,
            );
            grades.push(dbGrade);
          }
        }

        return grades;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(key: string) {
    try {
      const data = await this.redisService.get(key);
      if (data) {
        return JSON.parse(data);
      } else {
        // Nếu không tìm thấy trong Redis, tìm grade trong database
        const dbData = await this.gradeRepository.findOneBy({ subject: key });
        if (dbData) {
          const gradeData = JSON.stringify(dbData);
          const ttl = 3600;
          // Đẩy dữ liệu từ database lên Redis
          await this.redisService.set(`Grade:${key}`, gradeData, ttl);
          return dbData;
        } else {
          return 'không tìm thấy môn học';
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async update(subject: string, updateGradeDto: UpdateGradeDto) {
    try {
      const existingGrade = await this.redisService.get(`Grade:${subject}`);
      if (!existingGrade) {
        return `Không tìm thấy môn học ${subject}`;
      } else {
        const parsedGrade = JSON.parse(existingGrade);
        const updatedGrade = { ...parsedGrade, ...updateGradeDto };

        // Kiểm tra nếu tên mới trùng với tên môn học khác
        if (updateGradeDto.subject && updateGradeDto.subject !== subject) {
          const newSubjectGrade = await this.redisService.get(
            `Grade:${updateGradeDto.subject}`,
          );
          if (newSubjectGrade) {
            return 'Môn học đã tồn tại';
          } else {
            // Nếu tên mới khác tên cũ, xóa dữ liệu cũ và thêm dữ liệu mới trong Redis
            await this.redisService.del(`Grade:${subject}`);
            // await this.redisService.set(
            //   `Grade:${updateGradeDto.subject}`,
            //   JSON.stringify(updatedGrade),
            //   3600,
            // );
          }
        } else {
          // Cập nhật thông tin môn học trong Redis với tên hiện tại
          await this.redisService.del(`Grade:${subject}`);
          // await this.redisService.set(
          //   `Grade:${subject}`,
          //   JSON.stringify(updatedGrade),
          //   3600,
          // );
        }

        // Cập nhật thông tin môn học trong database
        await this.gradeRepository.update(parsedGrade.id, updateGradeDto);

        return `Đã cập nhật môn học ${subject}`;
      }
    } catch (error) {
      console.log(error);
      return 'Có lỗi xảy ra khi cập nhật môn học';
    }
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(`Grade:${key}`);
      const parsedGrade = JSON.parse(data);

      if (data) {
        await this.redisService.del(`Grade:${key}`); // Xóa 1 key trong Redis
        await this.gradeRepository.delete(parsedGrade); // Xóa từ database

        return `Đã xóa môn học ${key}`;
      } else {
        return `Không tìm thấy môn học ${key}`;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async removeAll() {
    try {
      const keys = await this.redisService.getAllKeys('Grade:*'); // Lấy danh sách tất cả keys
      if (keys.length === 0) {
        return 'Không tìm thấy môn học nào';
      } else {
        const gradeKeys = keys.filter((key) => key.startsWith('Grade:')); // Lọc ra các keys trong thư mục Grade
        for (const key of gradeKeys) {
          await this.redisService.del(key); // Xóa key trong Redis
        }
        // Xóa tất cả các bản ghi môn học trong cơ sở dữ liệu
        await this.gradeRepository.clear();
        return 'Các keys trong thư mục "Grade" đã được xóa';
      }
    } catch (error) {
      console.log(error);
    }
  }
}
