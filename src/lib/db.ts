import { DatabaseSync } from "node:sqlite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type Role = "mentor" | "mentee" | "company";

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: Role;
  headline: string;
  bio: string;
  skills: string;
  created_at: string;
}

export interface Mentorship {
  id: number;
  mentor_id: number;
  mentee_id: number;
  status: "pending" | "active";
  created_at: string;
}

export interface Contribution {
  id: number;
  user_id: number;
  title: string;
  url: string;
  type: string;
  description: string;
  created_at: string;
}

export interface Opportunity {
  id: number;
  owner_id: number;
  type: "open_source" | "evento" | "vaga";
  title: string;
  description: string;
  skills: string;
  created_at: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('mentor','mentee','company')),
  headline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS mentorships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(mentor_id, mentee_id)
);
CREATE TABLE IF NOT EXISTS contributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'projeto',
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS endorsements (
  contribution_id INTEGER NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
  mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (contribution_id, mentor_id)
);
CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('open_source','evento','vaga')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  skills TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, KEYLEN).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, KEYLEN);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (_db) return _db;
  const dbPath =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "ponte.db");
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  _db = db;
  seedIfEmpty(db);
  return db;
}

export function getUser(id: number): User | null {
  const row = getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
  return row ?? null;
}

function seedIfEmpty(db: DatabaseSync) {
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM users").get() as {
    n: number;
  };
  if (n > 0) return;

  const pw = hashPassword("senha123");
  const insertUser = db.prepare(
    "INSERT INTO users (email, password_hash, name, role, headline, bio, skills) VALUES (?,?,?,?,?,?,?)"
  );
  const insertMentorship = db.prepare(
    "INSERT INTO mentorships (mentor_id, mentee_id, status) VALUES (?,?,?)"
  );
  const insertContribution = db.prepare(
    "INSERT INTO contributions (user_id, title, url, type, description) VALUES (?,?,?,?,?)"
  );
  const insertEndorsement = db.prepare(
    "INSERT INTO endorsements (contribution_id, mentor_id) VALUES (?,?)"
  );
  const insertOpportunity = db.prepare(
    "INSERT INTO opportunities (owner_id, type, title, description, skills) VALUES (?,?,?,?,?)"
  );

  const ana = Number(
    insertUser.run(
      "ana@ponte.dev", pw, "Ana Souza", "mentor",
      "Engenheira de software senior - 15 anos de estrada",
      "Construi sistemas de pagamento e plataformas em escala. Mentoro pessoas em transicao para desenvolvimento e quem busca a primeira vaga.",
      "Backend, Node.js, Arquitetura, Carreira, Entrevistas"
    ).lastInsertRowid
  );
  const carlos = Number(
    insertUser.run(
      "carlos@ponte.dev", pw, "Carlos Lima", "mentor",
      "Cientista de dados - ex-big tech",
      "Apaixonado por ensinar estatistica aplicada e machine learning do zero. Ajudo a montar portfolio de dados.",
      "Python, Machine Learning, SQL, Portfolio"
    ).lastInsertRowid
  );
  const rita = Number(
    insertUser.run(
      "rita@ponte.dev", pw, "Rita Fernandes", "mentor",
      "Head de Produto",
      "De QA a lideranca de produto. Mentoro quem quer entrar em produto, UX ou gestao.",
      "Produto, UX, Discovery, Lideranca"
    ).lastInsertRowid
  );
  const techcorp = Number(
    insertUser.run(
      "contato@techcorp.dev", pw, "TechCorp", "company",
      "Startup de tecnologia - programa de formacao proprio",
      "Mentoramos e formamos talentos juniores dentro dos nossos projetos reais.",
      "Programa de formacao, Estagio, Junior"
    ).lastInsertRowid
  );
  const joao = Number(
    insertUser.run(
      "joao@email.com", pw, "Joao Pedro", "mentee",
      "Em transicao para desenvolvimento web",
      "Ex-professor aprendendo a programar. Buscando primeira oportunidade como dev junior.",
      "JavaScript, React, HTML, CSS"
    ).lastInsertRowid
  );
  const maria = Number(
    insertUser.run(
      "maria@email.com", pw, "Maria Clara", "mentee",
      "Estudante de ADS - buscando primeiro emprego",
      "2o semestre de Analise e Desenvolvimento de Sistemas. Gosto de dados e automacao.",
      "Python, SQL, Git"
    ).lastInsertRowid
  );
  const pedro = Number(
    insertUser.run(
      "pedro@email.com", pw, "Pedro Santos", "mentee",
      "42 anos - migrando de vendas para dados",
      "15 anos em vendas, agora estudando analise de dados. Experiencia de negocio + ferramentas novas.",
      "Excel, SQL, Python, Power BI"
    ).lastInsertRowid
  );

  insertMentorship.run(ana, joao, "active");
  insertMentorship.run(ana, maria, "active");
  insertMentorship.run(carlos, maria, "active");
  insertMentorship.run(rita, joao, "pending");
  insertMentorship.run(techcorp, pedro, "active");

  const c1 = Number(
    insertContribution.run(
      joao, "PR aceito no repositorio open-source 'dev-brasil-docs'",
      "https://github.com", "open_source",
      "Corrigi e traduzi a documentacao de contribuicao do projeto."
    ).lastInsertRowid
  );
  insertContribution.run(
    joao, "Clone da landing page de um e-commerce",
    "https://github.com", "projeto",
    "Reproduzi uma landing page real usando apenas HTML, CSS e um pouco de JS."
  );
  const c2 = Number(
    insertContribution.run(
      maria, "Analise exploratoria do dataset 'Desmatamento na Amazonia'",
      "https://github.com", "projeto",
      "Notebook com limpeza de dados, graficos e insights sobre series historicas."
    ).lastInsertRowid
  );
  insertContribution.run(
    maria, "Lightning talk no meetup PyLadies",
    "", "evento",
    "Apresentei 10 minutos sobre web scraping etico para uma plateia de 80 pessoas."
  );
  const c3 = Number(
    insertContribution.run(
      pedro, "Dashboard de pipeline de vendas em Power BI",
      "", "projeto",
      "Automatizei o relatorio mensal da equipe com dados do CRM exportados via SQL."
    ).lastInsertRowid
  );

  insertEndorsement.run(c1, ana);
  insertEndorsement.run(c2, carlos);
  insertEndorsement.run(c3, techcorp);

  insertOpportunity.run(
    techcorp, "vaga", "Programa de Formacao TechCorp 2026",
    "6 meses de formacao remunerada para devs juniores dentro dos nossos times. Mentoria dedicada e projeto real no final.",
    "Logica, Git, Vontade de aprender"
  );
  insertOpportunity.run(
    ana, "open_source", "Contribuidores para o Ponte (este projeto!)",
    "A plataforma e open source. Procuramos contribuidores de todos os niveis - otima primeira contribuicao.",
    "TypeScript, Next.js, SQLite"
  );
  insertOpportunity.run(
    rita, "evento", "Workshop: discovery de produto na pratica",
    "Workshop gratuito de 3h. Vamos descobrir um produto do zero em grupo. Aberto a mentorados e mentores.",
    "Produto, UX, Curiosidade"
  );
}
