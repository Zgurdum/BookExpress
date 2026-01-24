const messagesService = require('../Services/messagesService');

// izvlacim jedinstvene sagovornike
function getUniqueConversations(poruke, mojId) {
    const usersMap = new Map();

    poruke.forEach(p => {
        // Ako sam ja poslao, sagovornik je primalac, i obrnuto
        const sagovornik = p.posiljalac_id === mojId ? p.Primalac : p.Posiljalac;
        
        if (sagovornik && !usersMap.has(sagovornik.id)) {
            usersMap.set(sagovornik.id, {
                id: sagovornik.id,
                ime: sagovornik.ime,
                prezime: sagovornik.prezime,
                profilna_slika_url: sagovornik.profilna_slika_url,
                zadnja_poruka: p.tekst
            });
        }
    });
    return Array.from(usersMap.values());
}

exports.renderMessagesPage = async (req, res) => {
    try {
        const mojId = req.session.user.id;
        //chat
        const poruke = await messagesService.getAllMessagesForUser(mojId);
        //sidebar
        const conversations = getUniqueConversations(poruke, mojId);

        res.render('messages', {
            conversations: conversations, 
            selectedConversation: null,
            user: req.session.user,
            roomId: null,
            messages: []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Greška pri učitavanju inboxa.");
    }
};

exports.openChat = async (req, res) => {
    try {
        const mojId = req.session.user.id;
        const receiverId = parseInt(req.params.receiverId);

        const sagovornik = await messagesService.getUserById(receiverId);

        // Sve ono sa lijeve strane
        const svePoruke = await messagesService.getAllMessagesForUser(mojId);
        const conversations = getUniqueConversations(svePoruke, mojId);

        // Sve poruke u jednom chatu
        const history = await messagesService.getConversationHistory(mojId, receiverId);

        // Oznaci poruku procitanom
        await messagesService.markMessagesAsRead(receiverId, mojId);

        // Generacija room_ida ovo socket koristi da zna ko sa kim prica
        const ids = [mojId, receiverId].sort((a, b) => a - b);
        const roomId = `room_${ids[0]}_${ids[1]}`;

        res.render('messages', {
            conversations: conversations,
            selectedConversation: receiverId,
            user: req.session.user,
            receiverId: receiverId,
            sagovornik: sagovornik,
            roomId: roomId,
            messages: history
        });
    } catch (err) {
        console.error("Greška u openChat:", err);
        res.status(500).send("Greška pri otvaranju razgovora.");
    }
};