import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ScrollText } from "lucide-react";

const sections = [
  { title: "1. Dos Associados", content: "Podem ser associados os servidores públicos municipais de Marília, ativos ou aposentados, que estejam em dia com suas obrigações junto à Associação. A inscrição deve ser feita pessoalmente na sede do clube, mediante apresentação de documentos e comprovante de vínculo funcional." },
  { title: "2. Dos Dependentes", content: "São considerados dependentes o cônjuge, companheiro(a), filhos até 21 anos (ou até 24 se universitários) e pais que comprovem dependência econômica. Todos devem ser cadastrados junto à secretaria." },
  { title: "3. Das Mensalidades", content: "O associado deverá manter suas mensalidades em dia. O atraso superior a 3 meses resulta na suspensão do acesso ao clube. A regularização pode ser feita na secretaria administrativa." },
  { title: "4. Do Uso dos Espaços", content: "Os espaços do clube devem ser utilizados com respeito e zelo. Reservas devem ser feitas com antecedência mínima de 48 horas. O associado é responsável pelos danos causados durante o uso." },
  { title: "5. Dos Eventos", content: "Os eventos promovidos pela ASPMM são prioritariamente destinados aos associados e seus dependentes. Convidados devem ser previamente cadastrados e são de responsabilidade do associado que os convidou." },
  { title: "6. Da Piscina", content: "O uso da piscina requer touca e traje adequado. Crianças menores de 12 anos devem estar acompanhadas por um responsável. É proibido o uso de alimentos e bebidas de vidro na área da piscina." },
  { title: "7. Das Proibições", content: "É proibido o uso de som automotivo nas dependências do clube, a entrada de animais, o consumo excessivo de bebidas alcoólicas e qualquer forma de discriminação ou comportamento inadequado." },
];

const Regulamento = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <section className="gradient-hero py-16">
      <div className="container text-center">
        <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">Regulamento</h1>
        <p className="text-primary-foreground/70 max-w-xl mx-auto">Regras e normas para uso do clube.</p>
      </div>
    </section>
    <section className="py-16">
      <div className="container max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <ScrollText className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold font-heading text-foreground">Regulamento Interno — ASPMM</h2>
        </div>
        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="bg-card rounded-lg p-6 shadow-card">
              <h3 className="text-lg font-semibold font-heading text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);

export default Regulamento;
