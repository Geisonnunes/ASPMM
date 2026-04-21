import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function gerarSenhaProvisoria(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

function getUserIdFromToken(authHeader: string): string | null {
  try {
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, content-type, x-client-info, apikey",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Extrai o caller_id do token JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const callerId = getUserIdFromToken(authHeader);

    console.log("[criar-associado] authHeader presente:", !!authHeader);
    console.log("[criar-associado] callerId:", callerId);

    // Se não tem token, verifica se é chamada interna (service role)
    if (!callerId) {
      return json(
        { error: "Token não encontrado. Faça login novamente." },
        401,
      );
    }

    // Verifica se é admin
    const { data: roleRow, error: roleErr } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();

    console.log("[criar-associado] roleRow:", JSON.stringify(roleRow));
    console.log("[criar-associado] roleErr:", roleErr?.message);

    if (!roleRow) {
      return json(
        { error: "Acesso negado. Apenas admins podem cadastrar associados." },
        403,
      );
    }

    // Lê body
    const body = await req.json();
    const { fullName, email, phone, cpf } = body;

    console.log(
      "[criar-associado] body:",
      JSON.stringify({ fullName, email, phone, cpf }),
    );

    if (!fullName || !email) {
      return json({ error: "Nome e e-mail são obrigatórios." }, 400);
    }

    // Verifica CPF duplicado
    if (cpf) {
      const cpfLimpo = cpf.replace(/\D/g, "");
      const { data: existing } = await adminClient
        .from("profiles")
        .select("id")
        .eq("cpf", cpfLimpo)
        .maybeSingle();
      if (existing) {
        return json({ error: "Já existe um associado com esse CPF." }, 409);
      }
    }

    // Gera senha e cria usuário
    const senhaProvisoria = gerarSenhaProvisoria();

    const { data: created, error: createErr } =
      await adminClient.auth.admin.createUser({
        email,
        password: senhaProvisoria,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createErr || !created?.user) {
      console.error("[criar-associado] createErr:", createErr?.message);
      return json(
        { error: createErr?.message ?? "Erro ao criar usuário." },
        500,
      );
    }

    const userId = created.user.id;
    console.log("[criar-associado] usuário criado:", userId);

    // Atualiza profile
    const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null;
    await adminClient
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        cpf: cpfLimpo,
        must_change_password: true,
      })
      .eq("id", userId);

    return json({ success: true, userId, senhaProvisoria });
  } catch (err) {
    console.error("[criar-associado] Erro inesperado:", err);
    return json({ error: "Erro interno: " + String(err) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
