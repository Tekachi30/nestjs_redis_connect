import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class GradesService {
  constructor(private readonly redisService: RedisService) {}

  async create(createGradeDto: CreateGradeDto) {
    try {
      const key = `Grade:${createGradeDto.subject}`;
      const existingSubject = await this.redisService.get(key);
      if (existingSubject) {
        return 'Môn học đã tồn tại';
      } else {
        const subjectData = JSON.stringify(createGradeDto);
        const ttl = 3600;
        await this.redisService.set(key, subjectData, ttl);
        return 'thêm thành công';
      }
    } catch (error) {
      console.log(error);
      return 'ta đã thấy lỗi fix đê';
    }
  }

  async findAll() {
    try {
      const datas = await this.redisService.getAllKeys('Grade*');
      const grades = [];
      if (!datas || datas.length === 0) {
        return 'không tìm thấy môn học nào';
      } else {
        for (const data of datas) {
          const gradeData = await this.redisService.get(data);
          if (gradeData) {
            grades.push(JSON.parse(gradeData));
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
        return 'không tìm thấy môn học';
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
        const updatedUser = { ...JSON.parse(existingGrade), ...updateGradeDto };

        // Kiểm tra nếu tên mới trùng với tên môn học khác
        if (updateGradeDto.subject && updateGradeDto.subject !== subject) {
          const newsubjectUser = await this.redisService.get(
            `Grade:${updateGradeDto.subject}`,
          );
          if (newsubjectUser) {
            return 'Môn học đã tồn tại';
          }
        } else {
          // Cập nhật thông tin môn học
          const userData = JSON.stringify(updatedUser);
          const ttl = 3600;

          // Nếu tên mới khác tên cũ, xóa dữ liệu cũ và thêm dữ liệu mới
          if (updateGradeDto.subject && updateGradeDto.subject !== subject) {
            await this.redisService.del(`Grade:${subject}`);
            await this.redisService.set(
              `Grade:${updateGradeDto.subject}`,
              userData,
              ttl,
            );
          } else {
            await this.redisService.set(`Grade:${subject}`, userData, ttl);
          }
          return `Đã cập nhật môn học ${subject}`;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async remove(key: string) {
    try {
      const data = await this.redisService.get(`Grade:${key}`);
      if (data) {
        await this.redisService.del(`Grade:${key}`); // Xóa 1 key
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
      const keys = await this.redisService.getAllKeys('Grade*'); // Lấy danh sách tất cả keys
      if (keys.length === 0) {
        return 'Không tìm thấy môn học nào';
      } else {
        const userKeys = keys.filter((key) => key.startsWith('Grade:')); // Lọc ra các keys trong thư mục user
        for (const key of userKeys) {
          await this.redisService.del(key); // Xóa key
        }
        return 'Các keys trong thư mục "Grade" đã được xóa';
      }
    } catch (error) {
      console.log(error);
    }
  }
}
