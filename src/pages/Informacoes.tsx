import { useEffect, useState } from "react";
import { HelpCircle, ScrollText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

interface InfoSettings {
  show_faq: boolean;
  show_regulamento: boolean;
  regulamento_content: string | null;
}

const defaultRegulamento = [
  {
    title: "1. Dos Associados",
    content:
      "Podem ser associados os servidores públicos municipais de Marília, ativos ou aposentados, que estejam em dia com suas obrigações junto à Associação. A inscrição deve ser feita pessoalmente na sede do clube, mediante apresentação de documentos e comprovante de vínculo funcional.",
  },
  {
    title: "2. Dos Dependentes",
    content:
      "São considerados dependentes o cônjuge, companheiro(a), filhos até 21 anos (ou até 24 se universitários) e pais que comprovem dependência econômica. Todos devem ser cadastrados junto à secretaria.",
  },
  {
    title: "3. Das Mensalidades",
    content:
      "O associado deverá manter suas mensalidades em dia. O atraso superior a 3 meses resulta na suspensão do acesso ao clube. A regularização pode ser feita na secretaria administrativa.",
  },
  {
    title: "4. Do Uso dos Espaços",
    content:
      "Os espaços do clube devem ser utilizados com respeito e zelo. Reservas devem ser feitas com antecedência mínima de 48 horas. O associado é responsável pelos danos causados durante o uso.",
  },
  {
    title: "5. Dos Eventos",
    content:
      "Os eventos promovidos pela ASPMM são prioritariamente destinados aos associados e seus dependentes. Convidados devem ser previamente cadastrados e são de responsabilidade do associado que os convidou.",
  },
  {
    title: "6. Da Piscina",
    content:
      "O uso da piscina requer touca e traje adequado. Crianças menores de 12 anos devem estar acompanhadas por um responsável. É proibido o uso de alimentos e bebidas de vidro na área da piscina.",
  },
  {
    title: "7. Das Proibições",
    content:
      "É proibido o uso de som automotivo nas dependências do clube, a entrada de animais, o consumo excessivo de bebidas alcoólicas e qualquer forma de discriminação ou comportamento inadequado.",
  },
];

const Informacoes = () => {
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [settings, setSettings] = useState<InfoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [openItem, setOpenItem] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: faqData }, { data: settingsData }] = await Promise.all([
        supabase
          .from("faq")
          .select("*")
          .eq("is_active", true)
          .order("order_index"),
        supabase.from("info_settings").select("*").limit(1).single(),
      ]);
      setFaq(faqData ?? []);
      setSettings(
        settingsData ?? {
          show_faq: true,
          show_regulamento: true,
          regulamento_content: null,
        },
      );
      setLoading(false);
    };
    load();
  }, []);

  const showFaq = settings?.show_faq ?? true;
  const showReg = settings?.show_regulamento ?? true;

  // Define aba padrão
  const defaultTab = showFaq ? "faq" : "regulamento";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-hero py-16">
        <div className="container text-center">
          <h1 className="text-4xl font-extrabold font-heading text-primary-foreground mb-2">
            Informações
          </h1>
          <p className="text-primary-foreground/70 max-w-xl mx-auto">
            Tire suas dúvidas e conheça as regras do clube.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          {loading ? (
            <p className="text-center text-muted-foreground py-12">
              Carregando...
            </p>
          ) : (
            <>
              {/* Se apenas um está ativo, exibe direto sem abas */}
              {showFaq && !showReg && (
                <FaqSection
                  faq={faq}
                  openItem={openItem}
                  setOpenItem={setOpenItem}
                />
              )}

              {showReg && !showFaq && (
                <RegulamentoSection
                  content={settings?.regulamento_content ?? null}
                />
              )}

              {/* Se os dois estão ativos, exibe abas */}
              {showFaq && showReg && (
                <Tabs defaultValue={defaultTab}>
                  <TabsList className="mb-8">
                    <TabsTrigger value="faq" className="gap-2">
                      <HelpCircle className="h-4 w-4" /> Perguntas Frequentes
                    </TabsTrigger>
                    <TabsTrigger value="regulamento" className="gap-2">
                      <ScrollText className="h-4 w-4" /> Regulamento
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="faq">
                    <FaqSection
                      faq={faq}
                      openItem={openItem}
                      setOpenItem={setOpenItem}
                    />
                  </TabsContent>
                  <TabsContent value="regulamento">
                    <RegulamentoSection
                      content={settings?.regulamento_content ?? null}
                    />
                  </TabsContent>
                </Tabs>
              )}

              {!showFaq && !showReg && (
                <p className="text-center text-muted-foreground py-12">
                  Nenhuma informação disponível no momento.
                </p>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

// ─── FAQ ─────────────────────────────────────────────────────────────────────
const FaqSection = ({
  faq,
  openItem,
  setOpenItem,
}: {
  faq: FaqItem[];
  openItem: string | null;
  setOpenItem: (id: string | null) => void;
}) => {
  if (faq.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nenhuma pergunta disponível.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold font-heading text-foreground">
          Perguntas Frequentes
        </h2>
      </div>
      {faq.map((item) => {
        const isOpen = openItem === item.id;
        return (
          <div
            key={item.id}
            className={`rounded-lg shadow-card overflow-hidden border transition-all duration-300 ${
              isOpen
                ? "border-primary/30 bg-primary/5 shadow-elevated"
                : "border-transparent bg-card hover:border-primary/20 hover:bg-primary/[0.03] hover:shadow-elevated"
            }`}
          >
            <button
              className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 group"
              onClick={() => setOpenItem(isOpen ? null : item.id)}
            >
              <span
                className={`text-sm font-semibold font-heading transition-colors duration-200 ${
                  isOpen
                    ? "text-primary"
                    : "text-foreground group-hover:text-primary"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`shrink-0 h-6 w-6 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                  isOpen
                    ? "bg-primary text-primary-foreground rotate-45"
                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-5">
                <div className="h-px bg-primary/10 mb-4" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── REGULAMENTO ─────────────────────────────────────────────────────────────
const RegulamentoSection = ({ content }: { content: string | null }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3 mb-6">
      <ScrollText className="h-6 w-6 text-primary" />
      <h2 className="text-2xl font-bold font-heading text-foreground">
        Regulamento Interno — ASPMM
      </h2>
    </div>
    {content ? (
      <div className="bg-card rounded-lg p-6 shadow-card">
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>
    ) : (
      defaultRegulamento.map((s) => (
        <div key={s.title} className="bg-card rounded-lg p-6 shadow-card">
          <h3 className="text-lg font-semibold font-heading text-foreground mb-2">
            {s.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {s.content}
          </p>
        </div>
      ))
    )}
  </div>
);

export default Informacoes;
