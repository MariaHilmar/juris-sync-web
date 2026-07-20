"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type ProcessFiltersState = {
  tribunal: string;
  classe: string;
};

type ProcessFiltersProps = {
  onApply: (filters: ProcessFiltersState) => void;
};

export function ProcessFilters({ onApply }: ProcessFiltersProps) {
  const [tribunal, setTribunal] = useState("");
  const [classe, setClasse] = useState("");

  return (
    <form
      className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        onApply({ tribunal: tribunal.trim(), classe: classe.trim() });
      }}
    >
      <Input
        label="Tribunal"
        placeholder="Ex: TJSP"
        value={tribunal}
        onChange={(event) => setTribunal(event.target.value)}
      />
      <Input
        label="Classe"
        placeholder="Ex: Procedimento Comum"
        value={classe}
        onChange={(event) => setClasse(event.target.value)}
      />
      <Button type="submit" variant="secondary">
        Filtrar
      </Button>
    </form>
  );
}
