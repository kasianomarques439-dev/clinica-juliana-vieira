import { createServerClient } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

export async function middleware(
  request: NextRequest
) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value
              );
            }
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
                name,
                value,
                options
              );
            }
          );
        },
      },
    }
  );

  /*
   * ==========================================================
   * 1. CONFIRMA A SESSÃO DIRETAMENTE COM O SUPABASE
   * ==========================================================
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname =
    request.nextUrl.pathname;

  const isAdminRoute =
    pathname.startsWith("/admin");

  const isLoginRoute =
    pathname.startsWith(
      "/admin/login"
    );

  /*
   * ==========================================================
   * 2. DESCOBRE SE O USUÁRIO REALMENTE É ADMIN
   * ==========================================================
   *
   * Estar autenticado não é suficiente.
   *
   * Também precisa existir em:
   *
   * public.profiles
   *
   * com:
   *
   * role = "admin"
   * ==========================================================
   */

  let isAdmin = false;

  if (user) {
    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Erro ao verificar perfil administrativo:",
        profileError
      );
    }

    isAdmin =
      profile?.role === "admin";
  }

  /*
   * ==========================================================
   * 3. NÃO ESTÁ LOGADO
   * ==========================================================
   */

  if (
    isAdminRoute &&
    !isLoginRoute &&
    !user
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      "/admin/login";

    url.search = "";

    return NextResponse.redirect(
      url
    );
  }

  /*
   * ==========================================================
   * 4. ESTÁ LOGADO, MAS NÃO É ADMIN
   * ==========================================================
   *
   * Mesmo que alguém consiga criar uma conta ou obter
   * uma sessão válida, não poderá entrar no painel.
   * ==========================================================
   */

  if (
    isAdminRoute &&
    !isLoginRoute &&
    user &&
    !isAdmin
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      "/admin/login";

    url.searchParams.set(
      "error",
      "unauthorized"
    );

    return NextResponse.redirect(
      url
    );
  }

  /*
   * ==========================================================
   * 5. ADMIN JÁ LOGADO ABRINDO /admin/login
   * ==========================================================
   */

  if (
    isLoginRoute &&
    user &&
    isAdmin
  ) {
    const url =
      request.nextUrl.clone();

    url.pathname =
      "/admin";

    url.search = "";

    return NextResponse.redirect(
      url
    );
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};