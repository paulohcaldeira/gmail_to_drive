# Gmail Drive Auto-Save

Script para Google Apps Script que salva automaticamente anexos de emails específicos em pastas designadas no Google Drive.

## 📋 Funcionalidades

- ✅ Salva anexos automaticamente baseado no remetente do email
- ✅ Organiza arquivos em pastas específicas do Google Drive
- ✅ Evita processamento duplicado usando etiquetas
- ✅ Mantém emails como não lidos após processamento (opcional)
- ✅ Execução automática através de gatilhos
- ✅ Logs detalhados para monitoramento
- ✅ Tratamento de erros robusto

## 🚀 Como Usar

### 1. Configuração Inicial

1. Acesse [script.google.com](https://script.google.com)
2. Crie um novo projeto
3. Copie e cole o código fornecido
4. Salve o projeto com um nome de sua escolha

### 2. Configurar Regras de Email

Edite a função `configurarRegras()` para definir quais remetentes devem ter seus anexos salvos e em quais pastas:

```javascript
function configurarRegras() {
  return {
    "usuario@exemplo.com": "ID_DA_PASTA_NO_DRIVE",
    "outro@empresa.com": "OUTRO_ID_DA_PASTA",
    // Adicione mais regras conforme necessário
  };
}
```

### 3. Obter IDs das Pastas do Google Drive

Para obter o ID de uma pasta no Google Drive:

1. Abra a pasta no Google Drive
2. Copie o ID da URL: `https://drive.google.com/drive/folders/ID_DA_PASTA_AQUI`
3. Use este ID na configuração das regras

### 4. Configurar Execução Automática

Execute a função `configurarGatilho()` uma única vez para configurar a execução automática:

1. No editor do Apps Script, selecione a função `configurarGatilho`
2. Clique em "Executar"
3. Autorize as permissões necessárias

## ⚙️ Configurações Avançadas

### Regras Melhoradas

Para maior flexibilidade, você pode usar a função `configurarRegrasMelhoradas()`:

```javascript
function configurarRegrasMelhoradas() {
  return [
    {
      remetente: "usuario@exemplo.com",
      pastaId: "ID_DA_PASTA_DESTINO",
      marcarComoLido: true,
      adicionarEtiqueta: true,
      criarSubpastas: true
    }
  ];
}
```

### Personalizar Frequência de Execução

Por padrão, o script executa a cada 5 minutos. Para alterar:

```javascript
// Na função configurarGatilho(), altere:
ScriptApp.newTrigger('executarAutomaticamente')
  .timeBased()
  .everyMinutes(10) // Executar a cada 10 minutos
  .create();
```

## 🔧 Funções Principais

### `processarEmailsComAnexos(manterNaoLido)`
Função principal que processa os emails com anexos.
- `manterNaoLido`: Se `true`, mantém emails como não lidos após processamento

### `salvarAnexosNoDrive(anexos, pastaDriveId, assunto, remetente)`
Salva os anexos na pasta especificada do Google Drive.

### `configurarGatilho()`
Configura a execução automática do script.

### `executarManualmente()`
Executa o script manualmente com logs detalhados para teste.

## 📊 Monitoramento

### Visualizar Logs

1. No editor do Apps Script, vá em **Execuções**
2. Clique em uma execução para ver os logs detalhados
3. Os logs mostram:
   - Quantos emails foram processados
   - Quais anexos foram salvos
   - Eventuais erros ocorridos

### Etiquetas Criadas

O script cria automaticamente a etiqueta **"Anexos Salvos no Drive"** para marcar emails já processados e evitar duplicação.

## 🔒 Permissões Necessárias

O script solicita as seguintes permissões:

- **Gmail**: Ler emails e anexos
- **Google Drive**: Criar e gerenciar arquivos em pastas específicas
- **Etiquetas**: Criar e aplicar etiquetas no Gmail

## ⚠️ Importante

- **Backup**: Sempre faça backup dos seus dados importantes
- **Teste**: Execute `executarManualmente()` primeiro para testar as configurações
- **Limites**: O Google Apps Script tem limites de execução (6 minutos por execução)
- **Permissões**: Certifique-se de que o script tenha acesso às pastas do Drive especificadas

## 🐛 Solução de Problemas

### Erro: "Pasta não encontrada"
- Verifique se o ID da pasta está correto
- Confirme se você tem acesso à pasta no Google Drive

### Emails não sendo processados
- Verifique se os emails têm anexos
- Confirme se o remetente está nas regras configuradas
- Verifique se a etiqueta "Anexos Salvos no Drive" não está sendo aplicada incorretamente

### Script não executa automaticamente
- Verifique se o gatilho foi configurado corretamente
- Vá em **Gatilhos** no Apps Script para verificar

## 🔄 Exemplo de Uso

```javascript
// Configuração de exemplo
function configurarRegras() {
  return {
    "contabilidade@empresa.com": "1dMecwbYxsFwjYBOmaE-G9LZhZiHFsB8E",
    "vendas@empresa.com": "1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456",
    "suporte@fornecedor.com": "1zYxWvUtSrQpOnMlKjIhGfEdCbA987654"
  };
}
```

Com esta configuração:
- Anexos de `contabilidade@empresa.com` vão para a primeira pasta
- Anexos de `vendas@empresa.com` vão para a segunda pasta  
- Anexos de `suporte@fornecedor.com` vão para a terceira pasta

## 📝 Licença

Este projeto é de uso livre. Sinta-se à vontade para modificar e adaptar conforme suas necessidades.

## 🤝 Contribuição

Sugestões e melhorias são bem-vindas! Você pode:
- Reportar bugs
- Sugerir novas funcionalidades
- Contribuir com código

---

**Desenvolvido para automatizar o gerenciamento de anexos de email com Google Apps Script**
