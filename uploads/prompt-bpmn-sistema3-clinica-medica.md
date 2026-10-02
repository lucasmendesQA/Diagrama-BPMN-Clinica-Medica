# Prompt para o Claude Design — Diagrama BPMN do Sistema 3

> **Como usar:** copie todo o conteúdo do bloco abaixo (da linha "Crie um diagrama BPMN 2.0..." até o final) e cole no Claude Design.

---

Crie um diagrama BPMN 2.0 completo, em português, do processo "Gestão de Atendimento e Agendamento de uma Clínica Médica", em layout horizontal (fluxo da esquerda para a direita), com piscinas e raias.

## ESTRUTURA DE PISCINAS E RAIAS

Piscina principal **"Clínica Médica"** com 5 raias, nesta ordem de cima para baixo:

1. Paciente
2. Sistema de Gestão
3. Recepção
4. Profissional de Saúde
5. Setor Financeiro

Três piscinas externas (participantes independentes), conectadas apenas por fluxos de mensagem (linhas tracejadas com seta aberta):

- Operadora de Convênio
- Laboratório Parceiro
- Serviço de Notificação

## NOTAÇÃO

- Eventos de início: círculo de borda fina. Eventos intermediários: círculo de borda dupla. Eventos de fim: círculo de borda grossa.
- Tarefas de usuário com ícone de pessoa; tarefas de serviço com ícone de engrenagem.
- Gateways exclusivos (XOR): losango com "X", sempre com pergunta no rótulo e com os rótulos "Sim/Não" (ou equivalentes) em cada fluxo de saída.
- Fluxos de sequência: linha cheia com seta fechada, dentro da mesma piscina.
- Fluxos de mensagem: linha tracejada, apenas entre piscinas diferentes.

## FLUXO A MODELAR

### Início e solicitação

- **[Paciente]** Evento de início: "Solicitação de consulta".
- **[Paciente]** Tarefa de usuário: "Acessar portal ou contatar a recepção".
- **[Sistema]** Tarefa de serviço: "Verificar cadastro do paciente".
- **[Sistema]** Gateway XOR "Paciente já cadastrado?"
  - Não → **[Paciente]** Tarefa de usuário "Criar cadastro (dados pessoais e administrativos)" → converge no fluxo principal.
  - Sim → **[Paciente]** Tarefa de usuário "Atualizar dados de contato (se necessário)".
- **[Paciente]** Tarefa de usuário: "Selecionar especialidade e profissional de preferência".
- **[Sistema]** Tarefa de serviço: "Consultar agenda e exibir horários disponíveis".
- **[Paciente]** Tarefa de usuário: "Escolher data, horário e profissional".
- **[Paciente]** Tarefa de usuário: "Confirmar solicitação de agendamento".
- **[Sistema]** Tarefa de serviço: "Revalidar disponibilidade do horário".
- **[Sistema]** Gateway XOR "Horário ainda disponível?"
  - Não → **[Sistema]** "Apresentar outras datas e horários" → retorna para "Escolher data, horário e profissional" (loop).
  - Sim → segue para a Etapa A.

### Etapa A — Validação e confirmação do agendamento

- **[Recepção]** Tarefa de usuário: "Validar dados cadastrais e informações do atendimento".
- **[Sistema]** Gateway XOR "Paciente é de convênio ou particular?"
  - **Convênio** → **[Sistema]** tarefa de serviço "Enviar dados para verificação de elegibilidade" → fluxo de mensagem para a piscina "Operadora de Convênio" ("Analisar elegibilidade e autorização") → fluxo de mensagem de retorno → **[Sistema]** evento intermediário de mensagem "Retorno da autorização" → gateway XOR "Autorização aprovada?"
    - Não → **[Sistema]** "Informar pendências de documentação ao paciente" → **[Paciente]** "Providenciar documentação" → retorna à validação; se não resolvido, evento de fim "Agendamento cancelado".
    - Sim → converge para a confirmação.
  - **Particular** → **[Sistema]** gateway XOR "Exige pagamento antecipado?"
    - Sim → **[Financeiro]** "Disponibilizar opções de pagamento" → **[Paciente]** "Realizar pagamento" → **[Sistema]** evento intermediário de mensagem "Confirmação de pagamento" → gateway XOR "Pagamento confirmado?" (Não → evento de fim "Agendamento cancelado").
    - Não → converge para a confirmação.
- **[Sistema]** Tarefa de serviço: "Confirmar agendamento e bloquear horário na agenda".
- **[Sistema]** Tarefa de serviço: "Enviar confirmação ao paciente" → fluxo de mensagem para a piscina "Serviço de Notificação".
- **[Sistema]** Tarefa de serviço: "Programar lembretes automáticos" → fluxo de mensagem para "Serviço de Notificação".

### Etapa B — Chegada e recepção do paciente

- **[Paciente]** Evento intermediário de temporizador: "Dia da consulta".
- **[Paciente]** Evento intermediário: "Chegada do paciente à clínica".
- **[Recepção]** Tarefa de usuário: "Localizar agendamento por CPF ou nº da consulta".
- **[Recepção]** Gateway XOR "Agendamento localizado?"
  - Não → **[Recepção]** "Verificar horários disponíveis para encaixe" → gateway XOR "Há disponibilidade?" (Não → "Orientar agendamento futuro" → evento de fim "Agendamento futuro orientado"; Sim → segue para check-in).
  - Sim → **[Recepção]** "Confirmar identidade e realizar check-in".
- **[Recepção]** Gateway XOR "Há pendências administrativas?"
  - Sim → **[Paciente]** "Regularizar pendência" → retorna ao check-in.
  - Não → **[Sistema]** tarefa de serviço "Atualizar status para 'aguardando atendimento' e notificar o profissional".

### Etapa C — Realização e encerramento da consulta

- **[Profissional de Saúde]** Evento intermediário de mensagem: "Notificação de paciente aguardando".
- **[Profissional de Saúde]** Tarefa de usuário: "Realizar atendimento clínico".
- **[Profissional de Saúde]** Tarefa de usuário: "Registrar informações no prontuário eletrônico".
- **[Profissional de Saúde]** Tarefa de usuário: "Registrar encerramento do atendimento".
- **[Sistema]** Gateway XOR "Há necessidade de exames ou retorno?"
  - **Exames** → gateway XOR "Exame na própria clínica ou em laboratório parceiro?"
    - Parceiro → **[Sistema]** "Encaminhar solicitação de exame" → fluxo de mensagem para a piscina "Laboratório Parceiro" ("Receber solicitação e realizar procedimento") → retorno por mensagem → "Informar o paciente sobre os procedimentos".
    - Própria clínica → **[Sistema]** "Agendar exame interno".
  - **Retorno** → **[Sistema]** "Registrar solicitação de retorno vinculada ao atendimento anterior".
  - **Nenhum** → segue direto para a Etapa D.
  - *(Os três caminhos convergem na Etapa D.)*

### Etapa D — Financeiro e encerramento administrativo

- **[Sistema]** Tarefa de serviço: "Verificar situação financeira do atendimento".
- **[Financeiro]** Gateway XOR "Convênio ou particular?"
  - Convênio → **[Financeiro]** "Registrar dados para faturamento junto à operadora" → fluxo de mensagem para "Operadora de Convênio".
  - Particular → gateway XOR "Pagamento pendente?"
    - Sim → **[Financeiro]** "Disponibilizar informações para regularização" → **[Paciente]** "Efetuar pagamento" → **[Financeiro]** "Registrar confirmação".
    - Não → converge.
- **[Financeiro]** Gateway XOR "Há divergência de cobrança?"
  - Sim → **[Financeiro]** "Analisar e corrigir divergência" → retorna à verificação.
  - Não → segue.
- **[Sistema]** Tarefa de serviço: "Atualizar status para 'encerrado', preservar registros e disponibilizar documentos ao paciente".
- **[Sistema]** Evento de fim: "Atendimento encerrado".

### Fluxo de ausência (no-show)

- A partir do evento de temporizador "Dia da consulta", caminho alternativo: **[Sistema]** gateway XOR "Paciente compareceu?" → Não → **[Sistema]** "Registrar ausência e encaminhar ao fluxo de faltas" → evento de fim "Ausência registrada".

### Fluxo de cancelamento / reagendamento (desafio adicional)

- **[Paciente]** Evento intermediário de mensagem anexado (boundary event) na espera entre a confirmação e o dia da consulta: "Solicitação de cancelamento ou reagendamento".
- **[Sistema]** Tarefa de serviço: "Liberar horário anteriormente bloqueado na agenda".
- **[Sistema]** Gateway XOR "Cancelar ou reagendar?"
  - Cancelar → **[Sistema]** "Notificar cancelamento ao paciente" (mensagem para "Serviço de Notificação") → evento de fim "Agendamento cancelado".
  - Reagendar → **[Sistema]** "Buscar nova disponibilidade" → retorna para "Escolher data, horário e profissional" → **[Sistema]** "Enviar confirmação atualizada ao paciente" (mensagem para "Serviço de Notificação").

## EVENTOS DE FIM

Exatamente estes, todos visíveis no diagrama:

"Atendimento encerrado", "Agendamento cancelado", "Ausência registrada", "Agendamento futuro orientado".

## ESTILO VISUAL

- Fundo branco, estilo limpo e acadêmico, adequado para impressão e apresentação.
- Uma cor suave distinta por raia (tons pastel), com o cabeçalho de cada raia em faixa vertical à esquerda, texto na vertical.
- Tarefas: retângulos de cantos arredondados, borda cinza-escura, preenchimento claro.
- Gateways em amarelo claro; eventos de início em verde, intermediários em amarelo/azul, de fim em vermelho.
- Rótulos curtos e legíveis (máximo ~5 palavras por tarefa); nenhum texto sobreposto a conectores; evite cruzamento de linhas sempre que possível.
- Inclua uma legenda no canto inferior com os símbolos utilizados (evento, tarefa de usuário, tarefa de serviço, gateway XOR, fluxo de sequência, fluxo de mensagem).

---

## Observação sobre as raias

O enunciado da atividade pede 7 raias (incluindo convênio e laboratório), mas também pede fluxos de mensagem entre a clínica, a operadora e o laboratório — e, em BPMN estrito, fluxo de mensagem só existe entre piscinas diferentes. Este prompt resolve isso com **5 raias internas + 3 piscinas externas**, que é a modelagem tecnicamente correta.

Se o professor exigir literalmente as 7 raias em uma única piscina, substitua a seção "ESTRUTURA DE PISCINAS E RAIAS" por:

> Piscina única "Clínica Médica" com 7 raias: Paciente, Sistema de Gestão, Recepção, Profissional de Saúde, Operadora de Convênio, Setor Financeiro e Laboratório Parceiro. Use fluxos de sequência entre todas as raias e represente o Serviço de Notificação como piscina externa ligada por fluxos de mensagem.
