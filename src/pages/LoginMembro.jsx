import { useState } from "react";
import { Hash, LogIn, Loader2, Calendar } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const MemberLogin = () => {
    const navigate = useNavigate();

    const [codigo, setCodigo] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!codigo.trim() || !dataNascimento) {
            setError("Por favor, preencha todos os campos.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("https://iicgp-backend-cms.onrender.com/auth/login-membro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codigo: codigo.trim(), data_nascimento: dataNascimento }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Código ou data de nascimento incorrectos.");
                return;
            }

            sessionStorage.setItem("membro_token", data.token);
            sessionStorage.setItem("membro_logado", JSON.stringify(data.membro));
            setSuccess("Login realizado com sucesso!");
            setTimeout(() => navigate("/dashboard/users"), 1000);
        } catch (err) {
            setError("Erro ao conectar com o servidor. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">

            {/* Left Column - Hero Image */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <img
                    src="/church.jpg"
                    alt="Igreja"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
                    <h2 className="font-heading text-4xl font-bold text-primary-foreground leading-tight mb-4">
                        Portal do Membro<br />IICGP
                    </h2>
                    <p className="text-primary-foreground/80 font-body text-lg max-w-md">
                        Acede ao teu perfil e ficha de membro.
                    </p>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-yellow-200/10">
                <div className="w-full max-w-md space-y-8">

                    {/* Brand */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500 mb-6">
                            <LogIn className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-heading text-3xl font-bold text-foreground">
                            Área do Membro
                        </h1>
                        <p className="mt-2 text-muted-foreground font-body">
                            Insere o teu código e data de nascimento
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Código */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground font-body">
                                    Código de Membro
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Hash className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={codigo}
                                        onChange={(e) => { setCodigo(e.target.value.toUpperCase()); setError(""); }}
                                        placeholder="ex: M001"
                                        disabled={loading}
                                        className="block w-full pl-10 pr-4 py-3 bg-yellow-200/10 border border-border rounded-xl text-foreground placeholder:text-gray-400 font-body text-sm tracking-widest uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary focus:bg-card disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Data de Nascimento */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-foreground font-body">
                                    Data de Nascimento
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="date"
                                        value={dataNascimento}
                                        onChange={(e) => { setDataNascimento(e.target.value); setError(""); }}
                                        disabled={loading}
                                        className="block w-full pl-10 pr-4 py-3 bg-yellow-200/10 border border-border rounded-xl text-foreground font-body text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary focus:bg-card disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-xl">
                                    <p className="text-sm text-destructive font-body">{error}</p>
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="bg-green-100 border border-green-300 p-3.5 rounded-xl">
                                    <p className="text-sm text-green-700 font-body">{success}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin h-4 w-4" />
                                        A verificar...
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="h-4 w-4" />
                                        Entrar
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        {/* <div className="mt-6 flex justify-center">
              <span className="text-xs text-gray-400 font-body">
                És administrador?
              </span>
            </div> */}

                        {/* Link admin */}
                        {/* <div className="mt-3 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-orange-300 hover:text-orange-400 font-body transition-colors"
              >
                Aceder ao painel de administração
              </Link>
            </div> */}
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-400 font-body">
                        © 2026 Sistema GDM. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MemberLogin;