// Open-Meteo current weather using browser geolocation
(function(){
  const emojiMap = (code) => {
    // Map Open-Meteo weathercodes to emoji + label
    // reference: https://open-meteo.com/en/docs
    if (code === 0) return {emoji: '☀️', label: 'Clear'};
    if (code >= 1 && code <= 3) return {emoji: '⛅', label: 'Partly cloudy'};
    if (code === 45 || code === 48) return {emoji: '🌫️', label: 'Fog'};
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return {emoji: '🌧️', label: 'Rain'};
    if (code >= 71 && code <= 77) return {emoji: '❄️', label: 'Snow'};
    if (code >= 95 && code <= 99) return {emoji: '⛈️', label: 'Thunderstorm'};
    return {emoji: '☁️', label: 'Cloudy'};
  };

  const $temp = document.getElementById('weather-temp');
  const $emoji = document.getElementById('weather-emoji');
  const $desc = document.getElementById('weather-desc');
  const $note = document.getElementById('weather-note');

  function showError(msg){
    if ($desc) $desc.textContent = msg;
    if ($note) $note.style.display = 'none';
    if ($temp) $temp.textContent = '--°F';
  }

  function fetchWeather(lat, lon){
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=fahrenheit`;
    fetch(url).then(r=>r.json()).then(data=>{
      if (!data || !data.current_weather) return showError('No weather data');
      const cw = data.current_weather;
      const t = Math.round(cw.temperature);
      const map = emojiMap(cw.weathercode);
      $temp.textContent = `${t}°F`;
      $emoji.textContent = map.emoji;
      $desc.textContent = map.label;
      $note.style.display = 'none';
    }).catch(()=>showError('Unable to fetch weather'));
  }

  if (!navigator.geolocation){
    showError('Geolocation not supported');
  } else {
    navigator.geolocation.getCurrentPosition(pos => {
      fetchWeather(pos.coords.latitude, pos.coords.longitude);
    }, err => {
      showError('Location denied');
    }, {enableHighAccuracy:false, timeout:8000});
  }
})();

// Title reveal animation: split into characters and apply staggered delays
(function titleAnimate(){
  const h = document.querySelector('.intro h1');
  if (!h) return;
  const original = h.textContent.trim();
  h.textContent = '';
  const frag = document.createDocumentFragment();
  const delayBase = 0.06; // seconds per char
  const animDuration = 680; // ms, matches .68s in CSS

  Array.from(original).forEach((ch,i)=>{
    const span = document.createElement('span');
    span.className = 'title-char';
    span.style.animationDelay = (i * delayBase)+'s';
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    frag.appendChild(span);
  });
  h.appendChild(frag);

  // Apply a subtle shine a bit into the animation
  const lastDelayMs = Math.max(0, (original.length - 1) * delayBase * 1000);
  const shineApplyMs = lastDelayMs + (animDuration * 0.6);
  setTimeout(()=> h.classList.add('shine'), Math.max(200, shineApplyMs));

  // After all character animations finish, restore plain text so title is static
  const restoreMs = lastDelayMs + animDuration + 120; // small buffer
  setTimeout(()=>{
    h.classList.remove('shine');
    h.textContent = original;
  }, restoreMs);
})();
