
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
    let rankingAnterior = [];
    let historicoUltrapassagens = [];

    // Variáveis globais para o Auto Scroll
    let autoScrollEnabled = false;
    let scrollDirection = 1;
    let isPausedAtEdge = false;

    // Função para trocar o mês
    function mudarMes(mes) {
        modoAtual = mes;

        // Mostra loading e recarrega
        document.getElementById('loading').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';

        updateDashboard();
    }

    // Função auxiliar para baixar e processar um CSV
    async function baixarCSV(url) {
        try {
            const response = await fetch(url);
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

    function detectarUltrapassagens(rankingAtual) {
        if (rankingAnterior.length === 0) {
            rankingAnterior = rankingAtual.map(v => ({ ...v }));
            return;
        }

        const mapaPosicaoAnterior = new Map(rankingAnterior.map((v, i) => [v.nome, i]));

        rankingAtual.forEach((vendedor, posAtual) => {
            const posAnterior = mapaPosicaoAnterior.get(vendedor.nome);
            if (posAnterior !== undefined && posAtual < posAnterior) {
                const ultrapassado = rankingAnterior[posAtual];
                const ultrapassou = vendedor.nome;
                const quemFoiUltrapassado = ultrapassado.nome;

                if (ultrapassou !== quemFoiUltrapassado) {
                    const agora = new Date();
                    const dataFormatada = agora.toLocaleDateString();
                    const evento = {
                        data: dataFormatada,
                        descricao: `🔥 ${ultrapassou} passou ${quemFoiUltrapassado}!`
                    };
                    historicoUltrapassagens.unshift(evento);
                }
            }
        });

        if (historicoUltrapassagens.length > 5) {
            historicoUltrapassagens.pop();
        }

        renderizarHistorico();
        rankingAnterior = rankingAtual.map(v => ({ ...v }));
    }

    function renderizarHistorico() {
        const container = document.getElementById('historico-ultrapassagens');
        if (!container) return;

        if (historicoUltrapassagens.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">Aguardando a primeira ultrapassagem...</p>';
            return;
        }

        const tabelaHtml = `
            <table class="table table-striped table-sm">
                <thead>
                    <tr>
                        <th scope="col">Data</th>
                        <th scope="col">Evento</th>
                    </tr>
                </thead>
                <tbody>
                    ${historicoUltrapassagens.map(item => `
                        <tr>
                            <td>${item.data}</td>
                            <td>${item.descricao}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.innerHTML = tabelaHtml;
    }

    async function updateDashboard() {
        const result = await fetchData();

        document.getElementById('loading').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';

        if (!result) return;

        const { dadosVendedores, totalFaturado } = result;
        const lider = dadosVendedores[0];
        const ultimo = dadosVendedores[dadosVendedores.length - 1];
        const meio = dadosVendedores.length > 2 ? dadosVendedores[Math.floor(dadosVendedores.length / 2)] : null;

        detectarUltrapassagens(dadosVendedores);

        let labelMes = "";
        if(modoAtual === 'geral') labelMes = "Geral (Ano)";
        else if(modoAtual === 'jan') labelMes = "Janeiro";
        else if(modoAtual === 'fev') labelMes = "Fevereiro";
        document.getElementById('kpi-titulo-mes').innerText = `(${labelMes})`;

        document.getElementById('kpi-total').innerText = totalFaturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('kpi-top-vendedor').innerText = lider ? lider.nome : "-";

        const hoje = new Date();
        document.getElementById('data-atualizacao').innerText = hoje.toLocaleDateString() + " " + hoje.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        renderizarCorrida(dadosVendedores);
        renderizarTabela(dadosVendedores);

        const ctxPie = document.getElementById('pieChart').getContext('2d');
        const backgroundColorsPizza = dadosVendedores.map(v => getTeamPattern(ctxPie, v.nome));
        renderPieChart(
            dadosVendedores.map(d => d.nome),
            dadosVendedores.map(d => d.valor),
            backgroundColorsPizza
        );

        gerarNarracao(lider, ultimo, meio);
    }

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
        await updateDashboard();
        dispararConfetes();
        atualizarBotaoScroll();
        setInterval(updateDashboard, 30000);
    }

    function abrirPerfil(nome, valor, index) {
        const posicao = index + 1;
        const n = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        let time = "Time Desconhecido";
        if (n.includes('everton')) time = "Corinthians (Timão)";
        else if (n.includes('maevelim')) time = "Botafogo (Fogão)";
        else if (n.includes('emily')) time = "Palmeiras (Verdão)";
        else if (n.includes('dariele')) time = "Fluminense (Flu)";
        else if (n.includes('bruno')) time = "Flamengo (Mengão)";
        else if (n.includes('marlon')) time = "São Paulo (Tricolor)";

        let fraseSituacao = "";
        let frasesMotivacionais = [];

        if (posicao === 1) {
            fraseSituacao = "👑 O REI DA PISTA! Olhando todo mundo pelo retrovisor!";
            frasesMotivacionais = [
                "O difícil não é chegar no topo, é se manter lá. Continue acelerando!",
                "Você é o alvo agora. Não olhe para trás, olhe para a linha de chegada!",
                "Liderança é atitude. Continue inspirando o time!",
            ];
        } else if (posicao <= 4) {
            fraseSituacao = "🔥 No G4! A liderança é logo ali, acelera!";
            frasesMotivacionais = [
                "Você está na elite! Falta pouco para o topo.",
                "A consistência é a chave. Mantenha o ritmo e ataque na hora certa.",
                "Os campeões são feitos de garra. Você está no caminho certo!",
            ];
        } else if (posicao > totalParticipantes - 4) {
            fraseSituacao = "⚠️ Alerta Z4! Hora de ligar o turbo e sair dessa!";
            frasesMotivacionais = [
                "Não importa como você começa, mas sim como termina.",
                "O fracasso é apenas uma oportunidade para recomeçar com mais inteligência.",
                "A corrida só acaba na bandeirada. Ainda dá tempo de virar o jogo!",
            ];
        } else {
            fraseSituacao = "🚗 No meio do pelotão! É hora de ousar e buscar posições!";
            frasesMotivacionais = [
                "Saia da média! Você tem potencial para muito mais.",
                "O meio da tabela é confortável, mas o topo é onde a mágica acontece.",
                "Um passo de cada vez. A subida é constante.",
            ];
        }

        const fraseMotivacao = frasesMotivacionais[Math.floor(Math.random() * frasesMotivacionais.length)];

        document.getElementById('perfil-nome').innerText = nome;
        document.getElementById('perfil-time').innerText = time;
        document.getElementById('perfil-posicao-badge').innerText = posicao + "º";
        document.getElementById('perfil-frase-situacao').innerText = fraseSituacao;
        document.getElementById('perfil-frase-motivacao').innerText = fraseMotivacao;

        let primeiroNome = nome.trim().split(' ')[0];
        primeiroNome = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();
        primeiroNome = primeiroNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const imgUrl = `assets/Images/Imagens_Cavalinhos/${primeiroNome}.png`;

        const imgEl = document.getElementById('perfil-img');
        imgEl.src = imgUrl;
        imgEl.onerror = function() { this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'; };

        var bsOffcanvas = new bootstrap.Offcanvas(document.getElementById('painelPerfil'));
        bsOffcanvas.show();
    }

    function getTeamPattern(ctx, nome) {
        const n = nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        let colors = [];
        let horizontal = false;

        if (n.includes('everton')) colors = ['#000000', '#FFFFFF'];
        else if (n.includes('maevelim')) {
            colors = ['#000000', '#FFFFFF'];
            horizontal = true;
        }
        else if (n.includes('emily')) colors = ['#006437', '#FFFFFF'];
        else if (n.includes('dariele')) colors = ['#831D1C', '#00913C', '#FFFFFF'];
        else if (n.includes('bruno')) {
            colors = ['#C3281E', '#000000'];
            horizontal = true;
        }
        else if (n.includes('marlon')) {
            colors = ['#FE0000', '#FFFFFF', '#000000'];
            horizontal = true;
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
                pCtx.fillRect(0, i * step, size, step);
            } else {
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

            setTimeout(() => {
                const el = document.getElementById(`cavalinho-${index}`);
                if(el) el.style.left = `${porcentagem}%`;
            }, 100 + (index * 50));
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
             return;
        }

        let frases = [
            `OLHA O QUE ELE FEZ! ${lider.nome} disparou na liderança e não quer saber de conversa!`,
            `Haja coração, amigo! ${lider.nome} está voando baixo na pista!`,
            `É tetra? Não, é ${lider.nome} assumindo a ponta com autoridade!`,
        ];
        if (meio) {
            frases.push(
                `No pelotão do meio, ${meio.nome} segue firme tentando buscar os líderes!`,
                `Olha o ${meio.nome} ali na "meiuca", estudando a melhor hora de atacar!`,
            );
        }
        const fraseSorteada = frases[Math.floor(Math.random() * frases.length)];
        document.getElementById('narracao-texto').innerText = fraseSorteada;
    }

    function renderPieChart(labels, data, backgroundColors) {
        const ctx = document.getElementById('pieChart').getContext('2d');

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
