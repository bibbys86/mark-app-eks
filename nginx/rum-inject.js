// Datadog RUM 초기화 스크립트 (nginx 삽입용)
(function() {
    try {
        console.log('💜 Initializing Datadog RUM...');
        
        // Check if DD_RUM is available directly
        if (typeof window.DD_RUM !== 'undefined') {
            initializeRum();
            return;
        }
        
        // Load RUM SDK from CDN directly
        loadFromCDN();
        
    } catch (error) {
        console.error('❌ Error loading RUM script:', error);
    }
    
    function loadFromCDN() {
        try {
            var script = document.createElement('script');
            script.src = 'https://www.datadoghq-browser-agent.com/us1/v5/datadog-rum.js';
            script.async = true;
            
            script.onload = function() {
                console.log('✅ CDN RUM SDK loaded successfully');
                setTimeout(initializeRum, 100);
            };
            
            script.onerror = function() {
                console.error('❌ Failed to load RUM SDK from CDN, trying local...');
                loadLocal();
            };
            
            document.head.appendChild(script);
        } catch (error) {
            console.error('❌ Error loading RUM from CDN:', error);
            loadLocal();
        }
    }
    
    function loadLocal() {
        try {
            var script = document.createElement('script');
            script.src = '/datadog-rum-sdk.js';
            script.async = true;
            
            script.onload = function() {
                console.log('✅ Local RUM SDK loaded successfully');
                setTimeout(initializeRum, 100);
            };
            
            script.onerror = function() {
                console.error('❌ Failed to load local RUM SDK');
            };
            
            document.head.appendChild(script);
        } catch (error) {
            console.error('❌ Error loading local RUM:', error);
        }
    }
    
    function initializeRum() {
        try {
            if (typeof window.DD_RUM === 'undefined') {
                console.error('❌ DD_RUM is not available');
                return;
            }
            
            window.DD_RUM.init({
                // TODO: 올바른 Datadog RUM Application ID와 Client Token으로 교체 필요
                // 현재 값들은 예시이므로 403 오류 발생
                applicationId: '8feee4a7-9a17-4dd4-b1de-af6348850abf',
                clientToken: 'pub54bab8eadfe4cb23ca0199e3467c24db',
                site: 'datadoghq.com',
                service: 'mark-shop-nginx-proxy',
                env: 'local-k8s',
                version: '1.0.0',
                sessionSampleRate: 100,
                sessionReplaySampleRate: 100,
                trackUserInteractions: true,
                trackResources: true,
                trackLongTasks: true,
                // Ad Blocker 우회를 위한 프록시 설정
                proxyUrl: '/dd-rum/',
                
                // Privacy 설정 추가
                defaultPrivacyLevel: 'allow',
                // 특정 요소만 마스킹
                maskTextContent: false,
                maskUserInput: false,
                
                // RUM과 APM 연결을 위한 설정 (Datadog 문서 기준)
                // allowedTracingUrls: first-party origins for RUM-APM correlation
                allowedTracingUrls: [
                    // 현재 도메인
                    window.location.origin,
                    // 백엔드 API 호출
                    /^http:\/\/localhost:30080\/api\/.*$/,
                    /^http:\/\/simple-shop\.local\/api\/.*$/,
                    // 내부 서비스 호출
                    'http://backend-service:3000',
                    'http://frontend-service',
                ],
                
                // Trace sample rate for APM correlation
                traceSampleRate: 100,
                
                // First-party hosts with tracing headers
                // 이 설정으로 RUM이 APM traces와 연결됩니다
                firstPartyHosts: [
                    'localhost:30080',
                    'simple-shop.local',
                    'backend-service:3000',
                    'frontend-service'
                ]
            });
            
            window.DD_RUM.startSessionReplayRecording();
            console.log('✅ Datadog RUM initialized successfully with proxy');
            
        } catch (error) {
            console.error('❌ Error initializing RUM:', error);
        }
    }
})(); 