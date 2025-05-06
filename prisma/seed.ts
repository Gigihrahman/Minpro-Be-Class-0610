import { PrismaService } from "../src/modules/prisma/prisma.service";

const prisma = new PrismaService();

async function main() {
  const user = await prisma.users.createMany({
    data: [
      {
        id: 1,
        email: "alice@prisma.io",
        fullName: "alice keren",
        password:
          "$argon2i$v=19$m=16,t=2,p=1$YWphc2Zqc2psZmpsc2Y$JWjzpR1WNqQZNuj+avurYg",
        phoneNumber: "08123456789",
        referalCode: "123456789",
        role: "ADMIN",
      },
      {
        id: 2,
        email: "yanto@mail.com",
        fullName: "yanto keren",
        password:
          "$argon2i$v=19$m=16,t=2,p=1$YWphc2Zqc2psZmpsc2Y$JWjzpR1WNqQZNuj+avurYg",
        phoneNumber: "08123456789",
        referalCode: "1234567123",
        role: "USER",
      },
      {
        id: 3,
        email: "kurniawan@mail.com",
        fullName: "kurniawan keren",
        password:
          "$argon2i$v=19$m=16,t=2,p=1$YWphc2Zqc2psZmpsc2Y$JWjzpR1WNqQZNuj+avurYg",
        phoneNumber: "08123456789",
        referalCode: "123456789",
        role: "ORGANIZER",
      },
      {
        id: 4,
        email: "kurnianto@mail.com",
        fullName: "kurnianto hebat",
        password:
          "$argon2i$v=19$m=16,t=2,p=1$YWphc2Zqc2psZmpsc2Y$JWjzpR1WNqQZNuj+avurYg",
        phoneNumber: "08123456789",
        referalCode: "123456789",
        role: "ORGANIZER",
      },
    ],
  });

  const organizer = await prisma.organizer.createMany({
    data: [
      {
        id: 1,
        userId: 3,
        name: "Pt. kurniawan hebat maju jaya",
        npwp: "1234asfas",
        phoneNumber: "085825858",
        profilePicture: "https://picsum.photos/200/300",
        norek: "1234567",
        bankName: "BCA",
      },

      {
        id: 2,
        userId: 4,
        name: "Pt. kurnianto hebat maju jaya",
        npwp: "1234asfas",
        phoneNumber: "085825858",
        profilePicture: "https://picsum.photos/200/300",
        norek: "123456125",
        bankName: "BCA",
      },
    ],
  });
  const location = await prisma.city.createMany({
    data: [
      {
        id: 1,
        name: "Jakarta",
        slug: "jakarta",
      },
      {
        id: 2,
        name: "Bandung",
        slug: "bandung",
      },
      {
        id: 3,
        name: "Surabaya",
        slug: "surabaya",
      },
      {
        id: 4,
        name: "Yogyakarta",
        slug: "yogyakarta",
      },
      {
        id: 5,
        name: "Bali",
        slug: "bali",
      },
      {
        id: 6,
        name: "Medan",
        slug: "medan",
      },
      {
        id: 7,
        name: "Makassar",
        slug: "makassar",
      },
      {
        id: 8,
        name: "Palembang",
        slug: "palembang",
      },
      {
        id: 9,
        name: "Batam",
        slug: "batam",
      },
      {
        id: 10,
        name: "Semarang",
        slug: "semarang",
      },
    ],
  });

  const categori = await prisma.categories.createMany({
    data: [
      {
        id: 1,
        name: "Music",
        slug: "music",
        iconUrl: "https://picsum.photos/200/300",
      },
      {
        id: 2,
        name: "Sport",
        slug: "sport",
        iconUrl: "https://picsum.photos/200/300",
      },
      {
        id: 3,
        name: "Art",
        slug: "art",
        iconUrl: "https://picsum.photos/200/300",
      },
      {
        id: 4,
        name: "Festival",
        slug: "festival",
        iconUrl: "https://picsum.photos/200/300",
      },
      {
        id: 5,
        name: "Exhibition",
        slug: "exhibition",
        iconUrl: "https://picsum.photos/200/300",
      },
    ],
  });

  const event = await prisma.events.createMany({
    data: [
      {
        id: 1,
        name: "Music Festival",
        description: "Music Festival event",
        startEvent: new Date("2025-05-01").toISOString(),
        endEvent: new Date("2023-10-02").toISOString(),
        cityId: 1,
        organizerId: 1,
        categoryId: 1,
        thumbnail: "https://picsum.photos/200/300",
        locationDetail: "jalan raya no1",
        slug: "music-festival",
        content: "cekckekcekkce",
      },
      {
        id: 2,
        name: "Sport Festival",
        description: "Sport Festival event",
        startEvent: new Date("2025-05-01").toISOString(),
        endEvent: new Date("2025-05-02").toISOString(),
        cityId: 1,
        organizerId: 2,
        categoryId: 2,
        thumbnail: "https://picsum.photos/200/300",
        locationDetail: "jalan raya no1",
        slug: "sport-festival",
        content: "cekckekcekkce",
      },
      {
        id: 3,
        name: "Art Festival",
        description: "Art Festival event",
        startEvent: new Date("2025-05-01").toISOString(),
        endEvent: new Date("2025-05-02").toISOString(),
        cityId: 1,
        organizerId: 1,
        categoryId: 3,
        thumbnail: "https://picsum.photos/200/300",
        locationDetail: "jalan raya no1",
        slug: "art-festival",
        content: "cekckekcekkce",
      },
      {
        id: 4,
        name: "Festival Festival",
        description: "Festival Festival event",
        startEvent: new Date("2025-05-01").toISOString(),
        endEvent: new Date("2025-05-02").toISOString(),
        cityId: 1,
        organizerId: 2,
        categoryId: 4,
        thumbnail: "https://picsum.photos/200/300",
        locationDetail: "jalan raya no1",
        slug: "festival-festival",
        content: "cekckekcekkce",
      },
      {
        id: 5,
        name: "Exhibition Festival",
        description: "Exhibition Festival event",
        startEvent: new Date("2025-05-01").toISOString(),
        endEvent: new Date("2025-05-02").toISOString(),
        cityId: 1,
        organizerId: 1,
        categoryId: 5,
        thumbnail: "https://picsum.photos/200/300",
        locationDetail: "jalan raya no1",
        slug: "exhibition-festival",
        content: "cekckekcekkce",
      },
    ],
  });
  const seat = await prisma.seats.createMany({
    data: [
      {
        id: 1,
        eventId: 1,
        name: "VIP",
        totalSeat: 100,
        price: 1000000,
        description: "VIP seat",
      },
      {
        id: 2,
        eventId: 1,
        name: "Regular",
        totalSeat: 200,
        price: 500000,
        description: "Regular seat",
      },
      {
        id: 3,
        eventId: 2,
        name: "VIP",
        totalSeat: 100,
        price: 1000000,
        description: "VIP seat",
      },
      {
        id: 4,
        eventId: 2,
        name: "Regular",
        totalSeat: 200,
        price: 500000,
        description: "Regular seat",
      },
    ],
  });

  const coupon = await prisma.coupons.createMany({
    data: [],
  });

  const vouchers = await prisma.vouchers.createMany({ data: [] });
  const referrals = await prisma.referrals.createMany({ data: [] });

  const points = await prisma.points.createMany({
    data: [],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
