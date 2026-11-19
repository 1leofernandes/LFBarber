/**
 * Horário de funcionamento — espelha src/utils/horarioFuncionamento.js
 */
(function (global) {
    const INTERVALO_SLOT = 30;
    const FECHAMENTO_MIN = 20 * 60;

    function parseDataLocal(dataISO) {
        if (!dataISO) return null;
        const iso = String(dataISO).split('T')[0];
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    function getDiaSemanaLocal(dataISO) {
        const d = parseDataLocal(dataISO);
        return d ? d.getDay() : 0;
    }

    function getLimitesFuncionamento(dataISO) {
        const dia = getDiaSemanaLocal(dataISO);
        if (dia === 0) return null;
        if (dia === 6) return { inicioMin: 8 * 60, fimMin: FECHAMENTO_MIN };
        return { inicioMin: 9 * 60, fimMin: FECHAMENTO_MIN };
    }

    /** Slots possíveis para grade visual (último início 19:30 com serviço de 30 min). */
    function gerarSlotsGradeCompleta() {
        const slots = [];
        for (let min = 8 * 60; min + INTERVALO_SLOT <= FECHAMENTO_MIN; min += INTERVALO_SLOT) {
            const h = Math.floor(min / 60);
            const m = min % 60;
            slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
        return slots;
    }

    global.HorarioFuncionamento = {
        INTERVALO_SLOT,
        parseDataLocal,
        getDiaSemanaLocal,
        getLimitesFuncionamento,
        gerarSlotsGradeCompleta
    };
})(typeof window !== 'undefined' ? window : globalThis);