/**
 * Todo texto visível ao seller vem daqui (PRD seção 14). Use exatamente estes textos.
 * Glossário (14.2): nunca "lead", "opt-in", "enriquecimento" ou "conversão" na interface —
 * tests/unit/copy.test.ts falha se aparecerem.
 *
 * Variáveis entre chaves ({n}, {nome}) são preenchidas com `fmt()` de lib/copy/index.ts.
 */
export const ptBR = {
  app: {
    name: 'CRMarketplace',
    tagline: 'Venda de novo para quem já comprou de você — em qualquer marketplace.',
    taglineSafe: 'Venda de novo para quem já comprou de você — sem arriscar sua conta.',
  },

  common: {
    soon: 'Disponível em breve.',
    back: 'Voltar',
    save: 'Salvar',
    cancel: 'Cancelar',
    loading: 'Carregando…',
  },

  glossary: {
    customer: 'Cliente',
    customers: 'Clientes',
    order: 'Pedido',
    orders: 'Pedidos',
    channel: 'Canal',
    channels: 'Canais',
    enrichment: 'Busca de WhatsApp',
    credits: 'Créditos',
    journey: 'Régua',
    journeys: 'Réguas',
    campaign: 'Envio em massa',
    campaigns: 'Envios em massa',
    segment: 'Lista de clientes',
    segments: 'Listas de clientes',
    conversion: 'Comprou de novo',
    attributedRevenue: 'Vendas geradas pelo CRM',
    holdout: 'Grupo de comparação',
    lowConfidence: 'Número a confirmar',
    directSale: 'Venda direta',
  },

  consent: {
    opted_in: 'Aceitou novidades',
    transactional_only: 'Só avisos do pedido',
    opted_out: 'Não quer mensagens',
    unknown: 'Ainda não contatado',
  },

  nav: {
    dashboard: 'Início',
    customers: 'Clientes',
    segments: 'Listas',
    campaigns: 'Envios em massa',
    journeys: 'Réguas',
    settings: 'Configurações',
    admin: 'Admin',
    more: 'Mais',
    signOut: 'Sair da conta',
    switchStore: 'Trocar de loja',
    newStore: 'Criar outra loja',
  },

  settings: {
    title: 'Configurações',
    sections: {
      general: 'Geral',
      integrations: 'Integrações',
      channels: 'Canais',
      enrichment: 'Busca de WhatsApp',
      messaging: 'WhatsApp',
      credits: 'Créditos',
      team: 'Equipe',
      privacy: 'Privacidade',
    },
    general: {
      storeName: 'Nome da loja',
      storeNameHelp: 'Aparece nas mensagens que seus clientes recebem.',
      address: 'Endereço da sua conta',
      save: 'Salvar alterações',
      saved: 'Alterações salvas.',
    },
    team: {
      you: 'Você',
      roles: { owner: 'Dono(a)', admin: 'Administrador(a)', member: 'Equipe' },
    },
    comingSoon: 'Esta parte chega numa próxima etapa. Por enquanto, nada para configurar aqui.',
  },

  auth: {
    loginTitle: 'Entrar no CRMarketplace',
    signupTitle: 'Criar sua conta',
    email: 'E-mail',
    password: 'Senha',
    passwordHelp: 'Pelo menos 8 caracteres.',
    login: 'Entrar',
    signup: 'Criar conta',
    magicLink: 'Receber link de acesso por e-mail',
    magicLinkSent: 'Enviamos um link de acesso para {email}. Abra no mesmo aparelho.',
    signupSent: 'Conta criada. Confirme seu e-mail pelo link que enviamos para {email}.',
    noAccount: 'Ainda não tem conta?',
    hasAccount: 'Já tem conta?',
    or: 'ou',
    invalidCredentials: 'E-mail ou senha não conferem. Confira e tente de novo.',
    linkExpired: 'O link de acesso expirou ou já foi usado. Peça um novo.',
  },

  org: {
    createTitle: 'Qual é o nome da sua loja?',
    createText: 'É o nome que seus clientes conhecem. Você pode mudar depois.',
    nameLabel: 'Nome da loja',
    namePlaceholder: 'Ex.: Casa da Maria',
    create: 'Criar loja',
    created: 'Loja criada.',
  },

  onboarding: {
    step: 'Passo {n} de {total}',
    welcome: {
      title: 'Vamos transformar seus pedidos em clientes que voltam',
      text: 'Em poucos minutos você conecta seu Bling e vê todos os seus clientes de marketplace num lugar só.',
      cta: 'Começar',
    },
    bling: {
      title: 'Conecte seu Bling',
      text: 'Vamos ler seus pedidos e notas fiscais para montar sua lista de clientes. Não alteramos nada no seu Bling.',
      cta: 'Conectar Bling',
      termsBefore:
        'Sou responsável pelos dados dos meus clientes e conheço as regras dos marketplaces em que vendo. Li os ',
      termsLink: 'Termos de uso',
      termsMiddle: ' e a ',
      privacyLink: 'Política de privacidade',
      termsAfter: '.',
      termsRequired: 'Marque a caixa acima para continuar.',
    },
    importing: {
      title: 'Trazendo seus clientes',
      contacts: 'Lendo seus contatos do Bling…',
      orders30: 'Importando pedidos dos últimos 30 dias… {n} de {total}',
      ready: 'Pronto para começar. O restante do histórico continua carregando em segundo plano.',
      cta: 'Ver meus clientes',
    },
    channels: {
      title: 'De onde vêm seus pedidos?',
      text: 'Dê um nome para cada loja do Bling. Isso ajuda a separar clientes por marketplace.',
      placeholder: 'Ex.: Mercado Livre',
      cta: 'Salvar canais',
    },
    whatsapp: {
      title: 'Conecte o WhatsApp da sua loja',
      text: 'Usamos a API oficial do WhatsApp. Seu número fica protegido contra bloqueios e as mensagens saem com o nome da sua loja.',
      cta: 'Conectar WhatsApp',
      later: 'Fazer isso depois',
      help: 'Precisa de ajuda? Veja o passo a passo (5 min)',
    },
    firstJourney: {
      title: 'Ligue sua primeira régua',
      text: 'A régua de pós-venda avisa o cliente sobre o pedido e pergunta se ele quer receber novidades. É o jeito seguro de começar.',
      cta: 'Ligar régua de pós-venda',
    },
  },

  cta: {
    enrich: 'Buscar WhatsApp',
    newSegment: 'Criar lista de clientes',
    newCampaign: 'Criar envio em massa',
    sendTo: 'Enviar para {n} clientes',
    journeyOn: 'Ligar régua',
    journeyOff: 'Pausar régua',
    addCredits: 'Adicionar créditos',
    reconnectBling: 'Reconectar Bling',
    connectBling: 'Conectar Bling',
    connectWhatsapp: 'Conectar WhatsApp',
    exportCustomer: 'Baixar dados do cliente',
    deleteCustomer: 'Apagar dados do cliente',
    seeTemplates: 'Ver réguas prontas',
    retry: 'Tentar de novo',
  },

  empty: {
    customers: {
      title: 'Nenhum cliente ainda.',
      text: 'Assim que seu Bling estiver conectado, seus clientes aparecem aqui.',
      cta: 'Conectar Bling',
    },
    journeys: {
      title: 'Nenhuma régua ligada.',
      text: 'Réguas mandam a mensagem certa na hora certa, sozinhas. Comece pela de pós-venda.',
      cta: 'Ver réguas prontas',
    },
    campaigns: {
      title: 'Nenhum envio ainda.',
      text: 'Escolha uma lista de clientes e mande uma mensagem para todos de uma vez.',
      cta: 'Criar envio em massa',
    },
    segments: {
      title: 'Nenhuma lista criada.',
      text: 'Agrupe clientes por canal, produto ou última compra.',
      cta: 'Criar lista de clientes',
    },
    dashboardNoWhatsapp: {
      title: 'Seus clientes já estão aqui.',
      text: 'Conecte o WhatsApp para começar a vender de novo para eles.',
      cta: 'Conectar WhatsApp',
    },
    dashboardNoCustomers: {
      title: 'Nenhum cliente ainda.',
      text: 'Assim que seu Bling estiver conectado, seus clientes aparecem aqui.',
      cta: 'Conectar Bling',
    },
    conversions: {
      title: 'Nenhuma venda gerada ainda.',
      text: 'Quando um cliente comprar depois de uma mensagem, ela aparece aqui.',
    },
    search: {
      title: 'Nenhum cliente encontrado para "{termo}".',
      text: 'Tente nome, CPF ou número do pedido.',
    },
  },

  errors: {
    blingDisconnected: {
      title: 'Seu Bling foi desconectado.',
      text: 'A autorização expirou ou foi removida. Novos pedidos ficam guardados e entram assim que você reconectar.',
      cta: 'Reconectar Bling',
    },
    noCredits: {
      title: 'Seus créditos acabaram.',
      text: 'A busca de WhatsApp está pausada para novos clientes. Os clientes chegam normalmente.',
      cta: 'Adicionar créditos',
    },
    lowCredits: {
      title: 'Restam {n} créditos',
      text: '— dá para cerca de {dias} dias no seu ritmo atual.',
      cta: 'Adicionar créditos',
    },
    whatsappToken: {
      title: 'Não conseguimos enviar pelo seu WhatsApp.',
      text: 'O acesso à conta mudou. Atualize o token para voltar a enviar.',
      cta: 'Atualizar conexão',
    },
    whatsappQuality: {
      title: 'A qualidade do seu número caiu no WhatsApp.',
      text: 'Muitas pessoas bloquearam ou denunciaram mensagens. Pausamos os envios de novidades por segurança.',
      cta: 'Ver o que fazer',
    },
    templateRejected: {
      title: 'O WhatsApp recusou a mensagem "{nome}".',
      text: 'Motivo informado: {motivo}. Ajuste o texto no WhatsApp Manager e sincronize de novo.',
      cta: 'Sincronizar mensagens',
    },
    invalidCpf: {
      title: 'CPF inválido na nota do pedido #{n}.',
      text: 'Não dá para buscar o WhatsApp deste cliente.',
    },
    lowConfidence: {
      title: 'Número a confirmar.',
      text: 'O nome encontrado não bate com o da nota. Este cliente não entra em réguas automáticas.',
      ctaUse: 'Usar mesmo assim',
      ctaIgnore: 'Ignorar número',
    },
    outsideHours: {
      title: 'Envio agendado para {data, 9h}.',
      text: 'Mensagens só saem entre 9h e 20h para não incomodar seus clientes.',
    },
    generic: {
      title: 'Algo deu errado do nosso lado.',
      text: 'Já fomos avisados. Tente de novo em alguns minutos.',
      cta: 'Tentar de novo',
    },
    notFound: {
      title: 'Página não encontrada.',
      text: 'O endereço pode ter mudado ou você não tem acesso a esta loja.',
      cta: 'Voltar ao início',
    },
    forbidden: 'Você não tem permissão para fazer isso nesta loja.',
  },

  confirm: {
    campaign: {
      title: 'Enviar "{template}" para {n} clientes?',
      text: 'Custo estimado no WhatsApp: R$ {valor}. {x} clientes ficam de fora porque não aceitaram novidades ou estão fora do limite de frequência.',
      confirm: 'Enviar para {n} clientes',
      cancel: 'Voltar e revisar',
    },
    journey: {
      title: 'Ligar "{régua}"?',
      text: '{n} clientes entram agora. Novos clientes entram sozinhos quando {gatilho}.',
      confirm: 'Ligar régua',
      cancel: 'Deixar desligada',
    },
    enrich: {
      title: 'Buscar WhatsApp de {nome}?',
      text: 'Usa 1 crédito. Você tem {saldo}.',
      confirm: 'Buscar WhatsApp',
      cancel: 'Cancelar busca',
    },
    deleteCustomer: {
      title: 'Apagar todos os dados de {nome}?',
      text: 'Pedidos, contatos e histórico de mensagens deste cliente serão apagados do CRM. Isso não pode ser desfeito e não altera nada no seu Bling.',
      confirm: 'Apagar dados',
      cancel: 'Manter dados',
    },
  },

  tooltips: {
    attributedRevenue:
      'Pedidos de clientes que compraram até 7 dias depois de clicar numa mensagem, ou até 3 dias depois de ler.',
    holdout:
      'Uma parte dos clientes não recebe a régua. Comparar os dois grupos mostra quanto a régua realmente vendeu a mais.',
    rfm: 'Classifica o cliente pela última compra, quantas vezes comprou e quanto gastou.',
    predictedPurchase:
      'Calculada pelo tempo médio que seus clientes levam para comprar este produto de novo.',
    estimatedCost:
      'Valor cobrado pelo WhatsApp por mensagem. Novidades custam mais que avisos de pedido.',
  },

  toasts: {
    blingConnected: 'Bling conectado. Seus clientes estão chegando.',
    journeyOn: 'Régua ligada. {n} clientes entraram.',
    campaignScheduled: 'Envio programado para {n} clientes.',
    creditsAdded: '{n} créditos adicionados.',
    firstConversion: 'Primeira venda gerada pelo CRM: R$ {valor} 🎉',
  },

  /** Textos dos templates de WhatsApp (14.10). Variáveis no formato da Meta: {{1}}, {{2}}… */
  whatsappTemplates: {
    pedido_faturado_optin: {
      category: 'UTILITY',
      body: 'Oi, {{1}}! Aqui é da {{2}}.\nSeu pedido {{3}} foi faturado e já está seguindo para entrega.\nSe tiver qualquer problema com a entrega, é só responder esta mensagem.\nVocê também quer receber dicas e ofertas da {{2}} por aqui?',
      buttons: ['Quero receber', 'Não, obrigado'],
      firstNameFallback: 'tudo bem?',
      variants: {
        A: 'Seu pedido {{3}} foi faturado e já está seguindo para entrega.',
        B: 'Passando para avisar que o {{3}} já saiu daqui.',
        C: 'Confirmamos o faturamento do seu pedido {{3}}.',
      },
    },
    reply_accept:
      'Combinado, {{1}}! Vamos mandar só o que vale a pena. Se quiser parar, é só enviar SAIR.',
    reply_decline:
      'Tudo certo, {{1}}. Você não vai receber novidades da {{2}}. Avisos sobre seus pedidos continuam chegando normalmente.',
    hora_de_repor: {
      category: 'MARKETING',
      body: 'Oi, {{1}}! O {{2}} que você comprou costuma durar cerca de {{3}} dias. Já está na hora de repor?\nEle está aqui na nossa loja: {{4}}\nPara não receber mais, responda SAIR.',
      buttons: ['Ver produto'],
    },
    sentimos_sua_falta: {
      category: 'MARKETING',
      body: 'Oi, {{1}}! Faz um tempo que você não passa na {{2}}. Separamos novidades que combinam com o que você já levou: {{3}}\nPara não receber mais, responda SAIR.',
    },
    chegou_bem: {
      category: 'UTILITY',
      body: 'Oi, {{1}}! Seu pedido {{2}} já deve ter chegado. Está tudo certo com ele?',
      buttons: ['Tudo certo', 'Tive um problema'],
    },
    stopWords: ['SAIR', 'PARAR', 'CANCELAR', 'STOP'],
  },

  privacyPage: {
    title: 'Suas mensagens da {loja}',
    text: 'A {loja} usa seus dados de compra para avisar sobre seus pedidos e, se você aceitar, enviar novidades pelo WhatsApp. Você pode parar quando quiser.',
    field: 'Seu WhatsApp com DDD',
    cta: 'Parar de receber mensagens',
    done: 'Pronto. Você não vai mais receber novidades da {loja}.',
    doneText: 'Pode levar alguns minutos para valer em todos os envios.',
    footer: 'Quer saber quais dados a {loja} tem sobre você? Fale com {email}.',
  },

  admin: {
    title: 'Admin da plataforma',
    stores: 'Lojas',
    store: 'Loja',
    createdAt: 'Criada em',
    empty: 'Nenhuma loja cadastrada ainda.',
  },

  dashboard: {
    title: 'Início',
    greeting: 'Olá',
    kpis: {
      customers: 'Clientes',
      orders: 'Pedidos',
      revenue: 'Faturamento',
      avgTicket: 'Ticket médio',
    },
  },
} as const;

export type Copy = typeof ptBR;
