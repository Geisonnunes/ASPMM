import { useEffect, useState } from "react";
import { FileText, Save } from "lucide-react";
import { PageHeader } from "@/components/admin-layout/PageHeader";
import { EmptyState } from "@/components/admin-shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Conteudo() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*")
        .order("key");
      setSettings(data ?? []);
      const vals: Record<string, string> = {};
      data?.forEach((s: any) => {
        vals[s.key] = s.value;
      });
      setValues(vals);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const key of Object.keys(values)) {
      await supabase
        .from("site_settings")
        .update({ value: values[key] } as any)
        .eq("key", key);
    }
    setSaving(false);
    toast.success("Configurações salvas!");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conteúdo do Site"
        description="Edite os textos e informações exibidos no site."
        action={
          <Button
            onClick={handleSave}
            disabled={saving}
            className="shadow-soft-sm"
          >
            <Save className="mr-2 h-4 w-4" />{" "}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Carregando...
        </p>
      ) : settings.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma configuração encontrada" />
      ) : (
        <Card className="border-border p-6 shadow-soft-sm space-y-5">
          {settings.map((s) => (
            <div key={s.key}>
              <Label className="capitalize">{s.key.replace(/_/g, " ")}</Label>
              {(values[s.key]?.length ?? 0) > 80 ? (
                <Textarea
                  value={values[s.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.key]: e.target.value }))
                  }
                  className="mt-1"
                  rows={3}
                />
              ) : (
                <Input
                  value={values[s.key] ?? ""}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [s.key]: e.target.value }))
                  }
                  className="mt-1"
                />
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
