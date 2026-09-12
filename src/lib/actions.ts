"use server";

import { redirect } from "next/navigation";
import { getDb, hashPassword, verifyPassword, type Role, type User } from "./db";
import { createSession, destroySession, getSessionUser } from "./auth";

function back(path: string, key: "msg" | "error", text: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}${key}=${encodeURIComponent(text)}`);
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

async function me(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function signup(formData: FormData) {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  const role = str(formData, "role") as Role;
  const headline = str(formData, "headline");
  const skills = str(formData, "skills");

  if (!name || !email || password.length < 6 || !["mentor", "mentee", "company"].includes(role)) {
    back("/signup", "error", "Preencha os campos obrigatorios (senha com 6+ caracteres).");
  }

  const db = getDb();
  let id = 0;
  try {
    const res = db
      .prepare(
        "INSERT INTO users (email, password_hash, name, role, headline, skills) VALUES (?,?,?,?,?,?)"
      )
      .run(email, hashPassword(password), name, role, headline, skills);
    id = Number(res.lastInsertRowid);
  } catch {
    back("/signup", "error", "Este email ja esta cadastrado.");
  }

  await createSession(id);
  redirect("/dashboard");
}

export async function login(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  const user = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | User
    | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    back("/login", "error", "Email ou senha incorretos.");
  }
  await createSession(user!.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const user = await me();
  getDb()
    .prepare("UPDATE users SET headline = ?, bio = ?, skills = ? WHERE id = ?")
    .run(str(formData, "headline"), str(formData, "bio"), str(formData, "skills"), user.id);
  back("/dashboard", "msg", "Perfil atualizado.");
}

export async function requestMentorship(formData: FormData) {
  const user = await me();
  const mentorId = Number(formData.get("mentor_id"));
  const ret = str(formData, "return") || "/mentores";
  if (user.role !== "mentee") {
    back(ret, "error", "Apenas mentorados podem solicitar mentoria.");
  }
  if (mentorId === user.id) back(ret, "error", "Voce nao pode ser seu proprio mentor.");
  try {
    getDb()
      .prepare("INSERT INTO mentorships (mentor_id, mentee_id) VALUES (?,?)")
      .run(mentorId, user.id);
  } catch {
    back(ret, "error", "Voce ja possui uma solicitacao com este mentor.");
  }
  back(ret, "msg", "Solicitacao de mentoria enviada.");
}

export async function respondMentorship(formData: FormData) {
  const user = await me();
  if (user.role !== "mentor" && user.role !== "company") redirect("/dashboard");
  const id = Number(formData.get("id"));
  const decision = str(formData, "decision");
  const db = getDb();
  const req = db
    .prepare("SELECT id FROM mentorships WHERE id = ? AND mentor_id = ? AND status = 'pending'")
    .get(id, user.id);
  if (!req) back("/dashboard", "error", "Solicitacao nao encontrada.");
  if (decision === "accept") {
    db.prepare("UPDATE mentorships SET status = 'active' WHERE id = ?").run(id);
  } else {
    db.prepare("DELETE FROM mentorships WHERE id = ?").run(id);
  }
  back("/dashboard", "msg", decision === "accept" ? "Mentoria aceita." : "Solicitacao recusada.");
}

export async function removeMentorship(formData: FormData) {
  const user = await me();
  const id = Number(formData.get("id"));
  getDb()
    .prepare("DELETE FROM mentorships WHERE id = ? AND (mentor_id = ? OR mentee_id = ?)")
    .run(id, user.id, user.id);
  back("/dashboard", "msg", "Conexao removida.");
}

export async function addContribution(formData: FormData) {
  const user = await me();
  if (user.role !== "mentee") redirect("/dashboard");
  const title = str(formData, "title");
  if (!title) back("/dashboard", "error", "Titulo da contribuicao e obrigatorio.");
  getDb()
    .prepare(
      "INSERT INTO contributions (user_id, title, url, type, description) VALUES (?,?,?,?,?)"
    )
    .run(
      user.id,
      title,
      str(formData, "url"),
      str(formData, "type") || "projeto",
      str(formData, "description")
    );
  back("/dashboard", "msg", "Contribuicao publicada no seu perfil.");
}

export async function deleteContribution(formData: FormData) {
  const user = await me();
  getDb()
    .prepare("DELETE FROM contributions WHERE id = ? AND user_id = ?")
    .run(Number(formData.get("id")), user.id);
  back("/dashboard", "msg", "Contribuicao removida.");
}

export async function toggleEndorsement(formData: FormData) {
  const user = await me();
  const contributionId = Number(formData.get("contribution_id"));
  const ret = str(formData, "return") || "/dashboard";
  const db = getDb();
  const contribution = db
    .prepare("SELECT user_id FROM contributions WHERE id = ?")
    .get(contributionId) as { user_id: number } | undefined;
  if (!contribution) back(ret, "error", "Contribuicao nao encontrada.");
  const link = db
    .prepare(
      "SELECT id FROM mentorships WHERE mentor_id = ? AND mentee_id = ? AND status = 'active'"
    )
    .get(user.id, contribution!.user_id);
  if (!link) back(ret, "error", "Voce so pode recomendar contribuicoes da sua rede.");
  const existing = db
    .prepare("SELECT 1 FROM endorsements WHERE contribution_id = ? AND mentor_id = ?")
    .get(contributionId, user.id);
  if (existing) {
    db.prepare("DELETE FROM endorsements WHERE contribution_id = ? AND mentor_id = ?").run(
      contributionId,
      user.id
    );
  } else {
    db.prepare("INSERT INTO endorsements (contribution_id, mentor_id) VALUES (?,?)").run(
      contributionId,
      user.id
    );
  }
  redirect(ret);
}

export async function addOpportunity(formData: FormData) {
  const user = await me();
  if (user.role !== "mentor" && user.role !== "company") redirect("/dashboard");
  const title = str(formData, "title");
  const type = str(formData, "type");
  if (!title || !["open_source", "evento", "vaga"].includes(type)) {
    back("/dashboard", "error", "Preencha titulo e tipo da oportunidade.");
  }
  getDb()
    .prepare(
      "INSERT INTO opportunities (owner_id, type, title, description, skills) VALUES (?,?,?,?,?)"
    )
    .run(user.id, type, title, str(formData, "description"), str(formData, "skills"));
  back("/dashboard", "msg", "Oportunidade publicada.");
}

export async function deleteOpportunity(formData: FormData) {
  const user = await me();
  getDb()
    .prepare("DELETE FROM opportunities WHERE id = ? AND owner_id = ?")
    .run(Number(formData.get("id")), user.id);
  back("/dashboard", "msg", "Oportunidade removida.");
}
