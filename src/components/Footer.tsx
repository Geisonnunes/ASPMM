import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold font-heading mb-4">ASPMM</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Associação dos Servidores Públicos Municipais de Marília. 
            Proporcionando lazer, esporte e cultura para nossos associados desde sua fundação.
          </p>
        </div>

        <div>
          <h4 className="font-semibold font-heading mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/estrutura" className="hover:opacity-100 transition-opacity">Estrutura</Link></li>
            <li><Link to="/eventos" className="hover:opacity-100 transition-opacity">Eventos</Link></li>
            <li><Link to="/regulamento" className="hover:opacity-100 transition-opacity">Regulamento</Link></li>
            <li><Link to="/contato" className="hover:opacity-100 transition-opacity">Contato</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold font-heading mb-4">Contato</h4>
          <ul className="space-y-3 text-sm opacity-80">
            <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" />Marília, SP - Brasil</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" />(14) 3402-0000</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" />contato@aspmm.com.br</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" />Seg-Dom: 8h às 22h</li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-background/20 text-center text-sm opacity-60">
        © {new Date().getFullYear()} ASPMM — Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

export default Footer;
