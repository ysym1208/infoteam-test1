import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  // 게시물 생성
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  createPost(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postService.createPost(
      createPostDto.title,
      createPostDto.content,
      createPostDto.tags,
      req.user.id,
    );
  }

  // 게시물 검색 (제목 또는 내용)
  @Get('search')
  searchPosts(@Param('keyword') keyword: string) {
    return this.postService.findPostsByTitleOrContent(keyword);
  }

  // 특정 태그로 게시물 검색
  @Get('tag/:tag')
  getPostsByTag(@Param('tag') tag: string) {
    return this.postService.findPostsByTag(tag);
  }

  // 게시물 수정
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Put(':id')
  updatePost(
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ) {
    return this.postService.updatePost(Number(id), req.user.id, updatePostDto);
  }

  // 게시물 삭제
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req) {
    return this.postService.deletePost(Number(id), req.user.id);
  }
}
