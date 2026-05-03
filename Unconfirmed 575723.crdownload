
class D6DriftInjector extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(8192);
    this.writeIndex = 0;
    this.currentDelay = 0; 
    this.isReflected = false;
    this.N = 65.664; // 44100 / 671.6

    this.port.onmessage = (event) => {
      if (event.data.type === 'INJECT_DRIFT') {
        const k = event.data.k; 
        
        // 1. Reflection
        this.isReflected = !this.isReflected;
        
        // 2. Rotation
        this.currentDelay = -this.currentDelay - (k / 6.0) * this.N;
      }
    };
  }

  sinc(x) {
    if (x === 0) return 1.0;
    const px = Math.PI * x;
    return Math.sin(px) / px;
  }

  getFractionalSample(readIndex) {
    let base = Math.floor(readIndex);
    let frac = readIndex - base;
    let sum = 0;
    
    // 4-point windowed-sinc interpolation
    for (let i = -1; i <= 2; i++) {
      let idx = (base + i);
      while (idx < 0) idx += this.buffer.length;
      idx = idx % this.buffer.length;
      
      let x = frac - i;
      // Hann window over exactly the 4 points
      let w = 0.5 * (1.0 + Math.cos(Math.PI * (x - 0.5) / 2.0)); 
      
      sum += this.buffer[idx] * this.sinc(x) * w;
    }
    return sum;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0] || !output || !output[0]) return true;

    const channelIn = input[0];
    const channelOut = output[0];
    
    for (let i = 0; i < channelIn.length; i++) {
        // Write incoming signal to ring buffer
        this.buffer[this.writeIndex] = channelIn[i];
        
        // Exponential decay towards 0 (HOLD)
        this.currentDelay *= 0.9995; 
        
        // Read from fractional delay pointer
        let readIdx = this.writeIndex - this.currentDelay;
        while (readIdx < 0) readIdx += this.buffer.length;
        
        channelOut[i] = this.getFractionalSample(readIdx);
        
        this.writeIndex = (this.writeIndex + 1) % this.buffer.length;
    }
    
    // Send periodic updates
    if (this.writeIndex % 512 === 0) {
        this.port.postMessage({ type: 'STATUS', delay: this.currentDelay });
    }
    
    return true;
  }
}

registerProcessor('d6-drift-injector', D6DriftInjector);
