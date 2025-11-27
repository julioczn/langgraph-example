# Gerenciamento de Prompts

Este documento descreve a estrutura de prompts do sistema de validação de documentos.

## Estrutura

Todos os prompts estão centralizados no arquivo `lib/prompts.ts`, proporcionando:

- ✅ **Manutenibilidade**: Fácil atualização e versionamento
- ✅ **Consistência**: Comportamento uniforme do assistente
- ✅ **Escalabilidade**: Preparado para crescimento do MVP
- ✅ **Rastreabilidade**: Histórico claro de mudanças

## Componentes Principais

### 1. SYSTEM_PROMPT

O prompt principal que define todo o comportamento do assistente, incluindo:

- Escopo do produto
- Instruções de processamento de arquivos
- Restrições de conteúdo
- Formatação de respostas
- Mensagem inicial obrigatória

### 2. SYSTEM_PROMPT_CONCISE

Versão alternativa mais concisa para contextos específicos.

### 3. ERROR_MESSAGES

Mensagens de erro padronizadas:

- `TOOL_NOT_FOUND`: Ferramenta não encontrada
- `TOOL_EXECUTION_ERROR`: Erro na execução
- `FILE_NOT_PROVIDED`: Arquivo não fornecido
- `INVALID_ADDRESS`: Endereço inválido

### 4. SUCCESS_MESSAGES

Mensagens de sucesso padronizadas:

- `DOCUMENT_VALIDATED`: Documento validado
- `PROCESSING_DOCUMENT`: Processamento em andamento

### 5. DOCUMENT_INSTRUCTIONS

Instruções específicas por tipo de documento:

- `IRPF`: Instruções para IRPF
- `PROOF_OF_RESIDENCE`: Instruções para comprovante

## Como Usar

### Importação

```typescript
import {
  SYSTEM_PROMPT,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DOCUMENT_INSTRUCTIONS,
} from "./prompts";
```

### Exemplo de Uso

```typescript
// Usar o prompt principal
const systemMessage = new SystemMessage(SYSTEM_PROMPT);

// Usar mensagens de erro
toolMessages.push(
  new ToolMessage({
    tool_call_id: toolCall.id!,
    content: ERROR_MESSAGES.TOOL_NOT_FOUND(toolCall.name),
  })
);
```

## Boas Práticas

1. **Nunca hardcode prompts** - Sempre use as constantes do arquivo `prompts.ts`
2. **Documente mudanças** - Ao alterar prompts, documente o motivo
3. **Teste alterações** - Valide comportamento após modificações
4. **Mantenha consistência** - Use o mesmo tom e formato
5. **Versionamento** - Considere criar versões quando necessário

## Evolução para MVP

À medida que o projeto evolui, considere:

- **Prompts A/B**: Testar diferentes versões
- **Prompts contextuais**: Adaptar baseado no usuário/situação
- **Internacionalização**: Suporte a múltiplos idiomas
- **Prompts dinâmicos**: Carregar de banco de dados
- **Analytics**: Monitorar efetividade dos prompts

## Estrutura de Arquivos

```
lib/
├── prompts.ts          # Prompts centralizados
├── graph.ts            # Usa SYSTEM_PROMPT e ERROR_MESSAGES
└── tools.ts            # Ferramentas de validação
```
