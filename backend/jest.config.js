/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
  // Les tests d'intégration tapent une vraie base Postgres de test (voir README > tests),
  // donc on les exécute en série pour éviter les conflits de données entre fichiers.
  maxWorkers: 1,
};
