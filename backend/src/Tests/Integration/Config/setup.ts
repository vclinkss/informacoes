// Configuracao global para testes de integracao
// Configure banco de dados de teste, variáveis de ambiente, etc.

process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://user:password@localhost:5432/test_db";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_EXPIRES_IN = "1d";
