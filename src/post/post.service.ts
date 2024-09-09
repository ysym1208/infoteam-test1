import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  // 게시물 생성 시 태그도 함께 처리하는 메서드
  async createPost(
    title: string,
    content: string,
    tagNames: string[],
    authorId: number,
  ) {
    // 태그 처리: 태그가 이미 존재하면 사용, 없으면 생성
    const tags = await Promise.all(
      tagNames.map(async (name) => {
        return this.prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      }),
    );

    // 게시물 생성 및 태그 연결 (PostTag 테이블 사용)
    return this.prisma.post.create({
      data: {
        title,
        content,
        authorId,
        tags: {
          create: tags.map((tag) => ({
            tag: {
              connect: { id: tag.id },
            },
          })),
        },
      },
      include: {
        tags: true,
      },
    });
  }

  // 제목 또는 내용으로 게시물 검색
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

  // 특정 태그로 게시물 검색
  async findPostsByTag(tag: string) {
    return this.prisma.post.findMany({
      where: {
        tags: {
          some: {
            tag: {
              name: tag,
            },
          },
        },
      },
      include: { tags: { include: { tag: true } } },
    });
  }

  // 게시물 수정
  async updatePost(postId: number, userId: number, data: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (post.authorId !== userId) {
      throw new Error('You are not allowed to update this post');
    }

    // 수정된 태그 처리 로직 추가 (필요시)
    if (data.tags && data.tags.length > 0) {
      const tags = await Promise.all(
        data.tags.map(async (name: string) => {
          return this.prisma.tag.upsert({
            where: { name },
            update: {},
            create: { name },
          });
        }),
      );
      data.tags = {
        set: tags.map((tag) => ({
          tag: {
            connect: { id: tag.id },
          },
        })),
      };
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
    });
  }

  // 게시물 삭제
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
