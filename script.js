document.addEventListener('DOMContentLoaded', function() {
    // Elementos
    const contadorEl = document.getElementById('contador');
    const btnIncrementar = document.getElementById('btn-incrementar');
    const btnRedefinir = document.getElementById('btn-redefinir');
    const keepAwakeToggle = document.getElementById('keepAwakeToggle');
    const resetModal = document.getElementById('resetModal');
    const confirmReset = document.getElementById('confirmReset');
    const cancelReset = document.getElementById('cancelReset');
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const closeError = document.getElementById('closeError');
    
    let contador = parseInt(localStorage.getItem('yogaContador')) || 0;
    
    function atualizarContador() {
        contadorEl.textContent = contador;
        localStorage.setItem('yogaContador', contador);
    }
    
    atualizarContador();
    
    function showModal(modal) {
        modal.classList.add('active');
    }

    function hideModal(modal) {
        modal.classList.remove('active');
    }

    function showError(message) {
        errorMessage.textContent = message;
        showModal(errorModal);
    }
    
    btnIncrementar.addEventListener('click', function() {
        contador++;
        atualizarContador();
        
        contadorEl.classList.add('text-pink-500');
        setTimeout(() => {
            contadorEl.classList.remove('text-pink-500');
        }, 150);
    });
    
    btnRedefinir.addEventListener('click', function() {
        showModal(resetModal);
    });

    confirmReset.addEventListener('click', function() {
        contador = 0;
        atualizarContador();
        hideModal(resetModal);
    });

    cancelReset.addEventListener('click', function() {
        hideModal(resetModal);
    });

    closeError.addEventListener('click', function() {
        hideModal(errorModal);
    });

    resetModal.addEventListener('click', function(e) {
        if (e.target === resetModal) {
            hideModal(resetModal);
        }
    });

    errorModal.addEventListener('click', function(e) {
        if (e.target === errorModal) {
            hideModal(errorModal);
        }
    });

    let wakeLock = null;

    async function requestWakeLock() {
        try {
            // Tenta obter um wake lock
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock ativado!');
            
            wakeLock.addEventListener('release', () => {
                console.log('Wake Lock foi liberado');
                wakeLock = null;
                if (keepAwakeToggle.checked) {
                    requestWakeLock();
                }
            });
        } catch (err) {
            console.error(`Erro ao ativar Wake Lock: ${err.message}`);
            showError('Seu navegador não suporte manter a tela ligada.');
            keepAwakeToggle.checked = false;
        }
    }

    function releaseWakeLock() {
        if (wakeLock) {
            wakeLock.release()
                .then(() => {
                    console.log('Wake Lock liberado');
                    wakeLock = null;
                });
        }
    }

    const keepScreenOn = localStorage.getItem('yogaKeepScreenOn') === 'true';
    keepAwakeToggle.checked = keepScreenOn;
    
    if (keepScreenOn && 'wakeLock' in navigator) {
        requestWakeLock();
    }

    keepAwakeToggle.addEventListener('change', function() {
        const isChecked = this.checked;
        localStorage.setItem('yogaKeepScreenOn', isChecked);
        
        if (isChecked && 'wakeLock' in navigator) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }
    });

    // Reativar o wake lock quando o documento volta a ficar vis���vel
    document.addEventListener('visibilitychange', () => {
        if (keepAwakeToggle.checked && document.visibilityState === 'visible' && !wakeLock) {
            requestWakeLock();
        }
    });
});