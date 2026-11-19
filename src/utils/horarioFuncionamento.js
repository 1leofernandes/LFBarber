/** Horário de funcionamento da barbearia (hardcoded; independente de configs do banco). */

const INTERVALO_SLOT_PADRAO = 30;
const FECHAMENTO_MIN = 20 * 60;

function parseDataISOLocal(dataStr) {
    if (!dataStr) return null;
    const iso = typeof dataStr === 'string' ? dataStr.split('T')[0] : null;
    if (!iso) return new Date(dataStr);
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return new Date(dataStr);
    return new Date(y, m - 1, d);
}

function getDiaSemanaLocal(dataStr) {
    const data = parseDataISOLocal(dataStr);
    return data ? data.getDay() : new Date(dataStr).getDay();
}

function getLimitesFuncionamento(dataStr) {
    const dia = getDiaSemanaLocal(dataStr);
    if (dia === 0) return null;
    if (dia === 6) {
        return { inicioMin: 8 * 60, fimMin: FECHAMENTO_MIN, label: '08:00 - 20:00' };
    }
    return { inicioMin: 9 * 60, fimMin: FECHAMENTO_MIN, label: '09:00 - 20:00' };
}

function converterParaMinutos(horario) {
    if (!horario) return 0;
    const [horas, minutos] = horario.split(':').map(Number);
    return horas * 60 + (minutos || 0);
}

function formatarMinutosParaHorario(minutos) {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function adicionarMinutosAoHorario(horario, minutosAdicionar) {
    const total = converterParaMinutos(horario) + minutosAdicionar;
    return formatarMinutosParaHorario(total);
}

/**
 * Gera slots de início possíveis: início + duracaoMinutos não pode ultrapassar o fechamento.
 */
function gerarSlotsPadrao(dataStr, duracaoMinutos = INTERVALO_SLOT_PADRAO) {
    const limites = getLimitesFuncionamento(dataStr);
    if (!limites) return [];

    const duracao = Math.max(1, parseInt(duracaoMinutos, 10) || INTERVALO_SLOT_PADRAO);
    const horarios = [];

    for (let minutos = limites.inicioMin; minutos + duracao <= limites.fimMin; minutos += INTERVALO_SLOT_PADRAO) {
        horarios.push(formatarMinutosParaHorario(minutos));
    }

    return horarios;
}

function validarIntervaloAgendamento(dataStr, horaInicio, horaFim) {
    const limites = getLimitesFuncionamento(dataStr);
    if (!limites) {
        const err = new Error('Barbearia fechada neste dia');
        err.code = 'FORA_FUNCIONAMENTO';
        throw err;
    }

    const inicioMin = converterParaMinutos(horaInicio);
    const fimMin = converterParaMinutos(horaFim);

    if (inicioMin < limites.inicioMin) {
        const err = new Error(`Horário de início antes da abertura (${limites.label})`);
        err.code = 'FORA_FUNCIONAMENTO';
        throw err;
    }

    if (fimMin > limites.fimMin) {
        const err = new Error('O horário do serviço excede o encerramento às 20:00');
        err.code = 'FORA_FUNCIONAMENTO';
        throw err;
    }

    if (fimMin <= inicioMin) {
        throw new Error('Hora de término deve ser após o horário de início');
    }

    return true;
}

function mensagemFuncionamentoParaData(dataStr) {
    const limites = getLimitesFuncionamento(dataStr);
    if (!limites) return 'Domingo: fechado';
    return limites.label;
}

module.exports = {
    INTERVALO_SLOT_PADRAO,
    FECHAMENTO_MIN,
    parseDataISOLocal,
    getDiaSemanaLocal,
    getLimitesFuncionamento,
    converterParaMinutos,
    formatarMinutosParaHorario,
    adicionarMinutosAoHorario,
    gerarSlotsPadrao,
    validarIntervaloAgendamento,
    mensagemFuncionamentoParaData
};