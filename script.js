(() => {
  // Expanded healing frequencies (Brainwave, Earth, Solfeggio & Chakra)
  const FREQUENCIES = [0.1, 3, 7.83, 8, 12, 40, 62, 136, 174, 256, 285, 288, 320, 341, 384, 396, 417, 426, 480, 528, 639, 693, 741, 852, 963];
  let SORTED_FREQUENCIES = [...FREQUENCIES].sort((a, b) => a - b);
  const MAX_FREQUENCY_HZ = 1000;
  
  // Proper Solfeggio frequency colors based on sound healing and chakra associations
  const GALAXY_COLORS = {
    0.1: {
      primary: '#0b132b', secondary: '#1c2541', tertiary: '#3a506b',
      glow: '#5bc0eb', name: 'Subdelta Calm'
    },
    136: {
      primary: '#8B4513', secondary: '#CD853F', tertiary: '#DEB887',
      glow: '#FFD59E', name: 'Cosmic OM'
    },
    174: { 
      primary: '#8B0000', secondary: '#DC143C', tertiary: '#CD5C5C', 
      glow: '#FF6B6B', name: 'Foundation Grounding'
    },
    285: { 
      primary: '#FF4500', secondary: '#FF6347', tertiary: '#FF7F50', 
      glow: '#FFA07A', name: 'Quantum Cognition'
    },
    396: { 
      primary: '#C41E3A', secondary: '#FF1744', tertiary: '#FF5722', 
      glow: '#FF8A65', name: 'Liberation Root'
    },
    417: { 
      primary: '#FF8C00', secondary: '#FFA500', tertiary: '#FFB347', 
      glow: '#FFCC80', name: 'Resonant Change'
    },
    528: { 
      primary: '#228B22', secondary: '#32CD32', tertiary: '#90EE90', 
      glow: '#98FB98', name: 'Love Frequency'
    },
    639: { 
      primary: '#4169E1', secondary: '#1E90FF', tertiary: '#87CEEB', 
      glow: '#87CEFA', name: 'Connection Harmony'
    },
    741: { 
      primary: '#4B0082', secondary: '#6A5ACD', tertiary: '#9370DB', 
      glow: '#DDA0DD', name: 'Intuitive Awakening'
    },
    852: { 
      primary: '#8A2BE2', secondary: '#9932CC', tertiary: '#BA55D3', 
      glow: '#DA70D6', name: 'Spiritual Order'
    },
    963: { 
      primary: '#FFD700', secondary: '#FFFF00', tertiary: '#FFFFE0', 
      glow: '#FFFACD', name: 'Divine Connection'
    }
  };

  function createWheel(root, initialTopHz = SORTED_FREQUENCIES[0] || 174) {
    root.innerHTML = `
      <div class="rotor"></div>
      <div class="pointer"></div>
      <div class="inner-circle">
        <div class="inner-pointer"></div>
      </div>
      <div class="labels"></div>
      <div class="hub">
        <div class="hz">—</div>
        <div class="sub">Hz</div>
        <div class="galaxy-name">—</div>
      </div>
      <div class="tag"></div>
    `;

    const rotor  = root.querySelector('.rotor');
    const pointer = root.querySelector('.pointer');
    const innerCircle = root.querySelector('.inner-circle');
    const innerPointer = root.querySelector('.inner-pointer');
    const labels = root.querySelector('.labels');
    const hubHz  = root.querySelector('.hub .hz');
    const galaxyName = root.querySelector('.hub .galaxy-name');
    const tag    = root.querySelector('.tag');

    tag.textContent = (root.id === 'wheelL') ? 'Left Channel' : 'Right Channel';

    // iOS Safari: prevent text selection/copy UI while dragging
    root.addEventListener('touchstart', (e) => {
      if (e.target && (e.target.closest('.wheel'))) {
        e.preventDefault();
      }
    }, { passive: false });
    root.addEventListener('selectstart', (e) => {
      e.preventDefault();
    });
    root.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });
    root.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // place 9 label positions around the circle with sorted frequencies (lowest at 12 o'clock)
    function layoutLabels() {
      labels.innerHTML = '';
      const b = root.getBoundingClientRect();
      const r = b.width/2 - 28;
      // keep the pointer pivot aligned with the wheel radius across screen sizes
      pointer.style.transformOrigin = `50% calc(50% + ${b.width/2}px)`;
      // Set inner pointer pivot to inner circle radius
      innerPointer.style.transformOrigin = `50% calc(50% + ${b.width * 0.2}px)`;
      for (let i = 0; i < SORTED_FREQUENCIES.length; i++) {
        const angle = -90 + (360 / SORTED_FREQUENCIES.length) * i; // Start at 12 o'clock (-90°)
        const rad = angle * Math.PI / 180;
        const x = b.width/2 + r * Math.cos(rad);
        const y = b.height/2 + r * Math.sin(rad);
        const s = document.createElement('span');
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.dataset.frequency = SORTED_FREQUENCIES[i];
        s.textContent = SORTED_FREQUENCIES[i];
        labels.appendChild(s);
      }
    }
    layoutLabels();
    // Make labels clickable to jump directly
    labels.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const val = Number(target.dataset.frequency);
      if (!Number.isFinite(val)) return;
      
      // Set continuous frequency to the clicked label frequency
      continuousFrequency = val;
      
      // Find frequency index in array for visual positioning
      const idx = SORTED_FREQUENCIES.indexOf(val);
      if (idx >= 0) {
        currentFrequencyIndex = idx;
        pointerAngleVisual = idx * step;
      }
      
      // Reset fine tune
      innerPointerRotation = 0;
      decimalOffset = 0;
      applyRotation();
      onchange?.(currentTopHz());
    });
    addEventListener('resize', layoutLabels, {passive:true});

    // pointer state - continuous frequency control
    let innerPointerRotation = 0; // degrees for fine-tuning
    let currentFrequencyIndex = 0; // index in SORTED_FREQUENCIES array (for label reference)
    let decimalOffset = 0; // decimal adjustment for fine-tuning
    let continuousFrequency = 0; // continuous frequency value for smooth dragging
    const step = 360 / SORTED_FREQUENCIES.length; // degrees per frequency step
    let pointerAngleVisual = 0; // visual angle for main pointer
    const DEGREES_PER_HZ = 2; // 2 degrees = 1 Hz for smooth continuous control
    
    // Set initial frequency
    const initIdx = SORTED_FREQUENCIES.indexOf(initialTopHz);
    if (initIdx >= 0) {
      currentFrequencyIndex = initIdx;
      continuousFrequency = initialTopHz;
      pointerAngleVisual = initIdx * step;
    } else {
      continuousFrequency = initialTopHz;
    }
    applyRotation();

    // drag to rotate pointer - ONLY when touching the pointer itself
    let dragging = false, lastAngle = 0;
    const center = () => {
      const b = root.getBoundingClientRect();
      return {x: b.left + b.width/2, y: b.top + b.height/2};
    };

    // Helper function to normalize angle differences to prevent jumps
    const normalizeAngleDiff = (diff) => {
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      return diff;
    };

    // Only allow dragging when pointer is touched
    pointer.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragging = true;
      const c = center();
      lastAngle = Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180/Math.PI;
      pointer.setPointerCapture?.(e.pointerId);
    });
    

    
    const endDrag = () => {
      dragging = false;
      innerDragging = false;
    };
    
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);

    // Inner circle drag logic for decimal adjustments
    let innerDragging = false, lastInnerAngle = 0;
    
    innerPointer.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      innerDragging = true;
      const c = center();
      lastInnerAngle = Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180/Math.PI;
      innerPointer.setPointerCapture?.(e.pointerId);
    });
    
    // Combined pointer move handler for both main and inner pointers
    addEventListener('pointermove', (e) => {
      if (dragging && !innerDragging) {
        e.preventDefault();
        const c = center();
        const currentAngle = Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180/Math.PI;
        const angleDiff = normalizeAngleDiff(currentAngle - lastAngle);
        if (Math.abs(angleDiff) < 90) {
          // Only update the visual angle. Frequency derives from angle in applyRotation()
          pointerAngleVisual += angleDiff;
          
          // Prevent going below zero by clamping to 12 o'clock if mapped frequency < 0
          const mapped = mapAngleToFrequency(pointerAngleVisual);
          if (mapped.frequency <= 0) {
            pointerAngleVisual = calculateZeroPositionAngle();
            innerPointerRotation = 0;
            decimalOffset = 0;
          }
          if (mapped.frequency >= MAX_FREQUENCY_HZ) {
            // Cap angle so mapped frequency does not exceed MAX
            // Find angle corresponding to MAX within current sector by solving inverse of mapAngleToFrequency
            // Approximation: keep current sector index but set ratio so frequency == MAX between fA..fB
            const stepAngle = 360 / SORTED_FREQUENCIES.length;
            const angleNorm = ((pointerAngleVisual % 360) + 360) % 360;
            const indexA = Math.floor(angleNorm / stepAngle);
            const indexB = (indexA + 1) % SORTED_FREQUENCIES.length;
            const fA = SORTED_FREQUENCIES[indexA];
            const fB = (indexB === 0 && fA >= 900) ? 1000 : SORTED_FREQUENCIES[indexB];
            const denom = (fB - fA);
            let ratio = denom !== 0 ? (MAX_FREQUENCY_HZ - fA) / denom : 0;
            ratio = Math.max(0, Math.min(1, ratio));
            pointerAngleVisual = indexA * stepAngle + ratio * stepAngle;
            decimalOffset = 0;
          }
          
          applyRotation();
          onchange?.(currentTopHz());
        }
        lastAngle = currentAngle;
      } else if (innerDragging && !dragging) {
        // Inner pointer logic for decimal adjustments
        e.preventDefault();
        
        const c = center();
        const currentAngle = Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180/Math.PI;
        const angleDiff = normalizeAngleDiff(currentAngle - lastInnerAngle);
        
        if (Math.abs(angleDiff) < 90) {
          // Convert angle difference to decimal frequency change
          // Each full 360° rotation = 10 Hz change for fine control
          const decimalChange = (angleDiff / 360) * 10; // 360° = 10 Hz
          let newDecimalOffset = decimalOffset + decimalChange;
          let potentialHz = continuousFrequency + newDecimalOffset;
          // Clamp to max
          if (potentialHz > MAX_FREQUENCY_HZ) {
            newDecimalOffset = MAX_FREQUENCY_HZ - continuousFrequency;
            potentialHz = MAX_FREQUENCY_HZ;
          }
          
          // Only allow movement if it doesn't go below 0 Hz
          if (potentialHz >= 0) {
            // Update inner pointer rotation and decimal offset
            innerPointerRotation += angleDiff;
            decimalOffset = newDecimalOffset;
            
            applyRotation();
            onchange?.(currentTopHz());
          } else {
            // At zero boundary - stop at zero
            decimalOffset = -continuousFrequency;
            innerPointerRotation = 0;
            continuousFrequency = 0;
            pointerAngleVisual = 0;
            
            applyRotation();
            onchange?.(currentTopHz());
          }
        }
        
        lastInnerAngle = currentAngle;
      }
    });

    function calculateZeroPositionAngle() {
      // Calculate the exact visual angle for zero frequency position (12 o'clock)
      // When frequency is 0, we want the pointer at 12 o'clock which is 0 degrees
      return 0;
    }

    // Map a wheel angle to an interpolated frequency between adjacent labels
    function mapAngleToFrequency(angleDegrees) {
      const stepAngle = 360 / SORTED_FREQUENCIES.length;
      const angle = ((angleDegrees % 360) + 360) % 360; // normalize 0..360
      const indexA = Math.floor(angle / stepAngle);
      const indexB = (indexA + 1) % SORTED_FREQUENCIES.length;
      const startAngle = indexA * stepAngle;
      const ratio = (angle - startAngle) / stepAngle; // 0..1 within the sector
      const fA = SORTED_FREQUENCIES[indexA];
      const fB = SORTED_FREQUENCIES[indexB];
      // Special handling for wrap-around sector (last label -> first label):
      // instead of interpolating down from 963 to 0.1, ramp 963 -> 1000.
      let interpolated;
      if (indexB === 0 && fA >= 900) {
        const endCap = 1000;
        interpolated = fA + (endCap - fA) * ratio;
      } else {
        interpolated = fA + (fB - fA) * ratio;
      }
      // Clamp within [0, 1000]
      const freq = Math.min(1000, Math.max(0, interpolated));
      return { frequency: freq, index: indexA };
    }

    // Inverse mapping: frequency -> wheel angle
    function mapFrequencyToAngle(freqHz) {
      const stepAngle = 360 / SORTED_FREQUENCIES.length;
      const clamped = Math.min(MAX_FREQUENCY_HZ, Math.max(0, Number(freqHz) || 0));
      if (clamped === 0) return calculateZeroPositionAngle();
      for (let indexA = 0; indexA < SORTED_FREQUENCIES.length; indexA++) {
        const indexB = (indexA + 1) % SORTED_FREQUENCIES.length;
        const fA = SORTED_FREQUENCIES[indexA];
        const fB = SORTED_FREQUENCIES[indexB];
        if (indexB === 0 && fA >= 900) {
          const endCap = 1000;
          if (clamped >= fA && clamped <= endCap) {
            const ratio = (clamped - fA) / (endCap - fA || 1);
            return indexA * stepAngle + ratio * stepAngle;
          }
        } else {
          if (clamped >= fA && clamped <= fB) {
            const ratio = (clamped - fA) / (fB - fA || 1);
            return indexA * stepAngle + ratio * stepAngle;
          }
        }
      }
      if (clamped < SORTED_FREQUENCIES[0]) return 0;
      return 359.999;
    }

    function applyRotation() {
      // Rotate the main pointer based on visual angle
      const visualAngle = ((pointerAngleVisual % 360) + 360) % 360;
      pointer.style.transition = 'none';
      pointer.style.transform = `translateX(-50%) rotate(${visualAngle}deg)`;

      // Derive base frequency from the pointer angle using sector interpolation
      const mapped = mapAngleToFrequency(visualAngle);
      continuousFrequency = Math.min(MAX_FREQUENCY_HZ, mapped.frequency);
      currentFrequencyIndex = mapped.index;
      // Rotate the inner pointer (use visual rotation for display)
      const visualInnerRotation = ((innerPointerRotation % 360) + 360) % 360;
      innerPointer.style.transition = 'none';
      innerPointer.style.transform = `translateX(-50%) rotate(${visualInnerRotation}deg)`;
      // Restore transitions for other properties after a frame
      requestAnimationFrame(() => {
        pointer.style.transition = 'width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease';
        innerPointer.style.transition = 'width 0.2s ease, height 0.2s ease, box-shadow 0.2s ease';
      });
      const currentHz = currentTopHz();
      hubHz.textContent = currentHz.toFixed(1);
      
      // Update galaxy colors dynamically - interpolate between frequencies
      const colors = getInterpolatedColors(currentHz);
      if (colors) {
        // Convert hex to rgba for CSS variables
        const primaryRgba = hexToRgba(colors.primary, 0.3);
        const secondaryRgba = hexToRgba(colors.secondary, 0.2);
        const tertiaryRgba = hexToRgba(colors.tertiary, 0.15);
        const glowRgba = hexToRgba(colors.glow, 0.4);
        
        // Update galaxy theme variables
        rotor.style.setProperty('--galaxy-primary', primaryRgba);
        rotor.style.setProperty('--galaxy-secondary', secondaryRgba);
        rotor.style.setProperty('--galaxy-tertiary', tertiaryRgba);
        rotor.style.setProperty('--galaxy-glow', glowRgba);
        
        // Update hub colors
        root.style.setProperty('--galaxy-primary', primaryRgba);
        root.style.setProperty('--galaxy-secondary', secondaryRgba);
        root.style.setProperty('--galaxy-glow', glowRgba);
        
        // Update galaxy name
        galaxyName.textContent = colors.name;
        
        // Update pointer color to match galaxy theme
        const pointerColor = `
          radial-gradient(circle at center, 
            rgba(255, 255, 255, 1) 0%, 
            rgba(255, 255, 255, 0.9) 20%,
            ${hexToRgba(colors.secondary, 0.8)} 40%,
            ${hexToRgba(colors.primary, 0.6)} 70%,
            transparent 100%
          )`;
        pointer.style.background = pointerColor;
        
        // Update pointer glow with galaxy colors
        const primaryRgb = hexToRgb(colors.primary);
        const glowRgb = hexToRgb(colors.glow);
        pointer.style.setProperty('--galaxy-primary', hexToRgba(colors.primary, 0.8));
        pointer.style.setProperty('--galaxy-secondary', hexToRgba(colors.secondary, 0.6));
        pointer.style.setProperty('--galaxy-glow', hexToRgba(colors.glow, 0.8));
      }
    }
    
    // Helper functions for color conversion
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }
    
    function hexToRgba(hex, alpha) {
      const rgb = hexToRgb(hex);
      return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})` : `rgba(50, 205, 50, ${alpha})`;
    }
    
    function getInterpolatedColors(frequency) {
      // Interpolate using known color anchors only, independent of category frequencies
      const COLOR_KEYS = Object.keys(GALAXY_COLORS).map(Number).sort((a,b)=>a-b);
      let lowerKey = COLOR_KEYS[0];
      let upperKey = COLOR_KEYS[COLOR_KEYS.length - 1];
      
      if (frequency <= lowerKey) return GALAXY_COLORS[lowerKey];
      if (frequency >= upperKey) return GALAXY_COLORS[upperKey];
      
      for (let i = 0; i < COLOR_KEYS.length - 1; i++) {
        const a = COLOR_KEYS[i];
        const b = COLOR_KEYS[i+1];
        if (frequency >= a && frequency <= b) {
          lowerKey = a;
          upperKey = b;
          break;
        }
      }
      const lowerColors = GALAXY_COLORS[lowerKey];
      const upperColors = GALAXY_COLORS[upperKey];
      const ratio = (frequency - lowerKey) / (upperKey - lowerKey);
      return {
        primary: interpolateColor(lowerColors.primary, upperColors.primary, ratio),
        secondary: interpolateColor(lowerColors.secondary, upperColors.secondary, ratio),
        tertiary: interpolateColor(lowerColors.tertiary, upperColors.tertiary, ratio),
        glow: interpolateColor(lowerColors.glow, upperColors.glow, ratio),
        name: ratio < 0.5 ? lowerColors.name : upperColors.name
      };
    }
    
    function interpolateColor(color1, color2, ratio) {
      const rgb1 = hexToRgb(color1);
      const rgb2 = hexToRgb(color2);
      
      if (!rgb1 || !rgb2) return color1;
      
      const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
      const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
      const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function getCurrentBaseFrequency() {
      // Return the continuous frequency from main pointer dragging
      return continuousFrequency;
    }
    
    function currentTopHz() {
      // Get continuous frequency and add decimal fine-tuning from inner pointer
      const totalHz = continuousFrequency + decimalOffset;
      
      // Ensure frequency within [0, MAX_FREQUENCY_HZ]
      return Math.min(MAX_FREQUENCY_HZ, Math.max(0, totalHz));
    }

    let onchange = null;
    return {
      getHz: () => currentTopHz(),
      setOnChange: fn => (onchange = fn),
      setHz: (hz) => {
        const target = Math.min(MAX_FREQUENCY_HZ, Math.max(0, Number(hz) || 0));
        innerPointerRotation = 0;
        decimalOffset = 0;
        pointerAngleVisual = mapFrequencyToAngle(target);
        continuousFrequency = target;
        applyRotation();
        onchange?.(currentTopHz());
      },
      reset: () => {
        // Reset to lowest frequency in array
        continuousFrequency = SORTED_FREQUENCIES[0] ?? 0.1;
        currentFrequencyIndex = 0;
        pointerAngleVisual = 0;
        innerPointerRotation = 0;
        decimalOffset = 0;
        applyRotation();
        onchange?.(currentTopHz());
      },
      element: root
    };
  }

  // AUDIO
  let audioCtx = null, voiceL=null, voiceR=null;
  // Vibrato nodes
  let vibLFO = null;          // oscillator used as LFO
  let vibDepthGain = null;    // gain scaling the LFO output (Hz depth)
  let vibEnabled = false;
  // Additional synthesis controls
  let currentWaveType = 'sine';
  let filterEnabled = false;
  let filterType = 'lowpass';
  let filterCutoff = 8000;
  let filterQ = 1;
  // Noise
  let noiseSource = null, noiseGain = null, noiseFilter = null;
  let currentNoiseType = 'off';
  let noiseLevel = 0;
  function ensureAudio(){
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const make = (pan)=> {
      const osc = audioCtx.createOscillator(); osc.type = currentWaveType;
      const biquad = audioCtx.createBiquadFilter();
      biquad.type = filterEnabled ? filterType : 'allpass';
      try { biquad.frequency.value = filterCutoff; } catch {}
      try { biquad.Q.value = filterQ; } catch {}
      const gain = audioCtx.createGain(); gain.gain.value = 0.25;
      const panner = audioCtx.createStereoPanner(); panner.pan.value = pan;
      osc.connect(biquad).connect(gain).connect(panner).connect(audioCtx.destination);
      return {osc,filter:biquad,gain,panner,started:false};
    };
    if (!voiceL) voiceL = make(-1);
    if (!voiceR) voiceR = make( +1);

    // Create vibrato graph if not present
    if (!vibLFO) {
      vibLFO = audioCtx.createOscillator();
      vibLFO.type = 'sine';
      vibDepthGain = audioCtx.createGain();
      vibDepthGain.gain.value = 0; // start disabled
      vibLFO.connect(vibDepthGain);
      vibLFO.start();
    }
    // Always reconnect vibrato to current oscillators
    if (vibDepthGain && voiceL && voiceR) {
      vibDepthGain.connect(voiceL.osc.frequency);
      vibDepthGain.connect(voiceR.osc.frequency);
    }

    ensureNoise();
  }
  function startAudio(){
    ensureAudio();
    const t = audioCtx.currentTime + 0.01;
    if (!voiceL.started){ voiceL.osc.start(t); voiceL.started=true; }
    if (!voiceR.started){ voiceR.osc.start(t); voiceR.started=true; }
    updateOscillators();
  }
  function stopAudio(){
    if (!audioCtx) return;
    if (voiceL?.started){ try{voiceL.osc.stop();}catch{} }
    if (voiceR?.started){ try{voiceR.osc.stop();}catch{} }
    voiceL = voiceR = null;
    // Reset vibrato connections since oscillators are destroyed
    if (vibLFO && vibDepthGain) {
      try {
        vibLFO.stop();
        vibLFO = null;
        vibDepthGain = null;
      } catch {}
    }
    // Stop noise
    try { noiseSource?.stop(); } catch {}
    noiseSource = null;
    setTransportActive('stop');
  }
  function setFreq(osc, hz){
    if (!osc) return;
    const now = audioCtx.currentTime;
    try { osc.frequency.setTargetAtTime(hz, now, 0.015); } catch { osc.frequency.value = hz; }
  }

  // Build wheels - start with lowest frequency at 12 o'clock
  let wheelL = createWheel(document.getElementById('wheelL'), SORTED_FREQUENCIES[0]);
  let wheelR = createWheel(document.getElementById('wheelR'), SORTED_FREQUENCIES[0]);
  // Binaural handling for sub-audible selections
  const BINAURAL_MIN_AUDIBLE_HZ = 20;
  // Use a low carrier at the audibility threshold to avoid high-pitched region for sub-audible beats
  const BINAURAL_CARRIER_HZ = 20;
  function updateOscillators(){
    if (!audioCtx || !voiceL || !voiceR) return;
    const l = wheelL.getHz();
    const r = wheelR.getHz();
    let fL, fR;
    const lLow = l < BINAURAL_MIN_AUDIBLE_HZ;
    const rLow = r < BINAURAL_MIN_AUDIBLE_HZ;
    if (lLow && rLow){
      // Both sides sub-audible: use symmetric low carrier around threshold
      const beat = Math.max(l, r);
      const carrier = Math.max(BINAURAL_MIN_AUDIBLE_HZ, BINAURAL_CARRIER_HZ);
      fL = Math.max(0.1, carrier - beat/2);
      fR = carrier + beat/2;
    } else if (lLow && !rLow){
      // Left is beat, right is carrier
      const beat = l;
      const carrier = Math.max(r, BINAURAL_MIN_AUDIBLE_HZ);
      fL = Math.max(0.1, carrier - beat/2);
      fR = carrier + beat/2;
    } else if (!lLow && rLow){
      // Right is beat, left is carrier
      const beat = r;
      const carrier = Math.max(l, BINAURAL_MIN_AUDIBLE_HZ);
      fL = Math.max(0.1, carrier - beat/2);
      fR = carrier + beat/2;
    } else {
      fL = l; fR = r;
    }
    setFreq(voiceL.osc, fL);
    setFreq(voiceR.osc, fR);
  }
  wheelL.setOnChange((hz) => { updateOscillators(); });
  wheelR.setOnChange((hz) => { updateOscillators(); });

  // Buttons
  document.getElementById('play').addEventListener('click', async ()=>{
    ensureAudio();
    if (audioCtx.state === 'suspended') await audioCtx.resume();
    startAudio();
    setTransportActive('play');
  });
  document.getElementById('pause').addEventListener('click', async ()=>{
    if (!audioCtx) return;
    try { await audioCtx.suspend(); } catch {}
    setTransportActive('pause');
  });
  document.getElementById('stop').addEventListener('click', ()=> stopAudio());
  document.getElementById('reset').addEventListener('click', ()=> {
    stopAudio();
    wheelL.reset();
    wheelR.reset();
  });

  // No category switching needed - only Solfeggio & Chakra frequencies available

  // Visual states and ripple feedback
  function setTransportActive(which){
    const ids = ['play','pause','stop','reset'];
    ids.forEach(id=>{
      const el = document.getElementById(id);
      if (!el) return;
      if (id === which) el.classList.add('is-active'); else el.classList.remove('is-active');
    });
  }
  function attachRipple(el){
    el?.addEventListener('click', (e)=>{
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size/2;
      const y = e.clientY - rect.top - size/2;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      el.appendChild(ripple);
      ripple.addEventListener('animationend', ()=> ripple.remove());
    });
  }
  ['play','pause','stop','reset'].forEach(id=> attachRipple(document.getElementById(id)));

  // Vibrato UI bindings
  const vibEnableEl = document.getElementById('vibEnable');
  const vibDepthEl = document.getElementById('vibDepth');
  const vibDepthVal = document.getElementById('vibDepthVal');
  const vibRateEl = document.getElementById('vibRate');
  const vibRateVal = document.getElementById('vibRateVal');

  function updateVibratoDepth(depthHz) {
    if (!audioCtx || !vibDepthGain) return;
    const now = audioCtx.currentTime;
    // Smoothly ramp to new depth
    try {
      vibDepthGain.gain.cancelScheduledValues(now);
      vibDepthGain.gain.setTargetAtTime(vibEnabled ? depthHz : 0, now, 0.1);
    } catch {
      vibDepthGain.gain.value = vibEnabled ? depthHz : 0;
    }
  }
  function updateVibratoRate(rateHz) {
    if (!audioCtx || !vibLFO) return;
    const now = audioCtx.currentTime;
    try {
      vibLFO.frequency.setTargetAtTime(rateHz, now, 0.1);
    } catch {
      vibLFO.frequency.value = rateHz;
    }
  }

  function refreshVibratoUI() {
    vibDepthVal.textContent = `${Number(vibDepthEl.value).toFixed(1)} Hz`;
    vibRateVal.textContent = `${Number(vibRateEl.value).toFixed(1)} Hz`;
  }

  vibEnableEl?.addEventListener('change', () => {
    vibEnabled = vibEnableEl.checked;
    ensureAudio();
    updateVibratoDepth(Number(vibDepthEl.value));
  });
  vibDepthEl?.addEventListener('input', () => {
    refreshVibratoUI();
    ensureAudio();
    updateVibratoDepth(Number(vibDepthEl.value));
  });
  vibRateEl?.addEventListener('input', () => {
    refreshVibratoUI();
    ensureAudio();
    updateVibratoRate(Number(vibRateEl.value));
  });

  // Initialize displayed values
  refreshVibratoUI();

  // Presets: Frequency Library
  const freqLibraryEl = document.getElementById('freqLibrary');
  const freqApplyBtn = document.getElementById('freqApply');
  if (freqLibraryEl) {
    const frag = document.createDocumentFragment();
    SORTED_FREQUENCIES.forEach(f => {
      const opt = document.createElement('option');
      opt.value = String(f);
      const name = GALAXY_COLORS[f]?.name;
      opt.textContent = name ? `${f} Hz — ${name}` : `${f} Hz`;
      frag.appendChild(opt);
    });
    freqLibraryEl.appendChild(frag);
  }
  freqApplyBtn?.addEventListener('click', () => {
    const val = Number(freqLibraryEl?.value || '0');
    if (!Number.isFinite(val)) return;
    wheelL.setHz(val);
    wheelR.setHz(val);
    updateOscillators();
  });

  // Binaural Category presets
  const bbCategoryEl = document.getElementById('bbCategory');
  const bbCarrierEl = document.getElementById('bbCarrier');
  const bbApplyBtn = document.getElementById('bbApply');
  bbApplyBtn?.addEventListener('click', () => {
    const beat = Number(bbCategoryEl?.value || '0');
    if (!Number.isFinite(beat) || beat <= 0) return;
    let carrier = Number(bbCarrierEl?.value || '200');
    if (!Number.isFinite(carrier)) carrier = 200;
    carrier = Math.min(MAX_FREQUENCY_HZ - beat/2, Math.max(beat/2, carrier));
    const leftHz = Math.max(0, carrier - beat/2);
    const rightHz = Math.min(MAX_FREQUENCY_HZ, carrier + beat/2);
    wheelL.setHz(leftHz);
    wheelR.setHz(rightHz);
    updateOscillators();
  });

  // Wave type
  const waveTypeEl = document.getElementById('waveType');
  waveTypeEl?.addEventListener('change', () => {
    currentWaveType = waveTypeEl.value || 'sine';
    ensureAudio();
    if (voiceL?.osc) voiceL.osc.type = currentWaveType;
    if (voiceR?.osc) voiceR.osc.type = currentWaveType;
  });

  // Filter controls
  const filterEnableEl = document.getElementById('filterEnable');
  const filterTypeEl = document.getElementById('filterType');
  const filterCutoffEl = document.getElementById('filterCutoff');
  const filterCutoffVal = document.getElementById('filterCutoffVal');
  const filterQEl = document.getElementById('filterQ');
  const filterQVal = document.getElementById('filterQVal');

  function refreshFilterUI(){
    if (filterCutoffVal) filterCutoffVal.textContent = `${Number(filterCutoffEl?.value || 0).toFixed(0)} Hz`;
    if (filterQVal) filterQVal.textContent = `${Number(filterQEl?.value || 0).toFixed(2)}`;
  }
  function applyFilter(){
    ensureAudio();
    if (voiceL?.filter) {
      voiceL.filter.type = filterEnabled ? filterType : 'allpass';
      try { voiceL.filter.frequency.setTargetAtTime(filterCutoff, audioCtx.currentTime, 0.05); } catch { voiceL.filter.frequency.value = filterCutoff; }
      try { voiceL.filter.Q.setTargetAtTime(filterQ, audioCtx.currentTime, 0.05); } catch { voiceL.filter.Q.value = filterQ; }
    }
    if (voiceR?.filter) {
      voiceR.filter.type = filterEnabled ? filterType : 'allpass';
      try { voiceR.filter.frequency.setTargetAtTime(filterCutoff, audioCtx.currentTime, 0.05); } catch { voiceR.filter.frequency.value = filterCutoff; }
      try { voiceR.filter.Q.setTargetAtTime(filterQ, audioCtx.currentTime, 0.05); } catch { voiceR.filter.Q.value = filterQ; }
    }
  }
  filterEnableEl?.addEventListener('change', () => { filterEnabled = !!filterEnableEl.checked; applyFilter(); });
  filterTypeEl?.addEventListener('change', () => { filterType = filterTypeEl.value || 'lowpass'; applyFilter(); });
  filterCutoffEl?.addEventListener('input', () => { filterCutoff = Number(filterCutoffEl.value)||8000; refreshFilterUI(); applyFilter(); });
  filterQEl?.addEventListener('input', () => { filterQ = Number(filterQEl.value)||1; refreshFilterUI(); applyFilter(); });
  refreshFilterUI();

  // Noise controls
  const noiseTypeEl = document.getElementById('noiseType');
  const noiseLevelEl = document.getElementById('noiseLevel');
  const noiseLevelVal = document.getElementById('noiseLevelVal');

  function refreshNoiseUI(){ if (noiseLevelVal) noiseLevelVal.textContent = `${Number(noiseLevelEl?.value || 0).toFixed(2)}`; }

  function ensureNoise(){
    if (!audioCtx) return;
    if (!noiseGain) {
      noiseGain = audioCtx.createGain();
      noiseGain.gain.value = noiseLevel;
      noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'allpass';
      noiseFilter.connect(noiseGain).connect(audioCtx.destination);
    }
    if (!noiseSource) {
      const buffer = createWhiteNoiseBuffer(audioCtx, 2);
      const src = audioCtx.createBufferSource();
      src.buffer = buffer; src.loop = true; src.connect(noiseFilter);
      try { src.start(); } catch {}
      noiseSource = src;
    }
    applyNoise();
  }
  function createWhiteNoiseBuffer(ctx, seconds){
    const length = Math.max(1, Math.floor((ctx.sampleRate||44100) * (seconds||2)));
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i=0;i<length;i++){ data[i] = Math.random()*2-1; }
    return buffer;
  }
  function applyNoise(){
    if (!audioCtx || !noiseGain || !noiseFilter) return;
    if (noiseTypeEl) currentNoiseType = noiseTypeEl.value || 'off';
    if (noiseLevelEl) noiseLevel = Number(noiseLevelEl.value) || 0;
    try { noiseGain.gain.setTargetAtTime(noiseLevel, audioCtx.currentTime, 0.1); } catch { noiseGain.gain.value = noiseLevel; }
    if (currentNoiseType === 'off') {
      noiseGain.gain.value = 0;
      noiseFilter.type = 'allpass';
    } else if (currentNoiseType === 'white') {
      noiseFilter.type = 'allpass';
    } else if (currentNoiseType === 'pink') {
      noiseFilter.type = 'lowshelf';
      noiseFilter.frequency.value = 500; noiseFilter.gain.value = 6;
    } else if (currentNoiseType === 'brown') {
      noiseFilter.type = 'lowshelf';
      noiseFilter.frequency.value = 500; noiseFilter.gain.value = 12;
    }
  }
  noiseTypeEl?.addEventListener('change', () => { ensureAudio(); ensureNoise(); applyNoise(); });
  noiseLevelEl?.addEventListener('input', () => { refreshNoiseUI(); ensureAudio(); ensureNoise(); applyNoise(); });
  refreshNoiseUI();

  // THEME: persist light/dark and toggle
  const THEME_KEY = 'twinwheels-theme';
  const themeToggle = document.getElementById('themeToggle');
  const applyTheme = (mode) => {
    document.body.setAttribute('data-theme', mode);
    if (themeToggle){
      themeToggle.dataset.mode = mode;
      themeToggle.textContent = mode === 'dark' ? '🌙' : '☀️';
      const themeColor = mode === 'dark' ? '#0f1220' : '#f8fafc';
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) themeMeta.setAttribute('content', themeColor);
    }
  };
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(storedTheme || (prefersDark ? 'dark' : 'light'));
  themeToggle?.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // PWA: register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(()=>{});
    });
  }

})();
