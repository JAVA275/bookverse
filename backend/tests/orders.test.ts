import request from "supertest";
import { app } from "../src/app";
import { resetDb, createUserFixture, createBookFixture } from "./helpers";
import { signAccessToken } from "../src/utils/jwt";

beforeEach(async () => {
  await resetDb();
});

async function authHeader(userId: string, role = "READER") {
  const token = signAccessToken({ sub: userId, role });
  return `Bearer ${token}`;
}

describe("POST /api/orders", () => {
  it("refuse une commande sans authentification", async () => {
    const res = await request(app).post("/api/orders").send({ items: [] });
    expect(res.status).toBe(401);
  });

  it("refuse un panier vide", async () => {
    const reader = await createUserFixture({ email: "reader1@bookverse.cm" });
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", await authHeader(reader.id))
      .send({ items: [] });

    expect(res.status).toBe(422); // validation Zod: items.min(1)
  });

  it("crée une commande à partir du panier et calcule le total", async () => {
    const author = await createUserFixture({ email: "author1@bookverse.cm", role: "AUTHOR" });
    const reader = await createUserFixture({ email: "reader2@bookverse.cm" });
    const book = await createBookFixture(author.id, { priceEbookFcfa: 2500 });

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", await authHeader(reader.id))
      .send({ items: [{ bookId: book.id, format: "EBOOK", quantity: 2 }] });

    expect(res.status).toBe(201);
    expect(res.body.order.totalAmountFcfa).toBe(5000);
    expect(res.body.order.status).toBe("PENDING");
    expect(res.body.order.items).toHaveLength(1);
  });

  it("refuse un livre inexistant", async () => {
    const reader = await createUserFixture({ email: "reader3@bookverse.cm" });
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", await authHeader(reader.id))
      .send({ items: [{ bookId: "00000000-0000-0000-0000-000000000000", format: "EBOOK", quantity: 1 }] });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/orders/:id", () => {
  it("empêche un autre utilisateur de voir la commande", async () => {
    const author = await createUserFixture({ email: "author2@bookverse.cm", role: "AUTHOR" });
    const owner = await createUserFixture({ email: "owner@bookverse.cm" });
    const intruder = await createUserFixture({ email: "intruder@bookverse.cm" });
    const book = await createBookFixture(author.id);

    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", await authHeader(owner.id))
      .send({ items: [{ bookId: book.id, format: "EBOOK", quantity: 1 }] });

    const res = await request(app)
      .get(`/api/orders/${created.body.order.id}`)
      .set("Authorization", await authHeader(intruder.id));

    expect(res.status).toBe(403);
  });

  it("autorise un admin à consulter n'importe quelle commande", async () => {
    const author = await createUserFixture({ email: "author3@bookverse.cm", role: "AUTHOR" });
    const owner = await createUserFixture({ email: "owner2@bookverse.cm" });
    const admin = await createUserFixture({ email: "admin1@bookverse.cm", role: "ADMIN" });
    const book = await createBookFixture(author.id);

    const created = await request(app)
      .post("/api/orders")
      .set("Authorization", await authHeader(owner.id))
      .send({ items: [{ bookId: book.id, format: "EBOOK", quantity: 1 }] });

    const res = await request(app)
      .get(`/api/orders/${created.body.order.id}`)
      .set("Authorization", await authHeader(admin.id, "ADMIN"));

    expect(res.status).toBe(200);
  });
});

describe("GET /api/orders/mine", () => {
  it("ne renvoie que les commandes de l'utilisateur connecté", async () => {
    const author = await createUserFixture({ email: "author4@bookverse.cm", role: "AUTHOR" });
    const userA = await createUserFixture({ email: "userA@bookverse.cm" });
    const userB = await createUserFixture({ email: "userB@bookverse.cm" });
    const book = await createBookFixture(author.id);

    await request(app)
      .post("/api/orders")
      .set("Authorization", await authHeader(userA.id))
      .send({ items: [{ bookId: book.id, format: "EBOOK", quantity: 1 }] });

    const res = await request(app).get("/api/orders/mine").set("Authorization", await authHeader(userB.id));

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });
});
