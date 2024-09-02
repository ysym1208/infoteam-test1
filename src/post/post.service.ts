import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(
    title: string,
    content: string,
    tags: string[],
    authorId: number,
  ) {
    return this.prisma.post.create({
      data: {
        title,
        content,
        tags,
        authorId,
      },
    });
  }

  async findPostsByTitleOrContent(keyword: string) {
    return this.prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
    });
  }

  async findPostsByTag(tag: string) {
    return this.prisma.post.findMany({
      where: {
        tags: {
          has: tag,
        },
      },
    });
  }

  async updatePost(postId: number, userId: number, data: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (post.authorId !== userId) {
      throw new Error('You are not allowed to update this post');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
    });
  }

  async deletePost(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (post.authorId !== userId) {
      throw new Error('You are not allowed to delete this post');
    }

    return this.prisma.post.delete({
      where: { id: postId },
    });
  }
}

