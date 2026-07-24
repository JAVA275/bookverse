import request from "supertest";
import { app } from "../src/app";
import { resetDb, createUserFixture, createBookFixture } from "./helpers";
import { signAccessToken } from "../src/utils/jwt";

beforeEach(async () => {
  await resetDb();
});

function authHeader(userId: string, role = "READER") {
  return `Bearer ${signAccessToken({ sub: userId, role })}`;
}

async function createOrder(userId: string, bookId: string) {
  const res = await request(app)
    .post("/api/orders")
    .set("Authorization", authHeader(userId))
    .send({ items: [{ bookId, format: "EBOOK", quantity: 1 }] });
  return res.body.order as { id: string };
}

describe("POST /api/payments/*", () => {
  it("refuse un paiement sans authentification", async () => {
    const res = await request(app).post("/api/payments/stripe/checkout").send({ orderId: "irrelevant" });
    expect(res.status).toBe(401);
  });

  it("stripe: renvoie 503 quand STRIPE_SECRET_KEY n'est pas configuré", async () => {
    const author = await createUserFixture({ email: "author-p1@bookverse.cm", role: "AUTHOR" });
    const reader = await createUserFixture({ email: "reader-p1@bookverse.cm" });
    const book = await createBookFixture(author.id);
    const order = await createOrder(reader.id, book.id);

    const res = await request(app)
      .post("/api/payments/stripe/checkout")
      .set("Authorization", authHeader(reader.id))
      .send({ orderId: order.id });

    // Sans clé Stripe configurée en environnement de test, le service doit échouer
    // proprement (503) plutôt que planter silencieusement.
    expect(res.status).toBe(503);
  });

  it("orange money: renvoie 503 quand les identifiants marchands sont absents", async () => {
    const author = await createUserFixture({ email: "author-p2@bookverse.cm", role: "AUTHOR" });
    const reader = await createUserFixture({ email: "reader-p2@bookverse.cm" });
    const book = await createBookFixture(author.id);
    const order = await createOrder(reader.id, book.id);

    const res = await request(app)
      .post("/api/payments/orange-money/initiate")
      .set("Authorization", authHeader(reader.id))
      .send({ orderId: order.id });

    expect(res.status).toBe(503);
  });

  it("mtn momo: renvoie 503 quand les identifiants API sont absents", async () => {
    const author = await createUserFixture({ email: "author-p3@bookverse.cm", role: "AUTHOR" });
    const reader = await createUserFixture({ email: "reader-p3@bookverse.cm" });
    const book = await createBookFixture(author.id);
    const order = await createOrder(reader.id, book.id);

    const res = await request(app)
      .post("/api/payments/mtn-momo/initiate")
      .set("Authorization", authHeader(reader.id))
      .send({ orderId: order.id, payerMsisdn: "+237600000000" });

    expect(res.status).toBe(503);
  });

  it("refuse de payer deux fois une commande déjà traitée", async () => {
    const author = await createUserFixture({ email: "author-p4@bookverse.cm", role: "AUTHOR" });
    const reader = await createUserFixture({ email: "reader-p4@bookverse.cm" });
    const book = await createBookFixture(author.id);
    const order = await createOrder(reader.id, book.id);

    const { prisma } = await import("../src/config/prisma");
    await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });

    const res = await request(app)
      .post("/api/payments/stripe/checkout")
      .set("Authorization", authHeader(reader.id))
      .send({ orderId: order.id });

    expect(res.status).toBe(409);
  });

  it("rejette un orderId mal formé (validation Zod)", async () => {
    const reader = await createUserFixture({ email: "reader-p5@bookverse.cm" });
    const res = await request(app)
      .post("/api/payments/stripe/checkout")
      .set("Authorization", authHeader(reader.id))
      .send({ orderId: "pas-un-uuid" });

    expect(res.status).toBe(422);
  });
});
