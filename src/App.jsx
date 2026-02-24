import { useState } from "react";
import { Eye, EyeOff, Lock, User, LogIn, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./components/ui/button";


const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!formData.username || !formData.password) {
      setError("Por favor, preencha todos os campos");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Login realizado com sucesso!");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setError(data.message || "Credenciais inválidas");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor. Tente novamente.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
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
            Sistema de Gestão<br />de Igreja
          </h2>
          <p className="text-primary-foreground/80 font-body text-lg max-w-md">
            Gerencie sua comunidade com eficiência e organização.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-yellow-200/10 ">
        <div className="w-full max-w-md space-y-8">

          {/* Logo / Brand */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500 mb-6">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Bem-vindo de volta
            </h1>
            <p className="mt-2 text-muted-foreground font-body">
              Faça login para acessar o sistema
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground font-body">
                  Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Digite seu usuário"
                    disabled={isLoading}
                    className="block w-full pl-10 pr-4 py-3 bg-yellow-200/10 border border-border rounded-xl text-foreground placeholder:text-gray-400 font-body text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary focus:bg-card disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground font-body">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    disabled={isLoading}
                    className="block w-full pl-10 pr-12 py-3 bg-yellow-200/10 border border-border rounded-xl text-foreground placeholder:text-gray-400 font-body text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary focus:bg-card disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
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
              <Button
                type="submit"
                disabled={isLoading}
                variant="hero"
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                {/* <div className="w-full border-t border-border" /> */}
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-card text-gray-400 font-body">
                  Novo por aqui?
                </span>
              </div>
            </div>

            {/* Register */}
            <div className="mt-4 text-center">
              <Link
                to="/register"
                className="text-sm font-medium text-orange-300 hover:text-orange-400 font-body transition-colors"
              >
                Criar uma conta
              </Link>
            </div>
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

export default Login;
