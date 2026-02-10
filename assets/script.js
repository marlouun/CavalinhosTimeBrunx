
    Chart.register(ChartDataLabels);

    function parseCurrency(value) {
        if (!value || typeof value !== 'string') return 0;
        let s = value.replace(/R\$|\s/g, '').trim();

        const lastDot = s.lastIndexOf('.');
        const lastComma = s.lastIndexOf(',');

        // No separators, just parse
        if (lastDot === -1 && lastComma === -1) {
            return parseFloat(s) || 0;
        }

        // Determine which is the likely decimal separator based on 2 digits for cents
        let decimalSeparator = null;
        if (s.length - lastComma - 1 === 2) {
            decimalSeparator = ',';
        } else if (s.length - lastDot - 1 === 2) {
            decimalSeparator = '.';
        }

        // If we found a likely decimal separator
        if (decimalSeparator === ',') {
            return parseFloat(s.replace(/\./g, '').replace(',', '.'));
        }
        if (decimalSeparator === '.') {
            return parseFloat(s.replace(/,/g, ''));
        }

        // If no clear decimal separator, it's likely an integer with thousands separators.
        // Just remove all separators.
        return parseFloat(s.replace(/[.,]/g, ''));
    }

    // Configuração dos Links por Mês
    const urlsPorMes = {
        'jan': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5Sfa3H9bHcQmlDmKspl0vKiIdYmv1FO8HB_sTINWRUXk05A8M_8EHy7ZAw0Vmt62CqqXX4N54YZ-I/pub?output=csv',
        'fev': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS5Sfa3H9bHcQmlDmKspl0vKiIdYmv1FO8HB_sTINWRUXk05A8M_8EHy7ZAw0Vmt62CqqXX4N54YZ-I/pub?gid=431147865&single=true&output=csv'
    };

    let modoAtual = 'fev'; // Começa em Fevereiro
    let totalParticipantes = 0;
    let chartInstance = null;

    // Variáveis globais para o Auto Scroll
    let autoScrollEnabled = false;
    let scrollDirection = 1;
    let isPausedAtEdge = false;

    // Função para trocar o mês
    function mudarMes(mes) {
        modoAtual = mes;

        // Atualiza botões
        document.querySelectorAll('.btn-mes').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`btn-${mes}`).classList.add('active');

        // Mostra loading e recarrega
        document.getElementById('loading').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';

        updateDashboard();
    }

    // Função auxiliar para baixar e processar um CSV
    async function baixarCSV(url) {
        try {
            let response;
            try {
                response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
                if (!response.ok) throw new Error('Proxy 1 falhou');
            } catch (e) {
                response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
            }

            if (!response.ok) throw new Error('Falha ao baixar');
            const data = await response.text();
            const rows = data.split('\n');
            let resultados = [];

            rows.forEach(row => {
                if (!row || row.trim() === '') return;
                const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

                let nome = cols[0] ? cols[0].replace(/"/g, '').trim() : "";
                let valorString = cols[1] ? cols[1].replace(/"/g, '') : "0";

                const valor = parseCurrency(valorString);

                if (nome && nome.length > 2 && !isNaN(valor) && valor > 0) {
                    resultados.push({ nome: nome, valor: valor });
                }
            });
            return resultados;
        } catch (error) {
            console.error("Erro ao baixar CSV:", url, error);
            return [];
        }
    }

    async function fetchData() {
        try {
            let dadosVendedores = [];
            let totalFaturado = 0;

            if (modoAtual === 'geral') {
                // Modo Geral: Baixa todos e soma
                let mapaVendas = {}; // Objeto para somar: { "Marlon": 5000, "Everton": 3000 }

                const promises = Object.values(urlsPorMes).map(url => baixarCSV(url));
                const resultadosArrays = await Promise.all(promises);

                resultadosArrays.forEach(listaMes => {
                    listaMes.forEach(item => {
                        if (mapaVendas[item.nome]) {
                            mapaVendas[item.nome] += item.valor;
                        } else {
                            mapaVendas[item.nome] = item.valor;
                        }
                    });
                });

                // Converte de volta para array
                for (const [nome, valor] of Object.entries(mapaVendas)) {
                    dadosVendedores.push({ nome, valor });
                    totalFaturado += valor;
                }

            } else {
                // Modo Mês Específico
                const url = urlsPorMes[modoAtual];
                dadosVendedores = await baixarCSV(url);
                dadosVendedores.forEach(d => totalFaturado += d.valor);
            }

            if (dadosVendedores.length === 0) throw new Error("Nenhum dado encontrado.");

            dadosVendedores.sort((a, b) => b.valor - a.valor);
            totalParticipantes = dadosVendedores.length;

            return { dadosVendedores, totalFaturado };

        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            return null;
        }
    }

    async function updateDashboard() {
        const result = await fetchData();

        // Esconde loading e mostra conteúdo
        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';

        if (!result) return;

        const { dadosVendedores, totalFaturado } = result;
        const lider = dadosVendedores[0];
        const ultimo = dadosVendedores[dadosVendedores.length - 1];
        const meio = dadosVendedores.length > 2 ? dadosVendedores[Math.floor(dadosVendedores.length / 2)] : null;

        // Atualiza Título do Mês
        let labelMes = "";
        if(modoAtual === 'geral') labelMes = "Geral (Ano)";
        else if(modoAtual === 'jan') labelMes = "Janeiro";
        else if(modoAtual === 'fev') labelMes = "Fevereiro";
        document.getElementById('kpi-titulo-mes').innerText = `(${labelMes})`;

        // Atualiza KPIs
        document.getElementById('kpi-total').innerText = totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('kpi-top-vendedor').innerText = lider ? lider.nome : "-";

        const hoje = new Date();
        document.getElementById('data-atualizacao').innerText = hoje.toLocaleDateString() + " " + hoje.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        // Atualiza Corrida e Tabela
        renderizarCorrida(dadosVendedores);
        renderizarTabela(dadosVendedores);

        // Atualiza Gráfico
        const ctxPie = document.getElementById('pieChart').getContext('2d');
        const backgroundColorsPizza = dadosVendedores.map(v => getTeamPattern(ctxPie, v.nome));
        renderPieChart(
            dadosVendedores.map(d => d.nome),
            dadosVendedores.map(d => d.valor),
            backgroundColorsPizza
        );

        // Atualiza Narração
        gerarNarracao(lider, ultimo, meio);
    }

    // --- Lógica do Auto Scroll ---
    function toggleAutoScroll() {
        autoScrollEnabled = !autoScrollEnabled;
        atualizarBotaoScroll();

        if (autoScrollEnabled && !isPausedAtEdge) {
            requestAnimationFrame(processarAutoScroll);
        }
    }

    function atualizarBotaoScroll() {
        const btn = document.getElementById('btn-autoscroll');
        if (!btn) return;

        if (autoScrollEnabled) {
            btn.innerHTML = "🔄 Scroll: ON";
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-success');
        } else {
            btn.innerHTML = "🛑 Scroll: OFF";
            btn.classList.remove('btn-success');
            btn.classList.add('btn-danger');
        }
    }

    function processarAutoScroll() {
        if (!autoScrollEnabled) return;
        if (isPausedAtEdge) return;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const currentScroll = window.scrollY;
        const scrollSpeed = 1;

        if (scrollDirection === 1 && currentScroll >= maxScroll - 2) {
            isPausedAtEdge = true;
            setTimeout(() => {
                scrollDirection = -1;
                isPausedAtEdge = false;
                if (autoScrollEnabled) requestAnimationFrame(processarAutoScroll);
            }, 5000);
        } else if (scrollDirection === -1 && currentScroll <= 2) {
            isPausedAtEdge = true;
            setTimeout(() => {
                scrollDirection = 1;
                isPausedAtEdge = false;
                if (autoScrollEnabled) requestAnimationFrame(processarAutoScroll);
            }, 5000);
        } else {
            window.scrollBy(0, scrollDirection * scrollSpeed);
            requestAnimationFrame(processarAutoScroll);
        }
    }

    async function initDashboard() {
        const audio = document.getElementById('startup-sound');
        if (audio) {
            audio.play().catch(e => console.log("Autoplay bloqueado pelo navegador. Interaja com a página para ouvir.", e));
        }

        // Primeira carga
        await updateDashboard();

        // Dispara confetes na primeira vez
        dispararConfetes();

        // Inicializa estado do botão
        atualizarBotaoScroll();

        // Configura atualização automática a cada 30 segundos (30000 ms)
        setInterval(updateDashboard, 30000);
    }

    // --- Lógica do Perfil Lateral ---
    function abrirPerfil(nome, valor, index) {
        const posicao = index + 1;
        const n = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 1. Identificar Time
        let time = "Time Desconhecido";
        if (n.includes('everton')) time = "Corinthians (Timão)";
        else if (n.includes('maevelim')) time = "Botafogo (Fogão)";
        else if (n.includes('emily')) time = "Palmeiras (Verdão)";
        else if (n.includes('dariele')) time = "Fluminense (Flu)";
        else if (n.includes('bruno')) time = "Flamengo (Mengão)";
        else if (n.includes('marlon')) time = "São Paulo (Tricolor)";

        // 2. Frase de Situação (Posição)
        let fraseSituacao = "";
        let frasesMotivacionais = [];

        if (posicao === 1) {
            fraseSituacao = "👑 O REI DA PISTA! Olhando todo mundo pelo retrovisor!";
            frasesMotivacionais = [
                "O difícil não é chegar no topo, é se manter lá. Continue acelerando!",
                "Você é o alvo agora. Não olhe para trás, olhe para a linha de chegada!",
                "Liderança é atitude. Continue inspirando o time!",
                "O sucesso é alugado, e o aluguel vence todo dia. Pague o preço!",
                "Mantenha a humildade e a fome de vencer. O topo é seu lugar!",
                "Quem está na frente dita o ritmo. Mostre como se faz!",
                "A vista é linda daqui de cima, mas não tire os olhos da pista.",
                "Campeão não é quem vence uma vez, é quem vence sempre. Foco!",
                "Você está voando! Mantenha o pé no acelerador.",
                "A concorrência está babando, mas a taça é sua se continuar assim!"
            ];
        } else if (posicao <= 4) {
            fraseSituacao = "🔥 No G4! A liderança é logo ali, acelera!";
            frasesMotivacionais = [
                "Você está na elite! Falta pouco para o topo.",
                "A consistência é a chave. Mantenha o ritmo e ataque na hora certa.",
                "Os campeões são feitos de garra. Você está no caminho certo!",
                "Mire na lua. Se errar, ainda estará entre as estrelas.",
                "Não diminua a meta, aumente o esforço. O líder que se cuide!",
                "Lugar de craque é no pódio. Não aceite menos que isso.",
                "Você está respirando no cangote do líder. Vai pra cima!",
                "A diferença entre o 2º e o 1º é apenas um sprint final.",
                "Mantenha o foco. O troféu está ao alcance das mãos.",
                "Você já provou que é bom. Agora prove que é o melhor."
            ];
        } else if (posicao > totalParticipantes - 4) {
            fraseSituacao = "⚠️ Alerta Z4! Hora de ligar o turbo e sair dessa!";
            frasesMotivacionais = [
                "Não importa como você começa, mas sim como termina.",
                "O fracasso é apenas uma oportunidade para recomeçar com mais inteligência.",
                "A corrida só acaba na bandeirada. Ainda dá tempo de virar o jogo!",
                "Levanta a cabeça! Sua maior vitória será a sua virada.",
                "Foguete não tem ré, mas às vezes precisa de um ajuste na rota. Vamos!",
                "Acredite no seu potencial, a recuperação começa agora!",
                "O fundo do poço tem mola. Use-a para subir!",
                "Transforme a pressão em combustível. Mostre sua força!",
                "Não é sobre quantas vezes você cai, mas quantas levanta.",
                "Ainda tem muita pista pela frente. Acelera e surpreenda!"
            ];
        } else {
            fraseSituacao = "🚗 No meio do pelotão! É hora de ousar e buscar posições!";
            frasesMotivacionais = [
                "Saia da média! Você tem potencial para muito mais.",
                "O meio da tabela é confortável, mas o topo é onde a mágica acontece.",
                "Um passo de cada vez. A subida é constante.",
                "Transforme sua vontade em potência. Acelera!",
                "Não se contente com o 'bom'. Busque o 'extraordinário'.",
                "A diferença entre o possível e o impossível está na sua determinação.",
                "Chega de passeio! Hora de ligar o modo turbo.",
                "Você não treinou para ser coadjuvante. Assuma o protagonismo!",
                "Surpreenda a todos. Ninguém espera um ataque agora!",
                "O conforto é o inimigo do progresso. Vamos subir!"
            ];
        }

        // 3. Sorteia Frase Motivacional Específica
        const fraseMotivacao = frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];

        // 4. Preencher HTML
        document.getElementById('perfil-nome').innerText = nome;
        document.getElementById('perfil-time').innerText = time;
        document.getElementById('perfil-posicao-badge').innerText = posicao + "º";
        document.getElementById('perfil-frase-situacao').innerText = fraseSituacao;
        document.getElementById('perfil-frase-motivacao').innerText = fraseMotivacao;

        // Imagem
        let primeiroNome = nome.trim().split(' ')[0];
        primeiroNome = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
        primeiroNome = primeiroNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const imgUrl = `assets/Images/Imagens_Cavalinhos/${primeiroNome}.png`;

        const imgEl = document.getElementById('perfil-img');
        imgEl.src = imgUrl;
        imgEl.onerror = function() { this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'; };

        // 5. Abrir Offcanvas
        var bsOffcanvas = new bootstrap.Offcanvas(document.getElementById('painelPerfil'));
        bsOffcanvas.show();
    }

    function getTeamPattern(ctx, nome) {
        const n = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let colors = [];
        let horizontal = false; // Flag para listras horizontais

        if (n.includes('everton')) colors = ['#000000', '#FFFFFF'];
        else if (n.includes('maevelim')) {
            colors = ['#000000', '#FFFFFF'];
            horizontal = true; // Maevelim (Botafogo) com listras horizontais
        }
        else if (n.includes('emily')) colors = ['#006437', '#FFFFFF'];
        else if (n.includes('dariele')) colors = ['#831D1C', '#00913C', '#FFFFFF'];
        else if (n.includes('bruno')) {
            colors = ['#C3281E', '#000000'];
            horizontal = true; // Bruno (Flamengo) com listras horizontais
        }
        else if (n.includes('marlon')) {
            colors = ['#FE0000', '#FFFFFF', '#000000'];
            horizontal = true; // Marlon (São Paulo) com listras horizontais
        }
        else {
             const defaultColors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
             return defaultColors[Math.floor(Math.random() * defaultColors.length)];
        }

        const patternCanvas = document.createElement('canvas');
        const size = 20;
        patternCanvas.width = size;
        patternCanvas.height = size;
        const pCtx = patternCanvas.getContext('2d');
        const step = size / colors.length;

        colors.forEach((color, i) => {
            pCtx.fillStyle = color;
            if (horizontal) {
                // Desenha listras horizontais
                pCtx.fillRect(0, i * step, size, step);
            } else {
                // Desenha listras verticais (padrão)
                pCtx.fillRect(i * step, 0, step, size);
            }
        });

        return ctx.createPattern(patternCanvas, 'repeat');
    }

    function dispararConfetes() {
        var duration = 3 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        function randomInRange(min, max) { return Math.random() * (max - min) + min; }
        var interval = setInterval(function() {
          var timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          var particleCount = 50 * (timeLeft / duration);
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
          confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    function renderizarCorrida(vendedores) {
        const container = document.getElementById('pista-corrida');
        container.innerHTML = '<div class="linha-chegada"></div>';
        const maiorValor = vendedores.length > 0 ? vendedores[0].valor : 1;

        vendedores.forEach((vendedor, index) => {
            let porcentagem = (vendedor.valor / maiorValor) * 100;
            if(porcentagem > 95) porcentagem = 95;

            let primeiroNome = vendedor.nome.trim().split(' ')[0];
            primeiroNome = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
            primeiroNome = primeiroNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const nomeArquivo = primeiroNome + '.png';

            // Inicializa com left: 0% para animação
            const raiaHtml = `
                <div class="raia">
                    <div class="nome-vendedor" title="${vendedor.nome}">${vendedor.nome}</div>
                    <div class="trilho">
                        <div class="cavalinho-wrapper" id="cavalinho-${index}" style="left: 0%; cursor: pointer;"
                             onclick="abrirPerfil('${vendedor.nome}', ${vendedor.valor}, ${index})">
                            <div class="valor-atual">${vendedor.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumSignificantDigits: 3 })}</div>
                            <img src="assets/Images/Imagens_Cavalinhos/${nomeArquivo}" class="avatar-img" alt="${vendedor.nome}"
                                 onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png';">
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', raiaHtml);

            // Dispara a animação após um breve delay
            setTimeout(() => {
                const el = document.getElementById(`cavalinho-${index}`);
                if(el) el.style.left = `${porcentagem}%`;
            }, 100 + (index * 50)); // Pequeno delay escalonado para efeito visual
        });
    }

    function renderizarTabela(vendedores) {
        const tbody = document.querySelector('#tabela-classificacao tbody');
        tbody.innerHTML = '';

        vendedores.forEach((vendedor, index) => {
            const posicao = index + 1;
            let primeiroNome = vendedor.nome.trim().split(' ')[0];
            primeiroNome = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
            primeiroNome = primeiroNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const nomeArquivo = primeiroNome + '.png';

            let badgeColor = '#6c757d';
            if (posicao <= 4) badgeColor = '#28a745';
            else if (posicao > vendedores.length - 4) badgeColor = '#dc3545';

            const row = `
                <tr style="cursor: pointer;" onclick="abrirPerfil('${vendedor.nome}', ${vendedor.valor}, ${index})">
                    <td class="text-center">
                        <span class="posicao-badge" style="background-color: ${badgeColor}">${posicao}º</span>
                    </td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="assets/Images/Imagens_Cavalinhos/${nomeArquivo}"
                                 class="rounded-circle border border-2 border-dark me-3"
                                 style="width: 45px; height: 45px; object-fit: cover; background: #fff;"
                                 onerror="this.onerror=null; this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png';">
                            <span class="fw-bold fs-5" style="font-family: 'Bangers'; letter-spacing: 1px;">${vendedor.nome}</span>
                        </div>
                    </td>
                    <td class="text-end fw-bold fs-5" style="font-family: 'Fredoka'; color: #333;">
                        ${vendedor.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    }

    function gerarNarracao(lider, ultimo, meio) {
        if (!lider && !ultimo && !meio) {
             // Se chamado sem argumentos, tenta pegar do DOM ou apenas retorna
             // Aqui vamos apenas garantir que não quebre
             return;
        }

        let frases = [
            `OLHA O QUE ELE FEZ! ${lider.nome} disparou na liderança e não quer saber de conversa!`,
            `Haja coração, amigo! ${lider.nome} está voando baixo na pista!`,
            `É tetra? Não, é ${lider.nome} assumindo a ponta com autoridade!`,
            `Quem segura ${lider.nome}? O motor tá turbinado hoje!`,
            `Lá vem ${lider.nome}, descendo a ladeira e atropelando a concorrência!`,
            `Pode isso, Arnaldo? ${lider.nome} tá jogando muito!`,
            `Alô, mamãe! ${lider.nome} tá na frente e mandou avisar que hoje tem!`,
            `Apertem os cintos! ${lider.nome} ligou o nitro!`,
            `Que arrancada espetacular de ${lider.nome}! Ninguém pega!`,
            `Segura o homem! ${lider.nome} tá impossível hoje!`,
            `E lá atrás... ${ultimo.nome} vem num ritmo de passeio no parque com a tartaruga! 🐢`,
            `Atenção ${ultimo.nome}! A tartaruga tá pedindo passagem!`,
            `Será que ${ultimo.nome} esqueceu de tirar o freio de mão?`,
            `Alguém avisa o ${ultimo.nome} que a corrida já começou!`,
            `Vixi! ${ultimo.nome} tá mais devagar que internet discada!`
        ];
        if (meio) {
            frases.push(
                `No pelotão do meio, ${meio.nome} segue firme tentando buscar os líderes!`,
                `Olha o ${meio.nome} ali na "meiuca", estudando a melhor hora de atacar!`,
                `Nem em primeiro, nem em último: ${meio.nome} mantém a regularidade no meio da tabela.`,
                `A briga tá boa no meio do grid com ${meio.nome} disputando posição!`
            );
        }
        const fraseSorteada = frases[Math.floor(Math.random() * frases.length)];
        document.getElementById('narracao-texto').innerText = fraseSorteada;
    }

    function renderPieChart(labels, data, backgroundColors) {
        const ctx = document.getElementById('pieChart').getContext('2d');

        // Destrói o gráfico anterior se existir
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                    hoverOffset: 4,
                    borderColor: '#000',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 15, font: { size: 14, family: 'Fredoka' }, color: '#333' }
                    },
                    datalabels: {
                        color: '#fff',
                        textStrokeColor: '#000',
                        textStrokeWidth: 4,
                        font: { weight: 'bold', size: 16, family: 'Fredoka' },
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.map(data => { sum += data; });
                            let percentage = (value * 100 / sum).toFixed(1) + "%";
                            return percentage;
                        },
                        display: function(context) {
                            var dataset = context.dataset;
                            var value = dataset.data[context.dataIndex];
                            var total = dataset.data.reduce((a, b) => a + b, 0);
                            var percentage = (value / total) * 100;
                            return percentage > 5;
                        }
                    }
                }
            }
        });
    }

    window.onload = initDashboard;
