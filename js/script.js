/* Lógica do site. O conteúdo vem de window.SITE (js/data.js). */
;(() => {
  'use strict'

  const {
    name,
    from,
    start,
    img,
    praises,
    words,
    moments,
    letter,
    letterTitle,
    signature,
  } = window.SITE
  const $ = (sel, root = document) => root.querySelector(sel)
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)]
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const finePointer = matchMedia('(pointer: fine)').matches
  const hasGsap = typeof window.gsap !== 'undefined'

  const h = (tag, className, html = '') => {
    const node = document.createElement(tag)
    if (className) node.className = className
    node.innerHTML = html
    return node
  }

  /* ---------- Textos dinâmicos ---------- */
  $$('[data-name]').forEach((n) => (n.textContent = name))
  $$('[data-from]').forEach((n) => (n.textContent = from))

  /* ---------- Corações flutuantes ---------- */
  const heartsLayer = $('#hearts')
  if (!reduceMotion) {
    for (let i = 0; i < 16; i++) {
      const s = h('span', '', '<i class="fa-solid fa-heart"></i>')
      s.style.cssText =
        `left:${Math.random() * 100}%;font-size:${0.8 + Math.random() * 1.6}rem;` +
        `animation-duration:${9 + Math.random() * 10}s;animation-delay:${Math.random() * 12}s`
      heartsLayer.append(s)
    }
  }

  /* ---------- Confete de corações ---------- */
  const confettiHearts = () => {
    if (typeof confetti === 'undefined' || reduceMotion) return
    const heart = confetti.shapeFromText({ text: '❤️', scalar: 2 })
    const fire = (origin) =>
      confetti({
        particleCount: 40,
        spread: 80,
        startVelocity: 38,
        scalar: 2,
        shapes: [heart],
        origin,
      })
    fire({ x: 0.2, y: 0.7 })
    fire({ x: 0.8, y: 0.7 })
  }

  /* ---------- Boas-vindas ---------- */
  const welcome = $('#welcome')
  $('#enter').addEventListener('click', () => {
    const done = () => {
      welcome.remove()
      document.body.classList.remove('is-locked')
      introHero()
    }
    confettiHearts()
    if (hasGsap && !reduceMotion) {
      gsap.to('.welcome-card', {
        y: -30,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      })
      gsap.to(welcome, {
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        onComplete: done,
      })
    } else done()
  })

  /* ---------- Hero: entrada e frase rotativa ---------- */
  function introHero() {
    if (hasGsap && !reduceMotion) {
      gsap.from('.mensagem', {
        opacity: 0,
        scale: 0.9,
        duration: 1.4,
        ease: 'expo.out',
      })
      gsap.from('.ticker', { opacity: 0, y: 20, duration: 1, delay: 0.5 })
    }
    const ticker = $('#ticker')
    let i = 0
    setInterval(() => {
      i = (i + 1) % words.length
      if (hasGsap && !reduceMotion) {
        gsap.to(ticker, {
          opacity: 0,
          y: -10,
          duration: 0.3,
          onComplete: () => {
            ticker.textContent = words[i]
            gsap.fromTo(
              ticker,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.4 },
            )
          },
        })
      } else ticker.textContent = words[i]
    }, 2600)
  }

  /* ---------- Cards (gerados a partir dos dados) ---------- */
  const cardsEl = $('#cards')
  praises.forEach((p, index) => {
    const card = h(
      'article',
      'card glass',
      `
      <button class="card-photo" type="button" data-index="${index}" aria-label="Abrir foto: ${p.title}">
        <img src="${img + p.img}" alt="Suyane — ${p.title}" loading="lazy" />
      </button>
      <div class="card-content">
        <h2><i class="fa-solid fa-heart"></i>${p.title}</h2>
        <p>${p.text}</p>
      </div>`,
    )
    cardsEl.append(card)
    if (finePointer && !reduceMotion) {
      // inclinação 3D sutil
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty(
          '--ry',
          `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`,
        )
        card.style.setProperty(
          '--rx',
          `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`,
        )
      })
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg')
        card.style.setProperty('--ry', '0deg')
      })
    }
  })

  /* ---------- Timeline ---------- */
  const timelineEl = $('#timeline')
  moments.forEach((m) => {
    const card = h(
      'button',
      'flip-card',
      `
      <div class="flip-inner">
        <div class="flip-front glass"><i class="fa-solid ${m.icon}"></i><span>${m.date}</span></div>
        <div class="flip-back glass"><span>${m.text}</span></div>
      </div>`,
    )
    card.type = 'button'
    card.addEventListener('click', () => card.classList.toggle('active'))
    timelineEl.append(card)
  })

  /* ---------- Contador ---------- */
  const startDate = new Date(start)
  const units = ['Dias', 'Horas', 'Minutos', 'Segundos']
  const counterEl = $('#counter')
  units.forEach((u) =>
    counterEl.append(
      h(
        'div',
        'calendar glass',
        `<div class="calendar-header">${u}</div><h3 class="time">0</h3>`,
      ),
    ),
  )
  const timeEls = $$('.time', counterEl)
  const milestoneEl = $('#milestone')

  const pad = (n) => String(n).padStart(2, '0')
  function updateCounter() {
    const now = new Date()
    const total = Math.max(0, Math.floor((now - startDate) / 1000))
    const values = [
      Math.floor(total / 86400),
      Math.floor(total / 3600) % 24,
      Math.floor(total / 60) % 60,
      total % 60,
    ]
    values.forEach((v, i) => {
      const text = i === 0 ? String(v) : pad(v)
      if (timeEls[i].textContent !== text) {
        timeEls[i].textContent = text
        timeEls[i].classList.remove('tick')
        void timeEls[i].offsetWidth
        timeEls[i].classList.add('tick')
      }
    })
    // próximo mesversário (dia do namoro, todo mês)
    let next = new Date(now.getFullYear(), now.getMonth(), startDate.getDate())
    if (next <= now)
      next = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        startDate.getDate(),
      )
    const days = Math.ceil((next - now) / 86400000)
    milestoneEl.innerHTML =
      now < startDate
        ? 'Nossa história começa em breve 💙'
        : `<i class="fa-solid fa-cake-candles"></i> Próximo mesversário em <strong>${days} ${days === 1 ? 'dia' : 'dias'}</strong>`
  }
  updateCounter()
  setInterval(updateCounter, 1000)

  /* ---------- Modal genérico (foco + Esc) ---------- */
  let lastFocus = null
  function openModal(node, focusSel) {
    lastFocus = document.activeElement
    node.hidden = false
    document.body.classList.add('is-locked')
    ;($(focusSel, node) || node).focus()
  }
  function closeModal(node) {
    node.hidden = true
    document.body.classList.remove('is-locked')
    lastFocus?.focus()
  }

  /* ---------- Galeria ---------- */
  const lb = $('#lightbox'),
    lbFigure = $('.lb-figure', lb)
  let current = 0
  function showSlide(i, animate = true) {
    current = (i + praises.length) % praises.length
    const p = praises[current]
    const apply = () => {
      $('#lb-img').src = img + p.img
      $('#lb-img').alt = `Suyane — ${p.title}`
      $('#lb-title').textContent = p.title
      $('#lb-text').textContent = p.text
      $('#lb-count').textContent = `${current + 1} / ${praises.length}`
      lbFigure.classList.remove('swap')
    }
    if (animate && !reduceMotion) {
      lbFigure.classList.add('swap')
      setTimeout(apply, 250)
    } else apply()
    ;[1, -1].forEach((d) => {
      new Image().src =
        img + praises[(current + d + praises.length) % praises.length].img
    }) // pré-carrega vizinhas
  }
  cardsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-photo')
    if (!btn) return
    showSlide(+btn.dataset.index, false)
    openModal(lb, '.lb-close')
  })
  $('.lb-prev', lb).addEventListener('click', () => showSlide(current - 1))
  $('.lb-next', lb).addEventListener('click', () => showSlide(current + 1))
  lb.addEventListener('click', (e) => {
    if (e.target === lb || e.target.closest('[data-close]')) closeModal(lb)
  })
  let touchX = null // deslizar no celular
  lb.addEventListener('pointerdown', (e) => {
    touchX = e.clientX
  })
  lb.addEventListener('pointerup', (e) => {
    if (touchX !== null && Math.abs(e.clientX - touchX) > 60)
      showSlide(current + (e.clientX < touchX ? 1 : -1))
    touchX = null
  })

  /* ---------- Carta ---------- */
  const letterEl = $('#letter'),
    paper = $('#paper')
  paper.innerHTML =
    `<h2>${letterTitle}</h2>` +
    letter.map((t, i) => `<p class="line" style="--i:${i}">${t}</p>`).join('') +
    `<p class="sign line" style="--i:${letter.length}">${signature}</p>`

  $('#open-letter').addEventListener('click', () => {
    letterEl.classList.remove('opened')
    paper.scrollTop = 0
    openModal(letterEl, '#seal')
  })
  $('#seal').addEventListener('click', () => {
    letterEl.classList.add('opened')
    confettiHearts()
    setTimeout(() => paper.focus({ preventScroll: true }), 1000)
  })
  letterEl.addEventListener('click', (e) => {
    if (e.target === letterEl || e.target.closest('[data-close]'))
      closeModal(letterEl)
  })

  /* ---------- Teclado ---------- */
  document.addEventListener('keydown', (e) => {
    if (!lb.hidden) {
      if (e.key === 'Escape') closeModal(lb)
      if (e.key === 'ArrowRight') showSlide(current + 1)
      if (e.key === 'ArrowLeft') showSlide(current - 1)
    } else if (!letterEl.hidden && e.key === 'Escape') closeModal(letterEl)
  })

  /* ---------- Revelar ao rolar ---------- */
  if (hasGsap && window.ScrollTrigger && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger)
    gsap.set('.card, .flip-card, .calendar, .section-title', {
      opacity: 0,
      y: 40,
    })
    ScrollTrigger.batch('.card, .flip-card, .calendar, .section-title', {
      start: 'top 90%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform',
        }),
    })
  }
})()
