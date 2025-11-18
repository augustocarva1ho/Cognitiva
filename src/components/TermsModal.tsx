"use client";
import { useEffect, useState } from "react";

export default function TermsModal() {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<"terms" | "privacy" | "onlyterms">("terms");

  // --- Funções globais para footer ---
  useEffect(() => {
    // @ts-ignore
    window.openTerms = () => {
      setType("terms");
      setVisible(true);
    };

    // @ts-ignore
    window.openOnlyTerms = () => {
        setType("onlyterms");
        setVisible(true);
    }

    // @ts-ignore
    window.openPrivacy = () => {
      setType("privacy");
      setVisible(true);
    };
  }, []);

  // --- Abre automaticamente ao carregar ---
  useEffect(() => {
    setVisible(true); // mostra primeiro os Termos
    setType("terms");
  }, []);

  const accept = () => {
    if(type === "onlyterms"){
        setVisible(false); 
    }else if (type === "terms") {
      // Após aceitar termos → abre política
      setType("privacy");
      setVisible(true);
    
    }  else {
      // Após aceitar política → fecha
      setVisible(false);
    }
  };

  if (!visible) return null;

  // --- Título dinâmico ---
  const getTitle = () => {
    if (type === "terms" || type === "onlyterms") return "Termos de Uso";
    return "Política de Privacidade";
  };

  // --- Conteúdo dinâmico ---
  const getText = () => {
    if (type === "terms" || type === "onlyterms") {
      return "Aqui ficam os termos de uso...";
    }
    return "Aqui fica a política de privacidade...";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 max-w-md rounded-xl shadow-lg">
        <h2 className="text-xl font-bold">{getTitle()}</h2>

        <p className="mt-4 text-gray-700">{getText()}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={accept}
            className="px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Aceito
          </button>
        </div>
      </div>
    </div>
  );
}
