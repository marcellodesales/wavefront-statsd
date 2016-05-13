{ 
  port: 8125
, backends: ["./backends/wavefront"]
, wavefrontHost: process.env.WAVEFRONT_HOST || '127.0.0.1'
, wavefrontPort: process.env.WAVEFRONT_PORT || 2878
, wavefrontTagPrefix: '~'
, keyNameSanitize: false
}
