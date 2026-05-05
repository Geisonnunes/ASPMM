import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "*";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function gerarSenhaProvisoria(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

/**
 * Aguarda o trigger do Supabase criar o profile e então atualiza os dados.
 * Tenta até 5 vezes com 500ms de intervalo.
 */
async function atualizarProfile(
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  dados: {
    full_name: string;
    phone: string | null;
    cpf: string | null;
    must_change_password: boolean;
  },
): Promise<boolean> {
  for (let tentativa = 1; tentativa <= 5; tentativa++) {
    await delay(500);

    // Verifica se o profile já foi criado pelo trigger
    const { data: profile } = await adminClient
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      console.log(
        `[criar-associado] Profile ainda não criado, tentativa ${tentativa}/5...`,
      );
      continue;
    }

    // Profile existe — atualiza
    const { error } = await adminClient
      .from("profiles")
      .update(dados)
      .eq("id", userId);

    if (error) {
      console.error(
        `[criar-associado] Erro ao atualizar profile (tentativa ${tentativa}):`,
        error.message,
      );
      continue;
    }

    console.log(
      `[criar-associado] Profile atualizado com sucesso na tentativa ${tentativa}.`,
    );
    return true;
  }

  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Verifica o token do usuário logado
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json(
        { error: "Token não encontrado. Faça login novamente." },
        401,
      );
    }

    const {
      data: { user },
      error: userError,
    } = await adminClient.auth.getUser(
      authHeader.replace("Bearer ", "").trim(),
    );

    if (userError || !user) {
      return json({ error: "Sessão inválida. Faça login novamente." }, 401);
    }

    // Verifica se é admin via RPC has_role
    const { data: isAdmin, error: rpcError } = await adminClient.rpc(
      "has_role",
      {
        _user_id: user.id,
        _role: "admin",
      },
    );

    if (rpcError) {
      console.error(
        "[criar-associado] Erro no RPC has_role:",
        rpcError.message,
      );
      return json({ error: "Erro ao verificar permissões." }, 500);
    }

    if (!isAdmin) {
      return json(
        { error: "Acesso negado. Apenas admins podem cadastrar associados." },
        403,
      );
    }

    // Lê body
    const body = await req.json();
    const { fullName, email, phone, cpf } = body;

    if (!fullName || !email) {
      return json({ error: "Nome e e-mail são obrigatórios." }, 400);
    }

    // Verifica CPF duplicado
    const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null;
    if (cpfLimpo) {
      const { data: existing } = await adminClient
        .from("profiles")
        .select("id")
        .eq("cpf", cpfLimpo)
        .maybeSingle();
      if (existing) {
        return json({ error: "Já existe um associado com esse CPF." }, 409);
      }
    }

    // Cria usuário
    const senhaProvisoria = gerarSenhaProvisoria();

    const { data: created, error: createErr } =
      await adminClient.auth.admin.createUser({
        email,
        password: senhaProvisoria,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          must_change_password: true,
          cpf: cpfLimpo ?? null,
          phone: phone || null,
        },
      });

    if (createErr || !created?.user) {
      return json(
        { error: createErr?.message ?? "Erro ao criar usuário." },
        500,
      );
    }

    const userId = created.user.id;

    // Aguarda o trigger criar o profile e então atualiza
    const atualizado = await atualizarProfile(adminClient, userId, {
      full_name: fullName,
      phone: phone || null,
      cpf: cpfLimpo,
      must_change_password: true,
    });

    if (!atualizado) {
      console.error(
        "[criar-associado] Não foi possível atualizar o profile após 5 tentativas.",
      );
      // Retorna sucesso mesmo assim — o usuário foi criado, só o profile não foi atualizado
    }

    return json({ success: true, userId, senhaProvisoria });
  } catch (err) {
    console.error("[criar-associado] Erro inesperado:", err);
    return json({ error: "Erro interno." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}
