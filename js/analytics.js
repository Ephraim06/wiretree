(() => {
  const measurementId = 'G-VF6S3RZR7N';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('config', measurementId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  window.wiretreeTrack = (eventName, parameters = {}) => gtag('event', eventName, parameters);

  const initialiseEvents = () => {
    document.addEventListener('wiretree:lead', () => window.wiretreeTrack('generate_lead', { form_name: 'project_enquiry' }));
    document.querySelectorAll('.whatsapp').forEach(link => link.addEventListener('click', () => window.wiretreeTrack('whatsapp_click', { link_location: 'floating_button' })));
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => link.addEventListener('click', () => window.wiretreeTrack('contact_click', { contact_method: 'email' })));
    document.querySelectorAll('a[href^="tel:"]').forEach(link => link.addEventListener('click', () => window.wiretreeTrack('contact_click', { contact_method: 'phone' })));
    document.querySelectorAll('.project-image[href^="http"]').forEach(link => link.addEventListener('click', () => window.wiretreeTrack('select_content', { content_type: 'portfolio_project', item_id: link.href })));
  };

  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', initialiseEvents, { once: true }) : initialiseEvents();
})();
