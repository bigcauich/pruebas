const audioPlayer = document.getElementById('audio-player');
let puntoActivo = null;
let wrapperActivo = null;

document.querySelectorAll('.punto').forEach(punto => {
  const base = punto.dataset.base;
  const completo = punto.dataset.completo;
  const audio = punto.dataset.audio;
  const esCompleto = !base;

  if (esCompleto) {
    punto.addEventListener('click', () => {
      if (puntoActivo) return;
      audioPlayer.src = `audios/${audio}`;
      audioPlayer.play();
    });
    return;
  }

  punto.addEventListener('click', (e) => {
    e.stopPropagation();

    if (punto.classList.contains('respondido')) return;

    if (punto.classList.contains('fallido')) {
      punto.classList.remove('fallido');
      punto.innerHTML = punto.dataset.base;
    }

    if (puntoActivo && puntoActivo !== punto) cerrarActivo();
    if (puntoActivo === punto) return;

    punto.innerHTML = '';
    puntoActivo = punto;

    const wrapper = document.createElement('div');
    wrapper.classList.add('input-wrapper');
    wrapperActivo = wrapper;

    const inputs = [];
    base.split('').forEach((char, i) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.dataset.index = i;

      if (char === '_') {
        input.classList.add('editable');
      } else {
        input.value = char;
        input.readOnly = true;
        input.classList.add('fixed');
      }

      wrapper.appendChild(input);
      inputs.push(input);
    });

    punto.appendChild(wrapper);

    const firstEditable = inputs.find(i => !i.readOnly);
    if (firstEditable) firstEditable.focus();

    inputs.forEach((input, idx) => {
      input.addEventListener('keydown', e => {
        const code = e.key;

        if (code === 'ArrowLeft') {
          e.preventDefault();
          let prev = idx - 1;
          while (prev >= 0 && inputs[prev].readOnly) prev--;
          if (prev >= 0) inputs[prev].focus();
        }

        else if (code === 'ArrowRight') {
          e.preventDefault();
          let next = idx + 1;
          while (next < inputs.length && inputs[next].readOnly) next++;
          if (next < inputs.length) inputs[next].focus();
        }

        else if (code === 'Backspace') {
          e.preventDefault();
          if (!input.readOnly && input.value) {
            input.value = '';
          } else {
            let prev = idx - 1;
            while (prev >= 0 && inputs[prev].readOnly) prev--;
            if (prev >= 0) inputs[prev].focus();
          }
        }

        else if (/^[a-zA-ZñÑ]$/.test(code)) {
          if (input.readOnly) {
            e.preventDefault();
          } else {
            input.value = code.toUpperCase();
            let next = idx + 1;
            while (next < inputs.length && inputs[next].readOnly) next++;
            if (next < inputs.length) inputs[next].focus();
            e.preventDefault();

            const respuesta = inputs.map(i => i.value.toUpperCase() || '_').join('');
            const esperado = punto.dataset.completo.toUpperCase();

            if (!respuesta.includes('_')) {
              if (respuesta === esperado) {
                punto.classList.add('respondido');
                punto.innerHTML = esperado;
                punto.dataset.base = '';
                punto.dataset.completo = '';
                punto.classList.add('simple');
                puntoActivo = null;

                punto.addEventListener('click', () => {
                  if (puntoActivo) return;
                  audioPlayer.src = `audios/${audio}`;
                  audioPlayer.play();
                }, { once: true });

                audioPlayer.src = `audios/${audio}`;
                audioPlayer.play();
              } else {
                punto.classList.add('fallido');
                punto.innerHTML = `<span class="mensaje-error">Palabra incorrecta. Haz clic para intentar de nuevo.</span>`;
                puntoActivo = null;
                wrapperActivo = null;
              }
            }
          }
        }

        else {
          e.preventDefault();
        }
      });
    });
  });
});

document.body.addEventListener('click', () => {
  cerrarActivo();
});

function cerrarActivo() {
  if (!puntoActivo || !wrapperActivo) return;

  const baseOriginal = puntoActivo.dataset.base;
  puntoActivo.innerHTML = baseOriginal;
  puntoActivo.classList.remove('fallido');
  puntoActivo = null;
  wrapperActivo = null;
}
