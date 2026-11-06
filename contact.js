const contactForm = document.querySelector('#contact-form');
const contactError = document.querySelector('#contact-error');
const contactSuccess = document.querySelector('#contact-success');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    contactError.textContent = '';
    contactSuccess.classList.add('hidden');

    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const subject = contactForm.subject.value.trim();
    const message = contactForm.message.value.trim();

    try {
        await sendContactMessage(name, email, subject, message);
        contactSuccess.classList.remove('hidden');
        contactForm.reset();
    } catch (err) {
        contactError.textContent = err.message;
    }
});
