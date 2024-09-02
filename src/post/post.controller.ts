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
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createPost(@Body() body, @Request() req) {
    const { title, content, tags } = body;
    return this.postService.createPost(title, content, tags, req.user.id);
  }

  @Get('search')
  searchPosts(@Param('keyword') keyword: string) {
    return this.postService.findPostsByTitleOrContent(keyword);
  }

  @Get('tag/:tag')
  getPostsByTag(@Param('tag') tag: string) {
    return this.postService.findPostsByTag(tag);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updatePost(@Param('id') id: number, @Body() body, @Request() req) {
    return this.postService.updatePost(Number(id), req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deletePost(@Param('id') id: number, @Request() req) {
    return this.postService.deletePost(Number(id), req.user.id);
  }
}
