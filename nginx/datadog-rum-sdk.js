// Minimal Datadog RUM SDK Polyfill
(function(window) {
    'use strict';
    
    console.log('📦 Loading Datadog RUM SDK...');
    
    // Basic RUM implementation
    var DD_RUM = {
        version: '5.0.0-local',
        initialized: false,
        
        init: function(config) {
            try {
                console.log('🔧 Initializing RUM with config:', config);
                this.config = config || {};
                this.initialized = true;
                
                // Start collecting basic data
                this._collectPageView();
                this._setupErrorTracking();
                
                console.log('✅ RUM SDK initialized successfully');
                return this;
            } catch (error) {
                console.error('❌ RUM init error:', error);
                return this;
            }
        },
        
        startSessionReplayRecording: function() {
            console.log('📹 Session replay recording started');
        },
        
        addUserAction: function(name, context) {
            this._sendEvent('action', { name: name, context: context });
        },
        
        addError: function(error, context) {
            this._sendEvent('error', { error: error, context: context });
        },
        
        setUser: function(user) {
            this.user = user;
        },
        
        _collectPageView: function() {
            this._sendEvent('view', {
                url: window.location.href,
                title: document.title,
                timestamp: Date.now()
            });
        },
        
        _setupErrorTracking: function() {
            var self = this;
            window.addEventListener('error', function(event) {
                self.addError(event.error, {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
            
            window.addEventListener('unhandledrejection', function(event) {
                self.addError(event.reason, { type: 'promise_rejection' });
            });
        },
        
        _sendEvent: function(type, data) {
            if (!this.initialized) return;
            
            var payload = {
                type: type,
                data: data,
                timestamp: Date.now(),
                service: this.config.service,
                env: this.config.env,
                version: this.config.version
            };
            
            // Send to proxy endpoint
            if (this.config.proxyUrl) {
                this._sendToProxy(payload);
            }
            
            console.log('📊 RUM Event:', type, data);
        },
        
        _sendToProxy: function(payload) {
            try {
                fetch(this.config.proxyUrl + 'v1/input/' + this.config.clientToken, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }).catch(function(error) {
                    console.warn('⚠️ Failed to send RUM data:', error);
                });
            } catch (error) {
                console.warn('⚠️ RUM proxy error:', error);
            }
        }
    };
    
    // Expose DD_RUM globally
    window.DD_RUM = DD_RUM;
    
    console.log('✅ Datadog RUM SDK polyfill loaded');
    
})(window); 