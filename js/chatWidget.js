/**
 * Chat Widget – Arcadio Ramírez Servicio Técnico
 * Conecta con /.netlify/functions/chat (Claude Haiku)
 */
(function () {
    'use strict';

    let chatHistory  = [];
    let isChatOpen   = false;
    let isTyping     = false;
    let welcomeShown = false;

    const WELCOME = 'Hola, bienvenido. ¿Con qué equipo está teniendo problemas — lavadora, nevera o secadora?';
    const QUICK_REPLIES = [
        '🫧 Problema con lavadora',
        '🧊 Problema con nevera',
        '🌀 Problema con secadora',
        '💰 Consultar sobre precios'
    ];

    /* ── helpers ─────────────────────────────────────── */
    function now() {
        return new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    function scrollBottom() {
        const el = document.getElementById('chat-messages');
        if (el) el.scrollTop = el.scrollHeight;
    }

    function addMessage(role, html) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = `chat-msg chat-msg--${role}`;
        div.innerHTML = `<div class="chat-bubble">${html}</div><div class="chat-msg-time">${now()}</div>`;
        container.appendChild(div);
        scrollBottom();
    }

    function addWhatsAppButton(url) {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'chat-msg chat-msg--bot';
        div.innerHTML = `
            <a href="${url}" target="_blank" rel="noopener" class="chat-wa-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.121 1.523 5.855L.057 23.882a.5.5 0 0 0 .61.637l6.228-1.634A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.806 9.806 0 0 1-5.031-1.389l-.361-.214-3.741.981.998-3.648-.235-.374A9.789 9.789 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Enviar solicitud por WhatsApp
            </a>`;
        container.appendChild(div);
        scrollBottom();
    }

    function addQuickReplies() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'chat-suggestions';
        div.id = 'chat-quick-replies';
        QUICK_REPLIES.forEach(label => {
            const btn = document.createElement('button');
            btn.className = 'chat-suggestion-btn';
            btn.textContent = label;
            btn.addEventListener('click', () => {
                div.remove();
                window.sendChatMessage(label);
            });
            div.appendChild(btn);
        });
        container.appendChild(div);
        scrollBottom();
    }

    function showTyping() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        const div = document.createElement('div');
        div.id = 'chat-typing';
        div.className = 'chat-msg chat-msg--bot';
        div.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
        container.appendChild(div);
        scrollBottom();
    }

    function hideTyping() {
        const el = document.getElementById('chat-typing');
        if (el) el.remove();
    }

    /* ── toggle open/close ───────────────────────────── */
    window.toggleChat = function () {
        isChatOpen = !isChatOpen;
        const panel = document.getElementById('chat-panel');
        const dot   = document.getElementById('chat-unread-dot');
        const tip   = document.getElementById('chat-tip');
        if (!panel) return;

        if (isChatOpen) {
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
            if (dot) dot.classList.remove('visible');
            if (tip) tip.classList.remove('visible');

            if (!welcomeShown) {
                welcomeShown = true;
                setTimeout(() => {
                    addMessage('bot', WELCOME);
                    chatHistory.push({ role: 'assistant', content: WELCOME });
                    addQuickReplies();
                }, 280);
            }

            setTimeout(() => {
                const input = document.getElementById('chat-input');
                if (input) input.focus();
            }, 350);
        } else {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        }
    };

    /* ── open chat with pre-filled message ──────────── */
    window.abrirChatConProblema = function (texto) {
        const panel = document.getElementById('chat-panel');
        if (panel && !panel.classList.contains('open')) window.toggleChat();
        setTimeout(function () { window.sendChatMessage(texto); }, 450);
    };

    /* ── send message ────────────────────────────────── */
    window.sendChatMessage = async function (override) {
        const input = document.getElementById('chat-input');
        const text  = (override || (input && input.value) || '').trim();
        if (!text || isTyping) return;
        if (input) input.value = '';

        // Remove lingering quick replies
        const qr = document.getElementById('chat-quick-replies');
        if (qr) qr.remove();

        addMessage('user', escapeHtml(text));
        chatHistory.push({ role: 'user', content: text });

        isTyping = true;
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn) sendBtn.disabled = true;
        showTyping();

        try {
            const res = await fetch('/.netlify/functions/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: chatHistory })
            });

            if (!res.ok) throw new Error('HTTP ' + res.status);
            const data  = await res.json();
            const reply = data.reply || '';

            hideTyping();

            // Detect WhatsApp action JSON from AI (even if comes with text before/after)
            const jsonMatch = reply.match(/\{[^{}]*"action"\s*:\s*"whatsapp"[^{}]*\}/s);
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.action === 'contacto_directo') {
                        const url = 'https://wa.me/573103187093?text=' + encodeURIComponent('Hola, quiero hablar con un técnico de Arcadio Ramírez');
                        addMessage('bot', 'Con gusto. Toque el botón y le atendemos de inmediato por WhatsApp.');
                        addWhatsAppButton(url);
                        chatHistory.push({ role: 'assistant', content: 'Cliente redirigido a WhatsApp para contacto directo.' });
                        isTyping = false;
                        if (sendBtn) sendBtn.disabled = false;
                        return;
                    }

                    if (parsed.action === 'whatsapp') {
                        const waMsg =
                            `*SOLICITUD DE VISITA TÉCNICA*\n` +
                            `_Arcadio Ramírez - Servicio Técnico_\n` +
                            `-----------------------------\n` +
                            `*Nombre:* ${parsed.nombre}\n` +
                            `*Barrio:* ${parsed.barrio}\n` +
                            `*Electrodoméstico:* ${parsed.equipo}\n` +
                            `*Marca:* ${parsed.marca || 'No especificada'}\n` +
                            `*Problema:* ${parsed.problema}\n` +
                            `-----------------------------\n` +
                            `¡Solicito visita técnica a domicilio!`;

                        const url = 'https://wa.me/573103187093?text=' + encodeURIComponent(waMsg);
                        // Si el AI agregó texto antes del JSON, mostrarlo limpio
                        const textoBefore = reply.slice(0, reply.indexOf(jsonMatch[0])).trim();
                        if (textoBefore) addMessage('bot', escapeHtml(textoBefore).replace(/\n/g, '<br>'));
                        addMessage('bot', `Su solicitud está lista. Toque el botón para enviarla por WhatsApp y le confirmamos la visita.`);
                        addWhatsAppButton(url);
                        chatHistory.push({
                            role: 'assistant',
                            content: `Solicitud lista para ${parsed.nombre} en ${parsed.barrio}.`
                        });
                        isTyping = false;
                        if (sendBtn) sendBtn.disabled = false;
                        return;
                    }
                } catch (_) { /* JSON malformed – show as text */ }
            }

            addMessage('bot', escapeHtml(reply).replace(/\n/g, '<br>'));
            chatHistory.push({ role: 'assistant', content: reply });

        } catch (err) {
            hideTyping();
            addMessage('bot', 'Lo sentimos, hubo un error de conexión. Contáctenos directamente al <strong>310 318 7093</strong> o por WhatsApp.');
        }

        isTyping = false;
        if (sendBtn) sendBtn.disabled = false;
    };

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* ── unread dot + proactive tooltip after delay ─── */
    document.addEventListener('DOMContentLoaded', () => {
        // Punto de notificación a los 3s
        setTimeout(() => {
            if (!isChatOpen && !welcomeShown) {
                const dot = document.getElementById('chat-unread-dot');
                if (dot) dot.classList.add('visible');
            }
        }, 3000);

        // Tooltip proactivo a los 7s (desaparece solo a los 14s)
        setTimeout(() => {
            if (!isChatOpen && !welcomeShown) {
                const tip = document.getElementById('chat-tip');
                if (tip) {
                    tip.classList.add('visible');
                    setTimeout(() => tip.classList.remove('visible'), 7000);
                }
            }
        }, 7000);
    });
})();
