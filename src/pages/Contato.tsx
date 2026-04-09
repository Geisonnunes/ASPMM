import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";

const Contato = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <section className="gradient-hero py-16">
      <div className="container text-center">
        <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">Contato</h1>
        <p className="text-primary-foreground/70 max-w-xl mx-auto">Entre em contato com a administração do clube.</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-6">Envie uma mensagem</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nome</label>
                <Input placeholder="Seu nome completo" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <Input type="email" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Mensagem</label>
                <Textarea placeholder="Escreva sua mensagem..." rows={5} />
              </div>
              <Button className="w-full gradient-hero text-primary-foreground border-0">Enviar Mensagem</Button>
            </form>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-heading text-foreground mb-6">Informações</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Endereço</p>
                  <p className="text-sm text-muted-foreground">Marília, SP — Brasil</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Telefone</p>
                  <p className="text-sm text-muted-foreground">(14) 3402-0000</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Email</p>
                  <p className="text-sm text-muted-foreground">contato@aspmm.com.br</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-lg shadow-card">
                <MessageCircle className="h-5 w-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground text-sm">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">(14) 99999-0000</p>
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

export default Contato;
