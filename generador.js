document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const canvas = document.getElementById('canvas');
    const polaroidText = document.getElementById('polaroidText');
    
    // Dimensiones base
    const polaroidWidth = 1080;
    const polaroidHeight = 1350;
    const marginTop = 40;
    const marginSides = 40;
    const marginBottom = 180;

    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Configurar el placeholder inicial
    polaroidText.value = 'Escribe un mensaje aquí';
    polaroidText.style.color = '#999';

    // Configurar el botón de generar
    generateBtn.addEventListener('click', () => {
        imageInput.click();
    });

    // Manejar la selección de imagen
    imageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Por favor, selecciona un archivo de imagen.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            generateBtn.style.display = 'none';
            downloadBtn.style.display = 'inline-block';

            previewImage.onload = function() {
                previewImage.style.objectFit = 'cover';
            };
        };
        reader.readAsDataURL(file);
    });

    // Manejar el input de texto
    polaroidText.addEventListener('focus', function() {
        if (this.value === 'Escribe un mensaje aquí') {
            this.value = '';
            this.style.color = '#333';
        }
    });

    polaroidText.addEventListener('blur', function() {
        if (this.value === '') {
            this.value = 'Escribe un mensaje aquí';
            this.style.color = '#999';
        }
    });

    // Función para descargar la imagen
    downloadBtn.addEventListener('click', async function() {
        try {
            // Ajustar tamaño para móviles
            const width = isMobile ? polaroidWidth / 2 : polaroidWidth;
            const height = isMobile ? polaroidHeight / 2 : polaroidHeight;
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // Ajustar márgenes
            const adjMarginTop = isMobile ? marginTop / 2 : marginTop;
            const adjMarginSides = isMobile ? marginSides / 2 : marginSides;
            const adjMarginBottom = isMobile ? marginBottom / 2 : marginBottom;

            const innerX = adjMarginSides;
            const innerY = adjMarginTop;
            const innerWidth = width - 2 * adjMarginSides;
            const innerHeight = height - adjMarginTop - adjMarginBottom;

            // Dibujar fondo blanco
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, width, height);

            // Dibujar área negra
            ctx.fillStyle = '#000';
            ctx.fillRect(innerX, innerY, innerWidth, innerHeight);

            const userImg = new Image();
            userImg.crossOrigin = 'Anonymous';
            
            const imgLoaded = new Promise((resolve, reject) => {
                userImg.onload = () => resolve(userImg);
                userImg.onerror = () => reject(new Error('Error al cargar la imagen'));
                userImg.src = previewImage.src;
            });

            const image = await imgLoaded;

            // Calcular dimensiones
            const imgRatio = image.width / image.height;
            const boxRatio = innerWidth / innerHeight;

            let sx, sy, sw, sh;

            if (imgRatio > boxRatio) {
                sh = image.height;
                sw = sh * boxRatio;
                sx = (image.width - sw) / 2;
                sy = 0;
            } else {
                sw = image.width;
                sh = sw / boxRatio;
                sx = 0;
                sy = (image.height - sh) / 2;
            }

            // Dibujar la imagen
            ctx.drawImage(image, sx, sy, sw, sh, innerX, innerY, innerWidth, innerHeight);

            // Dibujar el texto
            let text = polaroidText.value.trim();
            if (text === 'Escribe un mensaje aquí') text = '';
            
            if (text) {
                ctx.fillStyle = '#333';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const textY = height - (adjMarginBottom / 2);
                const maxWidth = innerWidth * 0.9;
                let fontSize = isMobile ? 24 : 36;
                
                // Fuente normal (sin itálica)
                ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
                let textWidth = ctx.measureText(text).width;
                
                while (textWidth > maxWidth && fontSize > 12) {
                    fontSize -= 2;
                    ctx.font = `bold ${fontSize}px 'Courier New', monospace`;
                    textWidth = ctx.measureText(text).width;
                }
                
                ctx.fillText(text, width / 2, textY);
            }

            // Crear y descargar la imagen
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = 'mi_polaroid.png';
                link.href = url;
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);
            }, 'image/png', 0.92);
        } catch (error) {
            console.error('Error al generar la polaroid:', error);
            alert('Error al generar la polaroid. Por favor, intenta con otra imagen.');
        }
    });

    // Función para resetear la interfaz
    function resetUI() {
        generateBtn.style.display = 'inline-block';
        downloadBtn.style.display = 'none';
        previewImage.style.display = 'none';
        previewImage.src = '';
        imageInput.value = '';
        polaroidText.value = 'Escribe un mensaje aquí';
        polaroidText.style.color = '#999';
    }

    // Mejorar experiencia en móviles
    if (isMobile) {
        [generateBtn, downloadBtn].forEach(btn => {
            btn.style.touchAction = 'manipulation';
            btn.style.webkitTapHighlightColor = 'transparent';
        });
    }
});