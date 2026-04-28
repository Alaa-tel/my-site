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
    $desc.textContent = msg;
    $note.style.display = 'none';
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
