import { tool } from "@langchain/core/tools";
import { z } from "zod";

const apiUrl = process.env.REMESSAI_API_URL;
const apiKey = process.env.REMESSAI_API_KEY;

export const validateIrpfTool = tool(
  async ({ fileBase64 }: { fileBase64?: string }) => {
    try {
      if (!fileBase64) {
        return JSON.stringify({
          success: false,
          error:
            "Arquivo PDF não fornecido. Por favor, anexe o documento IRPF em PDF.",
        });
      }

      const buffer = Buffer.from(fileBase64, "base64");

      const formData = new FormData();
      const blob = new Blob([buffer], { type: "application/pdf" });
      formData.append("irpf", blob, "irpf.pdf");

      if (!apiUrl || !apiKey) {
        return JSON.stringify({
          success: false,
          error:
            "Configuração da API não encontrada. Verifique as variáveis de ambiente REMESSAI_API_URL e REMESSAI_API_KEY.",
        });
      }

      const response = await fetch(`${apiUrl}/api/documents/process/irpf`, {
        method: "POST",
        headers: {
          Authorization: apiKey,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        return JSON.stringify({
          success: false,
          error: result.message || "Erro ao validar IRPF",
          details: result,
        });
      }

      return JSON.stringify({
        success: true,
        message: "IRPF validado com sucesso!",
        data: result,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao validar IRPF",
      });
    }
  },
  {
    name: "validate_irpf",
    description:
      "Valida um documento de IRPF (Imposto de Renda Pessoa Física). Use esta ferramenta quando o usuário fornecer um documento IRPF em PDF. O arquivo será automaticamente injetado pelo sistema, você não precisa fornecer o fileBase64.",
    schema: z.object({
      fileBase64: z
        .string()
        .optional()
        .describe(
          "O arquivo PDF do IRPF codificado em base64 (injetado automaticamente)"
        ),
    }),
  }
);

export const validateProofOfResidenceTool = tool(
  async ({ fileBase64, address }: { fileBase64?: string; address: string }) => {
    try {
      if (!fileBase64) {
        return JSON.stringify({
          success: false,
          error:
            "Arquivo PDF não fornecido. Por favor, anexe o comprovante de residência em PDF.",
        });
      }

      if (!address) {
        return JSON.stringify({
          success: false,
          error:
            "Endereço não fornecido. Por favor, forneça o endereço completo no formato: Rua, Número, Bairro, Cidade, Estado - CEP",
        });
      }

      const buffer = Buffer.from(fileBase64, "base64");

      const formData = new FormData();
      const blob = new Blob([buffer], { type: "application/pdf" });
      formData.append("document", blob, "comprovante.pdf");
      formData.append("currentAddress[value]", address);

      if (!apiUrl || !apiKey) {
        return JSON.stringify({
          success: false,
          error:
            "Configuração da API não encontrada. Verifique as variáveis de ambiente REMESSAI_API_URL e REMESSAI_API_KEY.",
        });
      }

      const response = await fetch(
        `${apiUrl}/api/documents/process/proof-of-residence`,
        {
          method: "POST",
          headers: {
            Authorization: apiKey,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return JSON.stringify({
          success: false,
          error: result.message || "Erro ao validar comprovante de residência",
          details: result,
        });
      }

      return JSON.stringify({
        success: true,
        message: "Comprovante de residência validado com sucesso!",
        data: result,
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao validar comprovante de residência",
      });
    }
  },
  {
    name: "validate_proof_of_residence",
    description:
      "Valida um comprovante de residência. Use esta ferramenta quando o usuário fornecer um comprovante de residência em PDF E o endereço atual. IMPORTANTE: Você DEVE perguntar o endereço completo ao usuário antes de chamar esta ferramenta. O arquivo PDF será automaticamente injetado pelo sistema.",
    schema: z.object({
      fileBase64: z
        .string()
        .optional()
        .describe(
          "O arquivo PDF do comprovante de residência codificado em base64 (injetado automaticamente)"
        ),
      address: z
        .string()
        .describe(
          "O endereço completo atual do usuário no formato: Rua, Número, Bairro, Cidade, Estado - CEP"
        ),
    }),
  }
);
