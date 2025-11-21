import { PrismaClient } from "@prisma/client";
import example from "./example2.json";

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  // Create a category first
  const category = await prisma.category.upsert({
    where: { name: "设计" },
    update: {},
    create: { name: "设计" },
  });

  // Create a user first
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
    },
  });

  const chapters = example.data.outlines.reduce((res, item) => {
    item.lectures.forEach((lecture) => {
      res.push({
        title: lecture.title ?? lecture.en_title ?? "",
        cover: lecture.resource.cover_url,
        url: lecture.resource.content[0].url,
      });
    });

    return res;
  }, []);

  console.log(chapters);

  await prisma.video.create({
    data: {
      title: example.data.title,
      desc: example.data.brief,
      pic: example.data.cover_url,
      categoryId: category.id,
      authorId: user.id,
      chapter: {
        createMany: {
          data: chapters,
        },
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
