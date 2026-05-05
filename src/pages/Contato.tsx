import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contato = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Preencha todos os campos");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from<"contact_messages", { name: string; email: string; message: string }>(
        "contact_messages"
      )
      .insert({ name, email, message });
    setLoading(false);
    if (error) {
      toast.error("Erro ao enviar mensagem: " + error.message);
    } else {
      toast.success("Mensagem enviada! Entraremos em contato em breve.");
      setName("");
      setEmail("");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">
            Contato
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Entre em contato com a administração do clube.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold font-heading text-foreground mb-6">
                Envie uma mensagem
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Nome
                  </label>
                  <Input
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Mensagem
                  </label>
                  <Textarea
                    placeholder="Escreva sua mensagem..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full text-primary-foreground border-0"
                  disabled={loading}
                >
                  {loading ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-heading text-foreground mb-6">
                Informações
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Endereço
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avenida José da Silva Nogueira Junior, 555, Marília, SP
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Telefone
                    </p>
                    <p className="text-sm text-muted-foreground">
                      (14) 34333-6743
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      Email
                    </p>
                    <a
                      href="mailto:aspmmarilia@gmail.com"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      aspmmarilia@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                  <MessageCircle className="h-5 w-5 text-secondary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      WhatsApp
                    </p>
                    <a
                      href="https://wa.me/5514996402112"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      (14) 99640-2112
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Contato;
