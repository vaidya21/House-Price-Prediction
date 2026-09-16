document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('calc-form');
  const btnPredict = document.getElementById('btn-predict');
  const loadingDots = document.getElementById('loading-dots');
  const btnSpan = btnPredict.querySelector('span');

  // Sliders & Hidden Inputs
  const sqftRange = document.getElementById('sqft-range');
  const sqftVal = document.getElementById('sqft-val');
  const hiddenSqft = document.getElementById('SquareFeet');

  const ageRange = document.getElementById('age-range');
  const ageVal = document.getElementById('age-val');
  const hiddenAge = document.getElementById('HouseAge');

  const distRange = document.getElementById('dist-range');
  const distVal = document.getElementById('dist-val');
  const hiddenDist = document.getElementById('DistanceToCityCenter');

  const selectNeighborhood = document.getElementById('Neighborhood');
  const hiddenBHK = document.getElementById('Bedrooms');
  const hiddenBath = document.getElementById('Bathrooms');
  const hiddenGarage = document.getElementById('GarageSpaces');

  // Output Elements
  const resPriceInr = document.getElementById('res-price-inr');
  const resExactPrice = document.getElementById('res-exact-price');
  const resRate = document.getElementById('res-rate');
  const resEmi = document.getElementById('res-emi');

  // Chips
  const chipBhk = document.getElementById('chip-bhk');
  const chipSqft = document.getElementById('chip-sqft');
  const chipZone = document.getElementById('chip-zone');
  const chipParking = document.getElementById('chip-parking');

  // Presets
  const PRESETS = {
    gated: {
      sqft: 1850,
      bhk: 3,
      bath: 3,
      age: 4,
      dist: 5.5,
      parking: 2,
      zone: 'Gated Society'
    },
    metro: {
      sqft: 1150,
      bhk: 2,
      bath: 2,
      age: 2,
      dist: 2.0,
      parking: 1,
      zone: 'City Center'
    },
    villa: {
      sqft: 2800,
      bhk: 4,
      bath: 4,
      age: 6,
      dist: 10.0,
      parking: 2,
      zone: 'Suburban'
    },
    rural: {
      sqft: 2200,
      bhk: 3,
      bath: 2,
      age: 12,
      dist: 22.0,
      parking: 1,
      zone: 'Rural / Outskirts'
    }
  };

  // Slider Listeners with live sync
  sqftRange.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    sqftVal.textContent = val.toLocaleString();
    hiddenSqft.value = val;
    debouncePredict();
  });

  ageRange.addEventListener('input', (e) => {
    const val = e.target.value;
    ageVal.textContent = val;
    hiddenAge.value = val;
    debouncePredict();
  });

  distRange.addEventListener('input', (e) => {
    const val = Number(e.target.value).toFixed(1);
    distVal.textContent = val;
    hiddenDist.value = val;
    debouncePredict();
  });

  selectNeighborhood.addEventListener('change', () => {
    debouncePredict();
  });

  // Pill Button Group Handler
  function setupPillGroup(groupId, hiddenInput) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        hiddenInput.value = btn.getAttribute('data-val');
        debouncePredict();
      });
    });
  }

  setupPillGroup('bhk-group', hiddenBHK);
  setupPillGroup('bath-group', hiddenBath);
  setupPillGroup('garage-group', hiddenGarage);

  // Preset Button Handler
  document.querySelectorAll('.btn-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const presetKey = btn.getAttribute('data-preset');
      const data = PRESETS[presetKey];
      if (!data) return;

      // Apply values
      sqftRange.value = data.sqft;
      sqftVal.textContent = data.sqft.toLocaleString();
      hiddenSqft.value = data.sqft;

      ageRange.value = data.age;
      ageVal.textContent = data.age;
      hiddenAge.value = data.age;

      distRange.value = data.dist;
      distVal.textContent = data.dist;
      hiddenDist.value = data.dist;

      selectNeighborhood.value = data.zone;

      // Update pill buttons
      setActivePill('bhk-group', data.bhk, hiddenBHK);
      setActivePill('bath-group', data.bath, hiddenBath);
      setActivePill('garage-group', data.parking, hiddenGarage);

      fetchPrediction();
    });
  });

  function setActivePill(groupId, value, hiddenInput) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.pill-btn').forEach(btn => {
      if (btn.getAttribute('data-val') == value) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    hiddenInput.value = value;
  }

  // Debounce helper for instant smooth slider changes
  let debounceTimeout = null;
  function debouncePredict() {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchPrediction();
    }, 200);
  }

  // Async API Call
  async function fetchPrediction() {
    const payload = {
      SquareFeet: Number(hiddenSqft.value),
      Bedrooms: Number(hiddenBHK.value),
      Bathrooms: Number(hiddenBath.value),
      HouseAge: Number(hiddenAge.value),
      DistanceToCityCenter: Number(hiddenDist.value),
      GarageSpaces: Number(hiddenGarage.value),
      Neighborhood: selectNeighborhood.value
    };

    // UI Loading state
    loadingDots.style.display = 'inline-flex';
    btnSpan.textContent = 'Estimating...';

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (response.ok && res.status === 'success') {
        // Animate price change
        resPriceInr.style.transform = 'scale(1.04)';
        setTimeout(() => {
          resPriceInr.style.transform = 'scale(1)';
        }, 150);

        resPriceInr.textContent = res.formatted_inr;
        resExactPrice.textContent = res.full_currency;
        resRate.textContent = res.price_per_sqft;
        resEmi.textContent = res.monthly_emi;

        // Update chips
        chipBhk.textContent = res.bhk_label;
        chipSqft.textContent = res.sqft_label;
        chipZone.textContent = res.locality;
        chipParking.textContent = `${payload.GarageSpaces} Parking`;

      } else {
        console.error('Prediction failed:', res.message);
      }
    } catch (err) {
      console.error('Network error:', err);
    } finally {
      loadingDots.style.display = 'none';
      btnSpan.textContent = 'Recalculate Valuation';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    fetchPrediction();
  });

  // Run initial estimate on page load
  fetchPrediction();
});
