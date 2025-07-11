document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const imageInput = document.getElementById('imageInput');
    const previewImage = document.getElementById('previewImage');
    const canvas = document.getElementById('canvas');
    const polaroidWidth = 1080;
    const polaroidHeight = 1350;
    const marginTop = 40;
    const marginSides = 40;
    const marginBottom = 180;

    generateBtn.addEventListener('click', () => {
        imageInput.click();
    });

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

    downloadBtn.addEventListener('click', () => {
        canvas.width = polaroidWidth;
        canvas.height = polaroidHeight;
        const ctx = canvas.getContext('2d');

        const innerX = marginSides;
        const innerY = marginTop;
        const innerWidth = polaroidWidth - 2 * marginSides;
        const innerHeight = polaroidHeight - marginTop - marginBottom;

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, polaroidWidth, polaroidHeight);

        ctx.fillStyle = '#000';
        ctx.fillRect(innerX, innerY, innerWidth, innerHeight);

        const userImg = new Image();
        userImg.src = previewImage.src;

        userImg.onload = function() {
            const imgRatio = userImg.width / userImg.height;
            const boxRatio = innerWidth / innerHeight;

            let sx, sy, sw, sh;

            if (imgRatio > boxRatio) {
                sh = userImg.height;
                sw = sh * boxRatio;
                sx = (userImg.width - sw) / 2;
                sy = 0;
            } else {
                sw = userImg.width;
                sh = sw / boxRatio;
                sx = 0;
                sy = (userImg.height - sh) / 2;
            }

            ctx.drawImage(userImg, sx, sy, sw, sh, innerX, innerY, innerWidth, innerHeight);

            const link = document.createElement('a');
            link.download = 'mi_polaroid.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

            setTimeout(() => {
                generateBtn.style.display = 'inline-block';
                downloadBtn.style.display = 'none';
                previewImage.style.display = 'none';
                previewImage.src = '';
                imageInput.value = '';
            }, 100);
        };

        userImg.onerror = function() {
            alert('Error al cargar la imagen. Por favor, intenta con otra imagen.');
        };
    });
});
