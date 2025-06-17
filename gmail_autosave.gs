/**
 * Adiciona uma etiqueta ao email para identificação
 */
function adicionarEtiqueta(thread, nomeEtiqueta) {
  try {
    // Verificar se a etiqueta existe
    let etiqueta = GmailApp.getUserLabelByName(nomeEtiqueta);
    
    // Se não existir, criar nova etiqueta
    if (!etiqueta) {
      etiqueta = GmailApp.createLabel(nomeEtiqueta);
    }
    
    // Adicionar etiqueta à thread
    etiqueta.addToThread(thread);
  } catch (e) {
    Logger.log("Erro ao adicionar etiqueta: " + e.toString());
  }
}/**
 * Script para salvar automaticamente anexos de emails específicos em pastas designadas no Google Drive
 * 
 * Como usar:
 * 1. Acesse script.google.com e crie um novo projeto
 * 2. Copie e cole este código
 * 3. Configure as regras de correspondência na função configurarRegras()
 * 4. Configure um gatilho para execução automática
 */

// Configurações das regras de email para pasta
function configurarRegras() {
  // Estrutura: {remetente: ID_DA_PASTA_NO_DRIVE}
  return {
    "usuario@exemplo.com": "ID_DA_PASTA_DESTINO", // Substitua pelo ID da pasta
    "outro@exemplo.com": "ID_DA_PASTA_DESTINO_2",
    // Adicione mais regras conforme necessário
  };
}

// Configuração alternativa: use esta função para maior flexibilidade
function configurarRegrasMelhoradas() {
  return [
    {
      // Pode ser parte do email, ou regex com /padrão/
      remetente: "teste@teste.com.br", 
      pastaId: "ID_DA_PASTA_DESTINO_1",
      // Configurações opcionais
      marcarComoLido: true,
      adicionarEtiqueta: true,
      criarSubpastas: true
    },
    // Adicione mais regras conforme necessário
  ];
}

/**
 * Função principal que processa os emails
 * @param {boolean} manterNaoLido - Se true, manterá os emails como não lidos após processamento
 */
function processarEmailsComAnexos(manterNaoLido = true) {
  // Obter regras de configuração
  const regras = configurarRegras();
  Logger.log("Iniciando processamento com regras: " + JSON.stringify(regras));
  
  // Criar/verificar etiqueta para marcar emails processados
  const etiquetaProcessado = getOrCreateEtiqueta("Anexos Salvos no Drive");
  
  // Verificar emails não lidos que ainda não foram processados
  // Usando a etiqueta para evitar processar o mesmo email múltiplas vezes
  const threads = GmailApp.search('has:attachment is:unread -label:"Anexos Salvos no Drive"');
  Logger.log("Encontrados " + threads.length + " threads com anexos não lidos para processar");
  
  for (let i = 0; i < threads.length; i++) {
    const thread = threads[i];
    const messages = thread.getMessages();
    Logger.log("Thread #" + (i+1) + " tem " + messages.length + " mensagens");
    
    for (let j = 0; j < messages.length; j++) {
      const message = messages[j];
      const remetente = message.getFrom();
      const assunto = message.getSubject();
      const anexos = message.getAttachments();
      
      Logger.log("Analisando mensagem: Remetente=" + remetente + ", Assunto=" + assunto + ", Anexos=" + anexos.length);
      
      // Verificar se o remetente está nas regras
      let remetenteEncontrado = false;
      for (const [emailRemetente, pastaDriveId] of Object.entries(regras)) {
        // Extrair email real do remetente
        const emailReal = extrairEmail(remetente);
        Logger.log("Comparando email real: " + emailReal + " com regra: " + emailRemetente.toLowerCase());
        
        if (emailReal.includes(emailRemetente.toLowerCase())) {
          Logger.log("Encontrado remetente correspondente: " + emailRemetente + " => " + pastaDriveId);
          remetenteEncontrado = true;
          
          // Salvar anexos na pasta designada
          salvarAnexosNoDrive(anexos, pastaDriveId, assunto, remetente);
          
          // Temporariamente marcar como lido para processamento
          message.markRead();
          
          // Se configurado para manter como não lido, reverter a marcação
          if (manterNaoLido) {
            message.markUnread();
            Logger.log("Email mantido como não lido após processamento");
          }
          
          // Adicionar etiqueta para identificar emails processados
          etiquetaProcessado.addToThread(thread);
          
          // Pular para o próximo email
          break;
        }
      }
      
      if (!remetenteEncontrado) {
        Logger.log("Nenhuma regra correspondente encontrada para o remetente: " + remetente);
      }
    }
  }
  
  Logger.log("Processamento de emails concluído");
}

/**
 * Obtém uma etiqueta existente ou cria uma nova
 */
function getOrCreateEtiqueta(nomeEtiqueta) {
  let etiqueta = GmailApp.getUserLabelByName(nomeEtiqueta);
  
  // Se não existir, criar nova etiqueta
  if (!etiqueta) {
    etiqueta = GmailApp.createLabel(nomeEtiqueta);
    Logger.log("Nova etiqueta criada: " + nomeEtiqueta);
  }
  
  return etiqueta;
}

/**
 * Salva os anexos na pasta designada do Drive
 */
function salvarAnexosNoDrive(anexos, pastaDriveId, assunto, remetente) {
  try {
    Logger.log("Tentando salvar " + anexos.length + " anexos na pasta: " + pastaDriveId);
    
    // Obter pasta do Drive pelo ID
    const pasta = DriveApp.getFolderById(pastaDriveId);
    
    // Verificar se a pasta existe
    if (!pasta) {
      Logger.log(`Pasta com ID ${pastaDriveId} não encontrada.`);
      return;
    }
    
    Logger.log("Pasta encontrada: " + pasta.getName());
    
    // Salvar cada anexo diretamente na pasta principal (sem criar subpastas)
    for (let i = 0; i < anexos.length; i++) {
      const anexo = anexos[i];
      const nomeArquivo = anexo.getName();
      
      Logger.log("Salvando anexo: " + nomeArquivo);
      
      // Criar arquivo no Drive usando o próprio objeto anexo
      // (não convertemos para Blob já que o próprio anexo já é um objeto compatível)
      const arquivoSalvo = pasta.createFile(anexo);
      Logger.log(`Arquivo "${nomeArquivo}" de "${remetente}" salvo como "${arquivoSalvo.getName()}" na pasta "${pasta.getName()}"`);
    }
    
  } catch (e) {
    Logger.log("ERRO ao salvar anexos: " + e.toString() + "\n" + e.stack);
  }
}

/**
 * Extrai o endereço de email da string de remetente
 * Converte "Nome <email@dominio.com>" para "email@dominio.com"
 */
function extrairEmail(stringRemetente) {
  // Procurar por padrão de email entre < >
  const padrao = /<([^>]+)>/;
  const resultado = padrao.exec(stringRemetente);
  
  // Se encontrou email entre < >, retorna apenas o email
  if (resultado && resultado.length > 1) {
    return resultado[1].toLowerCase();
  }
  
  // Caso contrário, retorna a string original (pode ser apenas o email)
  return stringRemetente.toLowerCase();
}

/**
 * Configurar gatilho para execução automática
 * Esta função deve ser executada manualmente uma única vez para configurar
 * o gatilho automático para o script
 */
function configurarGatilho() {
  // Remover gatilhos existentes para evitar duplicação
  const gatilhos = ScriptApp.getProjectTriggers();
  for (let i = 0; i < gatilhos.length; i++) {
    ScriptApp.deleteTrigger(gatilhos[i]);
  }
  
  // Criar novo gatilho para executar a cada 5 minutos
  ScriptApp.newTrigger('executarAutomaticamente')
    .timeBased()
    .everyMinutes(5)
    .create();
    
  Logger.log("Gatilho configurado com sucesso!");
}

/**
 * Função chamada pelo gatilho automático
 * Mantém os emails como não lidos por padrão
 */
function executarAutomaticamente() {
  processarEmailsComAnexos(true);
}

// Função para teste manual com logs adicionais
function executarManualmente() {
  Logger.log("Iniciando processamento manual");
  
  // Verificar configurações
  const regras = configurarRegras();
  Logger.log("Regras configuradas: " + JSON.stringify(regras));
  
  // Verificar emails não lidos com anexos
  const threads = GmailApp.search('has:attachment is:unread -label:"Anexos Salvos no Drive"');
  Logger.log("Encontrados " + threads.length + " emails não lidos com anexos para processar");
  
  // Executar o processamento - true para manter emails como não lidos
  processarEmailsComAnexos(true);
  
  Logger.log("Processamento manual concluído");
}
