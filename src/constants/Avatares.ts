// Mapeamento de avatares por ID
// Centralizado aqui para evitar duplicação entre as telas

export const AVATARES_DISPONIVEIS = [
    { id: '1', imagem: require('../assets/img/cachorro-01.jpg') },
    { id: '2', imagem: require('../assets/img/cachorro-02.jpg') },
    { id: '3', imagem: require('../assets/img/gato-01.jpg') },
    { id: '4', imagem: require('../assets/img/gato-02.jpg') },
    { id: '5', imagem: require('../assets/img/coelho.jpg') },
];

// Mesmo mapeamento em formato Record para acesso rápido por ID
export const AVATARES_POR_ID: Record<string, any> = {
    '1': require('../assets/img/cachorro-01.jpg'),
    '2': require('../assets/img/cachorro-02.jpg'),
    '3': require('../assets/img/gato-01.jpg'),
    '4': require('../assets/img/gato-02.jpg'),
    '5': require('../assets/img/coelho.jpg'),
};

/**
 * Retorna a imagem do avatar pelo ID.
 * Útil para componentes que precisam resolver o avatar a partir de um Pet.
 */
export const getAvatarById = (avatarId?: string) => {
    if (avatarId && AVATARES_POR_ID[avatarId]) return AVATARES_POR_ID[avatarId];
    return null;
};
