import request from "supertest";
import { app } from "../src/app";
import { resetDb, createUserFixture } from "./helpers";

beforeEach(async () => {
  await resetDb();
});

describe("POST /api/auth/register", () => {
  it("crée un compte et renvoie un access token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Java Test",
      email: "java@bookverse.cm",
      password: "Password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("java@bookverse.cm");
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(typeof res.body.accessToken).toBe("string");
  });

  it("refuse un email déjà utilisé", async () => {
    await createUserFixture({ email: "dup@bookverse.cm" });

    const res = await request(app).post("/api/auth/register").send({
      name: "Doublon",
      email: "dup@bookverse.cm",
      password: "Password123",
    });

    expect(res.status).toBe(409);
  });

  it("refuse un mot de passe trop faible", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Faible",
      email: "faible@bookverse.cm",
      password: "abc",
    });

    expect(res.status).toBe(422);
  });
});

describe("POST /api/auth/login", () => {
  it("connecte un utilisateur avec les bons identifiants", async () => {
    await createUserFixture({ email: "lecteur@bookverse.cm", password: "Password123" });

    const res = await request(app).post("/api/auth/login").send({
      email: "lecteur@bookverse.cm",
      password: "Password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("lecteur@bookverse.cm");
    expect(typeof res.body.accessToken).toBe("string");
  });

  it("refuse un mauvais mot de passe", async () => {
    await createUserFixture({ email: "lecteur2@bookverse.cm", password: "Password123" });

    const res = await request(app).post("/api/auth/login").send({
      email: "lecteur2@bookverse.cm",
      password: "MauvaisMotDePasse1",
    });

    expect(res.status).toBe(401);
  });

  it("refuse un compte banni", async () => {
    const user = await createUserFixture({ email: "banni@bookverse.cm", password: "Password123" });
    const { prisma } = await import("../src/config/prisma");
    await prisma.user.update({ where: { id: user.id }, data: { isBanned: true } });

    const res = await request(app).post("/api/auth/login").send({
      email: "banni@bookverse.cm",
      password: "Password123",
    });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/auth/me", () => {
  it("refuse l'accès sans token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("renvoie le profil pour un token valide", async () => {
    await createUserFixture({ email: "me@bookverse.cm", password: "Password123" });
    const login = await request(app).post("/api/auth/login").send({
      email: "me@bookverse.cm",
      password: "Password123",
    });

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@bookverse.cm");
  });
});
