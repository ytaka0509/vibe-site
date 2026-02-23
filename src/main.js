import './style.css'

// --- FAQ アコーディオン ---
document.querySelectorAll('.faq-question').forEach((btn) => {
  btn.addEventListener('click', () => {
    const answer = btn.nextElementSibling
    const isOpen = btn.getAttribute('aria-expanded') === 'true'

    // 他のアイテムを閉じる
    document.querySelectorAll('.faq-question').forEach((other) => {
      if (other !== btn) {
        other.setAttribute('aria-expanded', 'false')
        other.nextElementSibling.classList.remove('open')
      }
    })

    // クリックしたアイテムを開閉
    btn.setAttribute('aria-expanded', String(!isOpen))
    answer.classList.toggle('open', !isOpen)
  })
})

// --- お問い合わせフォーム（ダミー送信）---
const form = document.getElementById('contactForm')
const successMsg = document.getElementById('contactSuccess')

form.addEventListener('submit', (e) => {
  e.preventDefault()

  const nameVal = form.elements['name'].value.trim()
  const emailVal = form.elements['email'].value.trim()
  const messageVal = form.elements['message'].value.trim()

  if (!nameVal || !emailVal || !messageVal) {
    alert('お名前・メールアドレス・メッセージは必須項目です。')
    return
  }

  // ダミー送信（実際のAPIには接続しない）
  const submitBtn = form.querySelector('[type="submit"]')
  submitBtn.textContent = '送信中…'
  submitBtn.disabled = true

  setTimeout(() => {
    form.classList.add('hidden')
    successMsg.classList.remove('hidden')
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 800)
})
