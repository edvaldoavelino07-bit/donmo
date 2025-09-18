jQuery(document).ready(function($) {
console.log("WhatsApp Widget script carregado com sucesso.");

const showMessageDelay = 3000;       // Delay inicial para exibir a mensagem de abordagem
const hideMessageDelay = 10000;      // Tempo que a mensagem de abordagem fica visível
const repeatInterval = 20000;        // Intervalo para reaparecer a mensagem de abordagem se não houver interação
let userInteracted = false;          // Verifica se houve interação do usuário com o widget
let isMessageVisible = false;        // Controla se a mensagem de abordagem está visível
let currentPhoneNumber = ''; // Variável para armazenar o número enquanto é digitado

// Pega a URL da imagem diretamente do HTML gerado pelo PHP
const profileImageSrc = $('#whatsapp-photo-img').attr('src');  

// Força o ocultamento da mensagem de abordagem no carregamento da página
$('#attendant-message-box').hide();
//console.log("Mensagem de abordagem oculta no carregamento da página.");

// Função para exibir a mensagem de abordagem
function showApproachMessage() {
    //console.log("Função showApproachMessage chamada após o delay configurado.");

    // Evita que a mensagem de abordagem seja exibida novamente se já estiver visível
    if (isMessageVisible) {
        //console.log("A mensagem de abordagem já está visível, não será exibida novamente.");
        return;
    }

    const approachMessage = getRandomMessage('msg_widget_abordagem');
    $('#attendant-message-box p').text(approachMessage);   // Define a mensagem de abordagem
    $('#attendant-message-box').fadeIn();  // Exibe a mensagem
    isMessageVisible = true;  // Marca que a mensagem está visível
    //console.log("Mensagem de abordagem exibida:", approachMessage);

    // Oculta a mensagem após hideMessageDelay se não houver interação
    setTimeout(() => {
        if (!userInteracted && isMessageVisible) {
            $('#attendant-message-box').fadeOut(() => {
                isMessageVisible = false;  // Redefine o estado após ocultar a mensagem
                //console.log("A mensagem de abordagem foi ocultada após o tempo definido.");
            });
        }
    }, hideMessageDelay);
}

// Exibir a mensagem de abordagem após o delay inicial
setTimeout(() => {
    if (!userInteracted) {
        //console.log("Timeout inicial acionado para exibir a mensagem de abordagem após", showMessageDelay, "milissegundos");
        showApproachMessage();
    } else {
        //console.log("Timeout inicial não exibiu mensagem de abordagem devido à interação do usuário.");
    }
}, showMessageDelay);

// Repetir a exibição da mensagem de abordagem a cada repeatInterval, se não houver interação
setInterval(() => {
    //console.log("Intervalo de repetição acionado para a mensagem de abordagem.");
    if (!userInteracted && !isMessageVisible) {
        //console.log("Condições atendidas para exibir a mensagem de abordagem novamente.");
        showApproachMessage();
    } else {
        console.log("Mensagem de abordagem não exibida devido à interação do usuário ou visibilidade atual.");
    }
}, repeatInterval);

// Variável para verificar se a conversa terminou
let conversationEnded = false;

if (typeof whatsappWidgetData === 'undefined') {
    console.error('Dados do widget não encontrados.');
    return;
}

/*if (whatsappWidgetData.photo) {
    $('#whatsapp-photo-img').attr('src', whatsappWidgetData.photo);
}*/

const chatBody = $('#chat-body');
const userInput = $('#user-input');
const typingIndicator = $('#typing-indicator');
let step = 0;
let userName = '';
let userEmail = '';
let userPhone = '';
let userCountry = '';
let countryCode = '';
let userHelpRequest  = '';

function displayMessage(text, sender = 'bot') {
const messageWrapper = $('<div>').addClass('message-wrapper');
const message = $('<div>').addClass('chat-message');

if (sender === 'bot') {
    message.addClass('bot-message');
    

    const profileImage = $('<img>')
        .attr('src', profileImageSrc)  // Usa a URL da imagem do HTML
        .addClass('attendant-photo');
            
    // Adiciona a imagem e a mensagem ao wrapper
    messageWrapper.append(profileImage).append(message);
} else {
    message.addClass('user-message');
    messageWrapper.append(message);
}

const messageContent = $('<p>').text(text);
message.append(messageContent);
chatBody.append(messageWrapper);

// Rola automaticamente para o final do chat
chatBody.animate({ scrollTop: chatBody[0].scrollHeight }, 500);
}

function showTypingIndicator() {
    typingIndicator.appendTo(chatBody);
    typingIndicator.show();
    chatBody.animate({ scrollTop: chatBody[0].scrollHeight }, 500);
}

function hideTypingIndicator() {
    typingIndicator.hide();
}

// Consolidado: Marcar interação do usuário ao clicar no widget e ocultar a mensagem de abordagem
$('#whatsapp-photo').on('click', function() {
    userInteracted = true;
    $('#attendant-message-box').fadeOut();
    isMessageVisible = false; // Redefine para permitir futuras exibições da mensagem de abordagem
    $('#whatsapp-chatbox').fadeIn();    // Exibe a caixa de chat
});

$('#close-chat').on('click', function() {
    $('#whatsapp-chatbox').fadeOut();
});

// Função para validar e processar o número de telefone
function validateAndProcessPhoneNumber(phoneNumber) {
    if (conversationEnded) return; // Verifica se a conversa terminou, evitando processamento adicional

    //console.log("Número recebido para validação:", phoneNumber);
    if (/^\d{11}$/.test(phoneNumber)) { // A validação deve garantir que o número seja composto por 11 dígitos
        userPhone = phoneNumber; 
        userInput.val('');
        $(".error-message").remove();

        // Exibe o número completo com o código do país selecionado
        const fullNumber = `${countryCode.replace('+', '')}${userPhone}`;
        //console.log("Número completo com código do país que será exibido:", fullNumber);
        displayMessage(fullNumber, 'user');
        chatBody.animate({ scrollTop: chatBody[0].scrollHeight }, 500);

        // Salva os dados do usuário
        logUserData(); 

        // Mensagem final
        showTypingIndicator();
        setTimeout(() => {
        const thankYouMessage = getRandomMessage('msg_widget_agradecimento'); // Obtém uma mensagem de agradecimento aleatória
        displayMessage(thankYouMessage, 'bot'); // Exibe a mensagem de agradecimento
        hideTypingIndicator();
        chatBody.animate({ scrollTop: chatBody[0].scrollHeight }, 500);

            conversationEnded = true; // Define a conversa como encerrada após a mensagem final
            //userInput.prop('disabled', true).attr('placeholder', 'Conversa Encerrada'); // Atualiza o placeholder para "Conversa Encerrada"
            userInput.prop('disabled', true).attr('placeholder', whatsappWidgetData.messages.msg_widget_conversa_encerrada[0]);
            $('#send-button').prop('disabled', true); // Desabilita o botão de enviar
        }, 1000);
    } else {
        //console.log("Número inserido não é válido:", phoneNumber);
        //displayErrorMessage("😕 Por favor, insira um número de telefone válido com DDD.");
        displayErrorMessage(whatsappWidgetData.messages.msg_widget_somente_numeros[0] || "😕 Por favor, insira um número de telefone válido com DDD.");
        userInput.val('');
    }
}

// Função para lidar com o envio da mensagem
function handleSendMessage() {
    if (conversationEnded) return; // Verifica se a conversa terminou antes de processar o envio

    const text = userInput.val().trim();
    if (text === '') return; // Não faz nada se o campo estiver vazio

    //console.log("Etapa atual (step):", step);
    //console.log("Mensagem do usuário:", text);

    // Lógica de validação de email e telefone
    if (step === 3) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(text)) {
            //displayErrorMessage("😕 Desculpe, não entendi o seu email. Certifique-se de incluir '@'.");
            displayErrorMessage(whatsappWidgetData.messages.msg_widget_email_invalido[0]);
            userInput.val('');
            return;
        }
        userEmail = text;
        //console.log("Email salvo:", userEmail);
    }

    if (step === 4) {
        // Aqui chamamos a função de validação ao invés de repetir a lógica
        //console.log("Número antes de validar:", text);

        validateAndProcessPhoneNumber(text);
        return; // Impede o processamento adicional se estamos na etapa 3
    }

    displayMessage(text, 'user'); // Exibe a mensagem do usuário
    userInput.val(''); // Limpa o campo de entrada
    processFlow(text); // Chama a função para processar o fluxo
}

// Evento de clique no botão de envio
$('#send-button').on('click', function() {
    //console.log("Botão de envio clicado!"); // Log para verificar
    handleSendMessage(); // Chama a função de envio
});

// Evento de tecla pressionada no input
userInput.on('keypress', function(event) {
    if (conversationEnded) return; // Verifica se a conversa terminou antes de capturar o Enter

    if (event.which === 13) { // Verifica se a tecla pressionada é Enter
        //console.log("Enter pressionado!"); // Log para verificar
        handleSendMessage(); // Chama a função de envio
    }
});

function displayErrorMessage(text) {
    $(".error-message").remove();

    const errorMessage = $('<div>').addClass('error-message').text(text);
    userInput.before(errorMessage);

    errorMessage.css({
        "background-color": "#007bff",
        "color": "#fff",
        "padding": "8px 12px",
        "border-radius": "8px",
        "position": "absolute",
        "bottom": "70px",
        "left": "45%",
        "transform": "translateX(-50%)",
        "font-size": "14px",
        "box-shadow": "0px 4px 6px rgba(0, 0, 0, 0.1)",
        "z-index": "1000",
        "width": "80%",
        "text-align": "center"
    });

    errorMessage.append('<div class="error-arrow"></div>');
    $('.error-arrow').css({
        "position": "absolute",
        "bottom": "-10px",
        "left": "50%",
        "transform": "translateX(-50%)",
        "width": "0",
        "height": "0",
        "border-left": "10px solid transparent",
        "border-right": "10px solid transparent",
        "border-top": "10px solid #007bff"
    });

    setTimeout(function() {
        errorMessage.fadeOut(300, function() {
            $(this).remove();
        });
    }, 3000);
}

function getRandomMessage(category) {
    const messages = whatsappWidgetData.messages[category];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Exibir mensagem de boas-vindas no attendant-message-box
function showWelcomeMessage() {
    const welcomeMessage = getRandomMessage('msg_widget_inicial');
    $('#attendant-message-box p').text(welcomeMessage);
    $('#attendant-message-box').fadeIn();

    // Oculta a mensagem após o tempo definido, se não houver interação
    setTimeout(() => {
        if (!userInteracted) {
            $('#attendant-message-box').fadeOut();
        }
    }, hideMessageDelay);
}

function processFlow(response) {
    showTypingIndicator();
    
    setTimeout(function() {
        hideTypingIndicator();

        // Passo 0: Primeira mensagem de boas-vindas, mensagens iniciais
        if (step === 0) {
            showTypingIndicator();
            setTimeout(() => {
                const initialMessage = getRandomMessage('msg_widget_inicial');
                displayMessage(initialMessage);  // Exibe a mensagem aleatória da categoria inicial
                hideTypingIndicator();
                step++; // Avança para o próximo passo
            }, 1000);
        }
        // Passo 1: O usuário responde como pode ser ajudado e o bot pergunta o nome
        else if (step === 1) {
            userHelpRequest = response; // Armazena a primeira resposta do usuário em userHelpRequest
            showTypingIndicator();
            setTimeout(() => {
                const nameRequestMessage = getRandomMessage('msg_widget_solicitar_nome');
                displayMessage(nameRequestMessage);  // Exibe a mensagem aleatória para solicitar o nome
                hideTypingIndicator();
                step++;
            }, 1000);
        }
        // Passo 2: O usuário responde com o nome e o bot pede o email, incluindo o nome na mensagem
        else if (step === 2) {
            userName = response; // Armazena o nome do usuário
            showTypingIndicator();
            setTimeout(() => {
                // Recupera uma mensagem aleatória da categoria 'msg_widget_solicitar_email' e insere o nome do usuário
                let emailRequestMessage = getRandomMessage('msg_widget_solicitar_email');
                emailRequestMessage = emailRequestMessage.replace('{nome}', userName); // Substitui {nome} pelo nome do usuário
                displayMessage(emailRequestMessage);  // Exibe a mensagem com o nome personalizado
                hideTypingIndicator();
                step++; // Avança para o próximo passo (capturar o email)
            }, 1000);
        }
        // Passo 3: Usuário fornece o email e o bot pergunta sobre o país
        else if (step === 3) {
            showTypingIndicator();
            setTimeout(() => {
                userEmail = response; // Armazena o email do usuário

                const messageWrapper = $('<div>').addClass('message-wrapper');
                const message = $('<div>').addClass('chat-message bot-message');

        const profileImage = $('<img>')
            .attr('src', profileImageSrc)  // Usa a URL da imagem do HTML
            .addClass('attendant-photo');
                const questionText = $('<p>').text(whatsappWidgetData.messages.msg_widget_reside_brasil[0]);

                const checkboxContainer = $('<div>').addClass('checkbox-container');
                const simCheckbox = $('<input type="radio" name="reside-brasil" id="reside-sim" value="sim">');
                const naoCheckbox = $('<input type="radio" name="reside-brasil" id="reside-nao" value="nao">');
                const simLabel = $('<label for="reside-sim">').text(whatsappWidgetData.messages.msg_widget_sim[0]);
                const naoLabel = $('<label for="reside-nao">').text(whatsappWidgetData.messages.msg_widget_nao[0]);

                checkboxContainer.append(simCheckbox, simLabel, naoCheckbox, naoLabel);
                message.append(questionText, checkboxContainer);
                messageWrapper.append(profileImage).append(message);
                chatBody.append(messageWrapper);
                chatBody.animate({ scrollTop: chatBody[0].scrollHeight }, 500);

                hideTypingIndicator();

                checkboxContainer.css({
                    "display": "flex",
                    "gap": "10px",
                    "align-items": "center",
                    "margin-top": "10px"
                });

                checkboxContainer.on('change', 'input[name="reside-brasil"]', function() {
                    const selectedValue = $(this).val();
                    displayMessage(selectedValue === 'sim' ? 'Sim' : 'Não', 'user');
                
                    if (selectedValue === 'sim') {
                        countryCode = '55'; // Define o código do país como 55 para o Brasil
                        showTypingIndicator();
                        setTimeout(() => {
                            //displayMessage("Ah, sim! Você está falando do Brasil. Por favor, informe seu número de telefone com DDD.");
                            displayMessage(whatsappWidgetData.messages.msg_widget_informe_telefone[0]);
                            hideTypingIndicator();
                            checkboxContainer.remove();
                
                            step = 4;
                
                            //userInput.prop('disabled', false).val('').attr('placeholder', 'Digite apenas números');
                            userInput.prop('disabled', false).val('').attr('placeholder', whatsappWidgetData.messages.msg_widget_digite_numeros[0]);


                            // Atualiza o valor do telefone enquanto o usuário digita
                            userInput.on('input', function() {
                                currentPhoneNumber = userInput.val().trim(); // Armazena o valor atual
                                //console.log("Número atualizado:", currentPhoneNumber);
                            });
                            
                            // Captura o evento de Enter
                            userInput.one('keyup', function(event) { // Usando 'one' para garantir que o evento seja tratado apenas uma vez
                                if (event.which === 13 && step === 4) { // Verifica se a tecla Enter foi pressionada
                                    if (currentPhoneNumber !== '') {
                                        //console.log("Número de telefone final digitado:", currentPhoneNumber); // Log para capturar o número
                                        validateAndProcessPhoneNumber(currentPhoneNumber); // Função para processar o número
                                    } else {
                                        //console.log("Nenhum número foi digitado.");
                                        displayErrorMessage("Por favor, insira um número de telefone válido.");
                                    }
                            
                                    //console.log("Entrou na validação!");
                                    event.preventDefault(); // Impede o envio padrão do formulário, se necessário
                                }
                            });
                        }, 1000);
                    } else if (selectedValue === 'nao') {
                        checkboxContainer.remove();
                        showTypingIndicator();
                        setTimeout(() => {
                            const messageWrapper = $('<div>').addClass('message-wrapper');

                            const profileImage = $('<img>')
                                .attr('src', profileImageSrc)  // Usa a URL da imagem do HTML
                                .addClass('attendant-photo');
                                
                            const selectMessage = $('<div>').addClass('chat-message bot-message');
                            //const selectText = $('<p>').text("Por favor, selecione o país de onde você está falando.");
                            const selectText = $('<p>').text(whatsappWidgetData.messages.msg_widget_selecione_pais[0]);
                            const countrySelect = $('<select>').attr('id', 'country-select').append('<option value="">Selecione seu país</option>');

                            selectMessage.append(selectText, countrySelect);
                            messageWrapper.append(profileImage, selectMessage);
                            chatBody.append(messageWrapper);
                            chatBody.animate({ scrollTop: chatBody[0].scrollHeight }, 500);

                            hideTypingIndicator();

                            $.ajax({
                                url: 'https://restcountries.com/v3.1/all',
                                method: 'GET',
                                success: function(data) {
                                    data.sort((a, b) => a.name.common.localeCompare(b.name.common));

                                    data.forEach(country => {
                                        if (country.idd && country.idd.root && country.idd.suffixes) {
                                            const countryCodeOption = `${country.idd.root}${country.idd.suffixes[0]}`.replace(/\+{2}/, '+');
                                            const countryName = country.name.common;
                                            countrySelect.append(`<option value="${countryCodeOption}">${countryName} (${countryCodeOption})</option>`);
                                        }
                                    });
                                    //console.log("Lista de países carregada e ordenada com sucesso.");
                                },
                                error: function() {
                                    console.error("Erro ao carregar lista de países.");
                                }
                            });

                            countrySelect.on('change', function() {
                                const selectedCountry = $(this).val();
                                if (selectedCountry) {
                                    userCountry = $("#country-select option:selected").text();
                                    countryCode = selectedCountry;

                                    showTypingIndicator();
                                    setTimeout(() => {
                                        displayMessage(whatsappWidgetData.messages.msg_widget_informe_telefone_pais[0].replace('{userCountry}', userCountry), 'bot');
                                        //displayMessage(`Você está falando de ${userCountry}. Informe seu número de telefone.`, 'bot');
                                        hideTypingIndicator();
                                        messageWrapper.remove();
                                        //userInput.prop('disabled', false).val('').attr('placeholder', 'Digite apenas números');
                                        userInput.prop('disabled', false).val('').attr('placeholder', whatsappWidgetData.messages.msg_widget_digite_numeros[0]);

                                        step = 4;

                                        userInput.off('keypress');

                                        userInput.on('keypress', function(event) {
                                            if (event.which === 13) {
                                                const phoneNumber = userInput.val().trim();
                                                //console.log("Entrou aqui não:", phoneNumber); // Log para capturar o número
                                                validateAndProcessPhoneNumber(phoneNumber);
                                            }
                                        });
                                    }, 1000);
                                }
                            });
                        }, 1000);
                    }
                });
            }, 1000);
        }
    });
}

function logUserData() {
    //console.log(whatsappWidgetData); // Verifique se o `atendente_id` está presente

    // Verifique se todos os dados necessários estão presentes
    if (!userName || !userEmail || !userPhone || !countryCode || !userHelpRequest) {
        // Logs para verificar qual campo está vazio
        console.error('Dados incompletos. Certifique-se de que todos os dados (nome, email, telefone, código do país e solicitação de ajuda) estão preenchidos.');
        /*console.log('Valores atuais:', {
            userName: userName || 'Vazio',
            userEmail: userEmail || 'Vazio',
            userPhone: userPhone || 'Vazio',
            countryCode: countryCode || 'Vazio',
            userHelpRequest: userHelpRequest || 'Vazio'
        });*/
        return; // Não envia a requisição se os dados estiverem incompletos
    }

    // Função para capturar o valor de um cookie específico
    function getCookieValue(name) {
        const value = document.cookie.split('; ').find(row => row.startsWith(name + '='));
        return value ? decodeURIComponent(value.split('=')[1]) : 'direct';
    }

    // Captura o valor do cookie de origem do tráfego
    const trafficSource = getCookieValue('ninja_rank_origem_trafego');

    // Recupere o atendente_id do atendente selecionado
    const selectedAttendant = whatsappWidgetData.selectedAttendant || {}; // Supondo que o ID do atendente esteja dentro dos dados do widget
    const atendente_id = whatsappWidgetData.atendente_id || null; // Certifique-se de que você está acessando o atendente_id corretamente
    const fluxo_id = whatsappWidgetData.fluxo_id || null; // Certifique-se de que você está acessando o fluxo_id corretamente
    const apiKey = whatsappWidgetData.project_info.api_integracao_app; // Chave da API
    const restUrl = whatsappWidgetData.rest_url; // URL da REST API
    console.log(whatsappWidgetData);

    if (!apiKey || !restUrl) {
        console.error('Erro crítico: Chave de API ou URL da API REST não configuradas.');
        return; // Não envia a requisição sem essas informações
    }

    // Criação do objeto userData com os dados completos, incluindo a origem do tráfego
    const userData = {
        widget_id: whatsappWidgetData.widget_id, // ID do widget
        fluxo_id: fluxo_id, // ID do fluxo (fluxo_id)
        url_conversao: window.location.href, // URL atual da página
        nome_lead: userName, // Nome do usuário
        email_lead: userEmail, // Email do usuário
        whatsapp_lead: countryCode + userPhone, // Telefone com código do país
        msg_lead: userHelpRequest, // Solicitação de ajuda do usuário
        fonte_conversao: 'Ninja Widget WhatsApp',
        fonte_trafego: trafficSource, // Origem do tráfego capturada do cookie
        tipo_conversao: 'Lead',
        valor_conversao: '0.00',
        atendente_id: whatsappWidgetData.atendente_id || null, // Certifique-se de incluir o atendente_id
        api_integracao_app: apiKey // Inclui a chave da API no payload

    };

    // Log dos dados no console para verificação
    console.log('Dados do usuário a serem enviados:', userData);
    
    // Faça a requisição AJAX aqui

       
    // Envio dos dados via POST para o endpoint REST API
    $.ajax({
        url: whatsappWidgetData.rest_url, // URL completa da REST API (deve ser definida no wp_localize_script)
        method: 'POST',
        contentType: 'application/json', // Define o tipo de conteúdo como JSON
        data: JSON.stringify(userData), // Converte o objeto userData para JSON
        success: function (response) {
            console.log('Dados enviados com sucesso:', response); // Exibe a resposta da API no console
        },
        error: function (xhr, status, error) {
            console.error('Erro ao enviar dados:', {
                responseText: xhr.responseText,
                status: status,
                error: error
            });
        }
    });
}
    
    processFlow(); // Continue o fluxo do chat
});