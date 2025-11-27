# Guia de Teste do Chat Agent

## Pré-requisitos

1. Configure a chave da API do Google Gemini no arquivo `.env.local`:

```bash
GOOGLE_API_KEY=sua_chave_aqui
```

## Iniciando o Projeto

```bash
cd /home/remessa-online/workspace/poc/document-chat-agent
npm run dev
```

Acesse: http://localhost:3000

## Cenários de Teste

### 1. Teste de Conversa Inicial

**Ação**: Abra a aplicação
**Esperado**: Ver mensagem de boas-vindas do assistente

### 2. Teste de Validação de IRPF

**Passos**:

1. Clique no botão 📎 para anexar arquivo
2. Selecione um arquivo PDF de IRPF
3. Envie uma mensagem como: "Gostaria de validar meu IRPF"
4. O agent deve processar e validar o documento

**Arquivo de teste**: Qualquer PDF válido de IRPF

### 3. Teste de Validação de Comprovante de Residência

**Passos**:

1. Clique no botão 📎 para anexar arquivo
2. Selecione um arquivo PDF de comprovante de residência
3. Envie uma mensagem como: "Quero validar meu comprovante de residência"
4. O agent deve perguntar seu endereço completo
5. Forneça o endereço no formato: "Rua Santo Antônio, 722, Bela Vista, São Paulo, São Paulo - 01314-000"
6. O agent deve processar e validar o documento

**Arquivo de teste**: Qualquer PDF válido de comprovante de residência (conta de luz, água, etc.)

### 4. Teste de Conversa Natural

**Exemplos de mensagens**:

- "Olá!"
- "Quais documentos você pode validar?"
- "Preciso validar documentos"
- "Como funciona o processo?"

**Esperado**: O agent responde de forma natural e contextual

### 5. Teste de Upload de Arquivo

**Passos**:

1. Clique no ícone 📎
2. Selecione um arquivo PDF
3. Verifique se o nome do arquivo aparece acima do campo de input
4. Clique no ✕ para remover o arquivo
5. Verifique se o arquivo foi removido

### 6. Teste de Erro

**Cenários**:

1. Tentar enviar arquivo que não é PDF
2. Enviar mensagem sem arquivo quando solicitado
3. Fornecer endereço em formato incorreto

## Exemplo de Fluxo Completo - IRPF

```
Usuário: Olá!
Agent: Olá! Como posso ajudá-lo hoje? Posso validar documentos de IRPF e comprovantes de residência.

Usuário: [anexa arquivo ir8.pdf] Quero validar meu IRPF
Agent: Perfeito! Vou validar seu documento de IRPF agora... [chama tool]
Agent: ✅ Seu documento de IRPF foi validado com sucesso! [mostra detalhes]
```

## Exemplo de Fluxo Completo - Comprovante

```
Usuário: [anexa comprovante_residencia.pdf] Valide meu comprovante
Agent: Para validar seu comprovante de residência, preciso do seu endereço completo.
       Por favor, forneça no formato: Rua, Número, Bairro, Cidade, Estado - CEP

Usuário: Rua Santo Antônio, 722, Bela Vista, São Paulo, São Paulo - 01314-000
Agent: Perfeito! Vou validar seu comprovante de residência agora... [chama tool]
Agent: ✅ Seu comprovante de residência foi validado com sucesso! [mostra detalhes]
```

## Observações

- A primeira mensagem pode demorar um pouco enquanto o modelo é carregado
- Arquivos grandes (>10MB) podem levar mais tempo para processar
- Certifique-se de ter uma conexão de internet estável para as chamadas de API

## Troubleshooting

### Erro: "GOOGLE_API_KEY not found"

- Verifique se você configurou a chave no arquivo `.env.local`
- Reinicie o servidor de desenvolvimento após adicionar a chave

### Erro: "Failed to get response"

- Verifique sua conexão com a internet
- Verifique se a chave da API do Google Gemini é válida

### Interface não carrega estilos

- Execute `npm install` novamente
- Limpe o cache: `rm -rf .next` e `npm run dev`

### Arquivo não é enviado

- Verifique se o arquivo é um PDF
- Verifique o tamanho do arquivo (recomendado < 10MB)
