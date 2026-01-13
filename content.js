(function() {
  const REQUIRED_PATH = '/uiSNOC/main/service';
  const REQUIRED_PARAM = 'cat=viewTransaction_cs';
  
  console.log('SNOC Helper: Script chargé sur:', window.location.href);
  console.log('SNOC Helper: pathname:', window.location.pathname);
  console.log('SNOC Helper: search:', window.location.search);
  
  function isCorrectPage() {
    return window.location.pathname.includes(REQUIRED_PATH) && 
           window.location.search.includes(REQUIRED_PARAM);
  }

  if (!isCorrectPage()) {
    console.log('SNOC Helper: Page incorrecte, script non chargé');
    return;
  }
  
  console.log('SNOC Helper: Page correcte, script chargé');

  function showAlert(message) {
    alert(`SNOC Helper: ${message}`);
  }

  function waitForLoaderToFinish(timeout = 30000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let loaderHasAppeared = false;
      const maxWaitForAppearance = 2000;
      
      const checkLoader = () => {
        const elapsed = Date.now() - startTime;
        const loader = document.getElementById('load_list_myTransactionGrid');
        
        if (elapsed > timeout) {
          reject(new Error('Timeout: le chargement a pris trop de temps'));
          return;
        }

        if (!loader) {
          if (!loaderHasAppeared && elapsed > maxWaitForAppearance) {
            console.log('SNOC Helper: Loader jamais trouvé, on continue');
            resolve();
            return;
          }
          setTimeout(checkLoader, 100);
          return;
        }

        const currentDisplay = loader.style.display;
        
        if (currentDisplay === 'block') {
          if (!loaderHasAppeared) {
            console.log('SNOC Helper: Loader apparaît (block)');
          }
          loaderHasAppeared = true;
        }
        
        if (loaderHasAppeared && (currentDisplay === 'none' || currentDisplay === '')) {
          console.log('SNOC Helper: Loader disparu (none)');
          resolve();
          return;
        }
        
        if (!loaderHasAppeared && elapsed > maxWaitForAppearance) {
          console.log('SNOC Helper: Loader n\'est jamais apparu, on continue');
          resolve();
          return;
        }
        
        setTimeout(checkLoader, 100);
      };
      
      checkLoader();
    });
  }

  async function executeSearch() {
    try {
      console.log('SNOC Helper: Début de l\'exécution');
      
      let clipboardText = '';
      try {
        clipboardText = await navigator.clipboard.readText();
      } catch (e) {
        showAlert('Impossible de lire le presse-papier. Vérifiez les permissions.');
        return;
      }

      if (!clipboardText || clipboardText.trim() === '') {
        showAlert('Le presse-papier est vide.');
        return;
      }

      const parts = clipboardText.trim().split(/\s+/);
      if (parts.length < 2) {
        showAlert('Format presse-papier invalide. Attendu: YYYY-MM-DD MSISDN');
        return;
      }

      const rawDate = parts[0];
      const msisdn = parts[1];

      let formattedDate = rawDate;
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const [year, month, day] = rawDate.split('-');
        formattedDate = `${day}-${month}-${year}`;
      } else {
        showAlert('Format de date invalide dans le presse-papier. Attendu: YYYY-MM-DD');
        return;
      }

      const fromDateField = document.getElementById('from_date');
      const toDateField = document.getElementById('to_date');
      const msisdnField = document.getElementById('msisdn');
      const submitBtn = document.getElementById('btnSubmit');

      if (!fromDateField || !toDateField || !msisdnField || !submitBtn) {
        showAlert('Champs du formulaire introuvables sur cette page.');
        return;
      }

      fromDateField.focus();
      fromDateField.value = formattedDate;
      fromDateField.dispatchEvent(new Event('input', { bubbles: true }));
      fromDateField.dispatchEvent(new Event('change', { bubbles: true }));
      
      const fromDatePicker = document.querySelector('.datepicker.datepicker-dropdown');
      if (fromDatePicker) {
        fromDatePicker.remove();
      }
      
      document.body.focus();
      
      toDateField.focus();
      toDateField.value = formattedDate;
      toDateField.dispatchEvent(new Event('input', { bubbles: true }));
      toDateField.dispatchEvent(new Event('change', { bubbles: true }));
      
      const toDatePicker = document.querySelector('.datepicker.datepicker-dropdown');
      if (toDatePicker) {
        toDatePicker.remove();
      }
      
      document.body.focus();
      
      msisdnField.value = msisdn;
      msisdnField.dispatchEvent(new Event('input', { bubbles: true }));
      msisdnField.dispatchEvent(new Event('change', { bubbles: true }));

      submitBtn.click();

      console.log('SNOC Helper: Submit cliqué, attente du loader');

      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        await waitForLoaderToFinish();
      } catch (error) {
        console.log('SNOC Helper: Erreur loader:', error.message);
        return;
      }

      console.log('SNOC Helper: Loader terminé, recherche de la ligne');

      await new Promise(resolve => setTimeout(resolve, 500));

      const targetRow = document.getElementById('1');
      
      if (!targetRow) {
        console.log('SNOC Helper: Aucune ligne trouvée');
        return;
      }

      const actionCell = targetRow.querySelector('td[aria-describedby="list_myTransactionGrid_Actions"]');
      
      if (!actionCell) {
        console.log('SNOC Helper: Cellule action introuvable');
        return;
      }

      console.log('SNOC Helper: Cellule action trouvée, tentative de clic');

      const onclickValue = actionCell.getAttribute('onclick');
      
      if (onclickValue) {
        console.log('SNOC Helper: onclick trouvé sur cellule:', onclickValue);
        actionCell.click();
      } else {
        const clickableElement = actionCell.querySelector('[onclick]');
        if (clickableElement) {
          console.log('SNOC Helper: onclick trouvé sur élément enfant');
          clickableElement.click();
        } else {
          console.log('SNOC Helper: Aucun onclick trouvé, clic direct sur cellule');
          actionCell.click();
        }
      }

    } catch (error) {
      showAlert(`Erreur: ${error.message}`);
    }
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'executeSearch') {
      executeSearch();
      sendResponse({ status: 'started' });
    }
    return true;
  });
})();
