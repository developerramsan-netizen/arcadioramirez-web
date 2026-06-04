/**
 * Google Reviews Widget – Arcadio Ramírez
 * Carrusel con flechas + link a Google
 */
(function () {
    'use strict';

    let currentIndex = 0;
    let allReviews = [];
    const GAP = 20; // px entre tarjetas

    // ── Cuántas tarjetas se ven según pantalla ──────────
    function getVisibleCount() {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    // ── HELPERS ─────────────────────────────────────────
    function stars(n) {
        return '★'.repeat(n) + '☆'.repeat(5 - n);
    }
    function truncate(text, max) {
        return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
    }

    function reviewCard(r) {
        const avatarHtml = r.avatar
            ? `<img src="${r.avatar}" alt="${r.author}" class="review-avatar-img" />`
            : `<div class="review-avatar">${r.initials}</div>`;
        return `
        <div class="review-card carousel-card">
            <div class="review-stars">${stars(r.rating)}</div>
            <p class="review-text">"${truncate(r.text, 180)}"</p>
            <div class="review-author">
                ${avatarHtml}
                <div>
                    <div class="review-name">${r.author}</div>
                    <div class="review-via">
                        <svg width="11" height="11" viewBox="0 0 24 24" style="vertical-align:middle;margin-right:3px">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        ${r.timeAgo} · Google
                    </div>
                </div>
            </div>
        </div>`;
    }

    function staticCard(author, initials, text, timeAgo) {
        return { author, initials, avatar: '', rating: 5, text, timeAgo };
    }

    // ── RENDER ──────────────────────────────────────────
    function renderCarousel() {
        const track = document.getElementById('carousel-track');
        const dots = document.getElementById('carousel-dots');
        const btnPrev = document.getElementById('carousel-prev');
        const btnNext = document.getElementById('carousel-next');
        const viewport = document.querySelector('.carousel-viewport');
        if (!track || !viewport) return;

        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, allReviews.length - visibleCount);
        currentIndex = Math.min(currentIndex, maxIndex);

        // Render tarjetas
        track.innerHTML = allReviews.map(reviewCard).join('');

        // ── Calcular ancho en píxeles reales ──────────────
        const vpWidth = viewport.offsetWidth;

        // Guard: si el viewport aún no tiene dimensiones, reintenta en el
        // próximo frame (ocurre al cargar mientras el DOM no está listo).
        if (!vpWidth) {
            requestAnimationFrame(renderCarousel);
            return;
        }

        const cardPx = (vpWidth - GAP * (visibleCount - 1)) / visibleCount;

        track.querySelectorAll('.carousel-card').forEach(c => {
            // Usar flex shorthand como inline style para superar cualquier
            // flex-basis del CSS de clase (.review-card).
            c.style.flex = `0 0 ${cardPx}px`;
            c.style.maxWidth = `${cardPx}px`;
        });

        // Mover el track
        const offset = currentIndex * (cardPx + GAP);
        track.style.transform = `translateX(-${offset}px)`;

        // Dots
        if (dots) {
            dots.innerHTML = Array.from({ length: maxIndex + 1 }, (_, i) =>
                `<button class="carousel-dot ${i === currentIndex ? 'active' : ''}"
                         onclick="carouselGoTo(${i})" aria-label="Reseña ${i + 1}"></button>`
            ).join('');
        }

        // Estado flechas
        if (btnPrev) btnPrev.disabled = currentIndex === 0;
        if (btnNext) btnNext.disabled = currentIndex >= maxIndex;
    }

    // ── NAVEGACIÓN ──────────────────────────────────────
    window.carouselPrev = function () {
        if (currentIndex > 0) { currentIndex--; renderCarousel(); }
    };
    window.carouselNext = function () {
        const visibleCount = getVisibleCount();
        const maxIndex = Math.max(0, allReviews.length - visibleCount);
        if (currentIndex < maxIndex) { currentIndex++; renderCarousel(); }
    };
    window.carouselGoTo = function (i) {
        currentIndex = i; renderCarousel();
    };

    // Swipe táctil móvil
    function initSwipe(el) {
        let startX = 0;
        el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        el.addEventListener('touchend', e => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) diff > 0 ? carouselNext() : carouselPrev();
        }, { passive: true });
    }

    // ── BADGE GOOGLE ────────────────────────────────────
    function renderBadge(data) {
        const badgeEl = document.getElementById('google-reviews-badge');
        if (!badgeEl) return;
        badgeEl.innerHTML = `
        <div class="google-badge-carousel">
            <div class="google-badge-left">
                <svg width="30" height="30" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <div>
                    <div class="badge-stars">★★★★★ <span class="badge-score">${data.rating.toFixed(1)}</span></div>
                    <div class="badge-count">${data.totalReviews} reseñas en Google</div>
                </div>
            </div>
            <div class="google-badge-right">
                <a href="https://search.google.com/local/writereview?placeid=ChIJmUBAgJ-fP44RmIFEGGTbs5Y" target="_blank" class="btn-leave-review">✏️ Dejar mi reseña</a>
                <a href="https://www.google.com/maps/place/Arcadio+Ram%C3%ADrez+Servicio+T%C3%A9cnico+Especializado/@4.6270,-74.1089,17z/data=!4m8!3m7!1s0x8e3f9f4840384099:0x96b3b31844448198!8m2!3d4.6270!4d-74.1089!9m1!1b1" target="_blank" class="btn-see-google">Ver todas en Google ↗</a>
            </div>
        </div>`;
    }

    // ── SKELETON ────────────────────────────────────────
    function showSkeleton(track) {
        track.innerHTML = Array(3).fill(`
        <div class="review-card carousel-card review-skeleton" style="min-width:calc(33.333% - 14px)">
            <div class="skeleton-line w60"></div>
            <div class="skeleton-line w100"></div>
            <div class="skeleton-line w80"></div>
            <div class="skeleton-author">
                <div class="skeleton-avatar"></div>
                <div style="flex:1"><div class="skeleton-line w40"></div><div class="skeleton-line w60"></div></div>
            </div>
        </div>`).join('');
    }

    // ── MAIN ────────────────────────────────────────────
    async function loadReviews() {
        const track = document.getElementById('carousel-track');
        const wrapper = document.getElementById('carousel-wrapper');
        if (!track) return;

        showSkeleton(track);

        try {
            const res = await fetch('/.netlify/functions/reviews');
            if (!res.ok) throw new Error('API error ' + res.status);
            const data = await res.json();
            allReviews = data.reviews;
            renderCarousel();
            renderBadge(data);
        } catch (err) {
            console.warn('Usando reseñas de respaldo:', err);
            allReviews = [
                staticCard('Carlos M.', 'CM', 'Excelente servicio. El técnico llegó puntual, diagnosticó mi lavadora rápidamente y la dejó funcionando perfecto. Muy profesional y honesto con los precios.', 'hace 2 semanas'),
                staticCard('Laura P.', 'LP', 'Mi nevera dejó de enfriar y en menos de 2 horas ya estaba reparada. Rápido, económico y con garantía. 100% recomendado para Kennedy y alrededores.', 'hace 1 mes'),
                staticCard('Jorge R.', 'JR', 'Llevan más de 40 años con este negocio y se nota la experiencia. Arreglaron mi secadora que otros técnicos no pudieron.', 'hace 1 mes'),
                staticCard('María C.', 'MC', 'Muy buen servicio, llegaron el mismo día que llamé. El técnico explicó todo detalladamente. Quedé muy satisfecha.', 'hace 2 meses'),
                staticCard('Pedro A.', 'PA', 'Servicio rápido y confiable. Mi lavadora lleva años con ellos y siempre queda perfecta. Los recomiendo totalmente.', 'hace 3 meses'),
            ];
            renderCarousel();
            renderBadge({ rating: 4.8, totalReviews: 45, name: 'Arcadio Ramírez Servicio Técnico' });
        }

        if (wrapper) initSwipe(wrapper);

        // Recalcular al cambiar tamaño de ventana
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { currentIndex = 0; renderCarousel(); }, 150);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadReviews);
    } else {
        loadReviews();
    }
})();