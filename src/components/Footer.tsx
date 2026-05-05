import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => (
  <footer className="bg-foreground text-background">
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
        {/* SOBRE E REDES SOCIAIS */}
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-lg font-bold font-heading mb-4">ASPMM</h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Associação dos Servidores Públicos Municipais de Marília.
              Proporcionando lazer, esporte e cultura para nossos associados
              desde sua fundação.
            </p>
          </div>
          <div className="flex gap-6 mt-8">
            <a
              href="https://www.instagram.com/aspmmarilia/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <FaInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.facebook.com/people/Associa%C3%A7%C3%A3o-Dos-Servidores-P%C3%BAblicos-Municipais-De-Mar%C3%ADlia-Aspmm/100064044455261/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <FaFacebook className="h-5 w-5" />
            </a>
            <a
              href="https://wa.me/5514996402112"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              <FaWhatsapp className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* LINKS */}
        <div className="h-full flex flex-col justify-start md:pb-1">
          <h4 className="font-semibold font-heading mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li>
              <Link
                to="/estrutura"
                className="hover:opacity-100 transition-opacity"
              >
                Estrutura
              </Link>
            </li>
            <li>
              <Link
                to="/eventos"
                className="hover:opacity-100 transition-opacity"
              >
                Eventos
              </Link>
            </li>
            <li>
              <Link
                to="/informacoes"
                className="hover:opacity-100 transition-opacity"
              >
                Informações
              </Link>
            </li>
            <li>
              <Link
                to="/contato"
                className="hover:opacity-100 transition-opacity"
              >
                Contato
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTATO E MAPA */}
        <div>
          <h4 className="font-semibold font-heading mb-4">Contato</h4>
          <ul className="space-y-3 text-sm opacity-80 mb-6">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <a
                href="https://www.google.com/maps/dir//ASPMM+Marília"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                Avenida José da Silva Nogueira Junior, 555, Marília, SP
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a
                href="tel:14343336743"
                className="hover:text-primary transition-colors"
              >
                (14) 34333-6743
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a
                href="mailto:aspmmarilia@gmail.com"
                className="hover:text-primary transition-colors"
              >
                aspmmarilia@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Aberto 24 horas</span>
            </li>
          </ul>

          <div className="h-40 w-full rounded-lg overflow-hidden border border-background/10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.940866504222!2d-49.97341992415147!3d-22.21385411320092!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94bfd1607f0607d7%3A0x67a3bc76f5734268!2sAssocia%C3%A7%C3%A3o%20dos%20Servidores%20P%C3%BAblicos%20Municipais%20de%20Mar%C3%ADlia!5e0!3m2!1spt-BR!2sbr!4v1710000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale invert opacity-60 hover:opacity-100 hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="mt-10 pt-6 border-t border-background/20 text-center text-sm opacity-60">
        © {new Date().getFullYear()} ASPMM — Todos os direitos reservados.
        Desenvolvido por{" "}
        <a
          href="https://wa.me/5514996242035?text=Ol%C3%A1%20Geison!%20Vi%20o%20site%20da%20ASPMM%20e%20fiquei%20impressionado%20com%20o%20trabalho.%20Tenho%20interesse%20em%20desenvolver%20um%20site%20para%20mim%20tamb%C3%A9m.%20Podemos%20conversar%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold opacity-100 hover:text-primary transition-colors"
        >
          Geison Nunes
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
