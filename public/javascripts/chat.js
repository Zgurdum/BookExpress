const socket = io();

// Čekamo da se cijela stranica učita
document.addEventListener('DOMContentLoaded', () => {
    console.log("Chat.js spreman!");

    // 
    const roomIdElement = document.getElementById('roomId');
    const mojIdElement = document.getElementById('myId'); 
    const sendBtn = document.getElementById('send-btn');  
    const messageInput = document.getElementById('message-input');
    const chatWindow = document.getElementById('chat-messages'); 

    if (!roomIdElement || !mojIdElement) {
        console.warn("Nismo u aktivnom chatu, roomId ili mojId nedostaju.");
        return; // Prekini izvršavanje ako nismo na chat stranici
    }

    const roomId = roomIdElement.value;
    const mojId = mojIdElement.value;

    // Pridruživanje sobi
    socket.emit('join_room', roomId);
    console.log("Ušao u sobu:", roomId);

    // UGRADJENA SOKET OPCIJA ZA MARK READ
    socket.emit('mark_messages_read', {
        roomId: roomId,
        senderId: document.getElementById('receiverId')?.value,
        receiverId: mojId
    });

    // FUNCIJA ZA SLANJE
    if (sendBtn) {
        sendBtn.onclick = function() {
            sendMessage();
        };
    }

    // AKO PRITISNES ENTER poslji poruku
    if (messageInput) {
        messageInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }

    function sendMessage() {
        const messageText = messageInput.value;

        if (messageText.trim() !== "") {
            const data = {
                roomId: roomId,
                senderId: mojId,
                text: messageText,
                receiverId: document.getElementById('receiverId')?.value // Dodaj i ovo
            };

            socket.emit('send_message', data);
            messageInput.value = "";
        }
    }

    // 3. Prijem poruke
    socket.on('receive_message', (data) => {
        if (!chatWindow) return;

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper');
        messageWrapper.classList.add(data.senderId == mojId ? 'sent' : 'received');
        
        const timeString = new Date(data.createdAt).toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
        
        let statusHtml = '';
        if (data.senderId == mojId) {
            if (data.procitano) {
                statusHtml = '<span class="status seen">✓✓</span>';
            } else if (data.dostavljeno) {
                statusHtml = '<span class="status delivered">✓</span>';
            }
        }
        
        messageWrapper.innerHTML = `
            <div class="message-bubble">
                ${data.text}
                <div class="message-footer">
                    <div class="message-time">${timeString}</div>
                    ${statusHtml ? `<div class="message-status">${statusHtml}</div>` : ''}
                </div>
            </div>
        `;
        
        chatWindow.appendChild(messageWrapper);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    });

    // kada se poruka procita neophodno je poslat isignal da se to desilo
    socket.on('messages_read', (data) => {
        // Update status of all sent messages to seen
        const sentMessages = chatWindow.querySelectorAll('.message-wrapper.sent');
        sentMessages.forEach(wrapper => {
            const statusDiv = wrapper.querySelector('.message-status');
            if (statusDiv) {
                const statusSpan = statusDiv.querySelector('.status');
                if (statusSpan && !statusSpan.classList.contains('seen')) {
                    statusSpan.classList.remove('delivered');
                    statusSpan.classList.add('seen');
                    statusSpan.textContent = '✓✓';
                }
            }
        });
    });
});