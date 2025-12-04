import { NpcEvent } from '../types';

export const NPC_EVENTS: NpcEvent[] = [
    {
        id: 'angel_investor',
        npcName: "Sr. Monopoly",
        npcAvatar: "🧐",
        dialogue: "Veo potencial en tu operación. Te ofrezco $5,000 ahora mismo. A cambio, quiero el 5% de tus futuras ganancias mineras (permanente).",
        options: [
            { text: "Aceptar Trato", risk: 'low', actionId: 'accept_angel' },
            { text: "Rechazar", risk: 'none', actionId: 'reject' }
        ]
    },
    {
        id: 'shady_dealer',
        npcName: "El 'Tecnólogo'",
        npcAvatar: "🕵️‍♂️",
        dialogue: "Psst. Tengo una GPU prototipo militar. Es inestable, pero mina como una bestia. ¿La quieres por $500? Normalmente vale $5000.",
        options: [
            { text: "Comprar ($500)", risk: 'high', actionId: 'buy_black_market' },
            { text: "No gracias, valoro mi oficina", risk: 'none', actionId: 'reject' }
        ]
    },
    {
        id: 'tax_audit',
        npcName: "Agente Smith (Hacienda)",
        npcAvatar: "🕶️",
        dialogue: "Auditoría sorpresa. Hemos detectado movimientos inusuales. Paga una multa de regularización de $2,000 o congelaremos tus activos para investigar.",
        options: [
            { text: "Pagar Multa (-$2000)", risk: 'low', actionId: 'pay_taxes' },
            { text: "¡Intentad atraparme! (Huir)", risk: 'high', actionId: 'evade_taxes' }
        ]
    }
];