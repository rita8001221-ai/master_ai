const masterAgent = {
    // আপনার নতুন দেওয়া API Key এখানে সেট করা হয়েছে:
    apiKeys: ["AQ.Ab8RN6JWXAYFqetkDaBWYcbRRVMYJ3yEJxoCHwMr4t9JllcaHg"],
    uploadedFileBase64: null,
    uploadedFileMime: null,
    isLiveMode: false,
    isInit: false,

    init: function() {
        if(this.isInit) return;
        
        this.historyDiv = document.getElementById('master-chat-history');
        this.inputField = document.getElementById('ai-command-input');
        this.micBtn = document.getElementById('master-mic-btn');
        this.previewBox = document.getElementById('file-preview-box');
        this.fileNameText = document.getElementById('file-name-text');

        if(!this.historyDiv) return; 
        
        this.isInit = true;
        this.appendMsg('agent', 'জি মাস্টার! নতুন কি (Key) সেট করা হয়েছে। জেমিনি ব্রেইন এখন রেডি!');
        this.setupMic();
        
        if(this.inputField) {
            this.inputField.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') this.send(); 
            });
        }
    },

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if(!file) return;
        if(this.fileNameText) this.fileNameText.innerText = file.name;
        if(this.previewBox) this.previewBox.style.display = 'block';
        
        const reader = new FileReader();
        reader.onloadend = () => {
            this.uploadedFileBase64 = reader.result.split(',')[1];
            this.uploadedFileMime = file.type;
        };
        reader.readAsDataURL(file);
    },

    removeFile: function() {
        this.uploadedFileBase64 = null;
        this.uploadedFileMime = null;
        if(this.previewBox) this.previewBox.style.display = 'none';
        let uploadInput = document.getElementById('ai-file-upload');
        if(uploadInput) uploadInput.value = "";
    },

    appendMsg: function(sender, text) {
        if(!this.historyDiv) return;
        let div = document.createElement('div');
        div.style.display = 'flex'; div.style.flexDirection = 'column'; div.style.marginBottom = '5px';

        if(sender === 'user') {
            div.style.alignSelf = 'flex-end'; div.style.background = '#f0f4f9'; div.style.padding = '12px 18px'; div.style.borderRadius = '20px'; div.style.borderBottomRightRadius = '4px'; div.style.maxWidth = '85%'; div.style.color = '#1f1f1f'; div.style.fontSize = '15px';
            div.innerText = text;
        } else {
            div.style.alignSelf = 'flex-start'; div.style.width = '100%';
            let safeText = text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, ' ');

            div.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <svg fill="#1a73e8" width="22" height="22" viewBox="0 0 24 24"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/></svg>
                    <span style="font-size: 14px; color: #444746; font-weight: bold;">Master AI</span>
                </div>
                <div style="font-size: 15px; color: #1f1f1f; line-height: 1.6; padding-left: 30px;">
                    ${text.replace(/\n/g, '<br>')}
                </div>
            `;
        }
        this.historyDiv.appendChild(div);
        this.historyDiv.scrollTop = this.historyDiv.scrollHeight;
    },

    speak: function(text) {
        try {
            window.speechSynthesis.cancel();
            let msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'bn-IN'; 
            msg.rate = 0.95;
            msg.onend = () => { if(this.isLiveMode && this.micBtn) { setTimeout(() => { this.micBtn.click(); }, 800); } };
            window.speechSynthesis.speak(msg);
        } catch(e) {}
    },

    stop: function() { 
        this.isLiveMode = false;
        window.speechSynthesis.cancel(); 
    },

    send: async function() {
        let text = this.inputField ? this.inputField.value.trim() : '';
        let hasFile = (this.uploadedFileBase64 !== null);
        let fileName = this.fileNameText ? this.fileNameText.innerText : '';
        
        if(!text && !hasFile) return;
        
        if(text) this.appendMsg('user', text);
        if(hasFile) this.appendMsg('user', `[ফাইল আপলোড: ${fileName}]`);
        
        if(this.inputField) this.inputField.value = '';

        if(text.toLowerCase().includes("চুপ") || text.toLowerCase().includes("স্টপ")) {
            this.stop(); this.appendMsg('agent', "জি মাস্টার, আমি চুপ হয়ে গেলাম।"); this.removeFile(); return;
        }

        let loadingId = "load-" + Date.now();
        let loadDiv = document.createElement('div');
        loadDiv.id = loadingId;
        loadDiv.style.paddingLeft = '30px'; loadDiv.style.color = '#1a73e8'; loadDiv.style.fontSize = '14px'; loadDiv.innerText = "মাস্টার, ভাবছি...";
        this.historyDiv.appendChild(loadDiv);
        this.historyDiv.scrollTop = this.historyDiv.scrollHeight;

        try {
            // জেমিনি (Gemini) ব্রেইন কল
            let contentsArray = [{ parts: [] }];
            if(text) contentsArray[0].parts.push({ text: text });
            if(hasFile) contentsArray[0].parts.push({ inlineData: { mimeType: this.uploadedFileMime, data: this.uploadedFileBase64 } });

            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKeys[0]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: contentsArray })
            });
            
            const geminiData = await geminiRes.json();
            if (!geminiRes.ok) throw new Error("Gemini Error");
            
            let loadEl = document.getElementById(loadingId);
            if(loadEl) loadEl.remove();

            let reply = geminiData.candidates[0].content.parts[0].text;
            this.appendMsg('agent', reply);
            this.speak(reply);
            this.removeFile();

        } catch (e) {
            let loadEl = document.getElementById(loadingId);
            if(loadEl) loadEl.remove();
            
            // যদি এই নতুন কি-টাও কাজ না করে, তাহলে পরিষ্কার বাংলায় জানাবে
            this.appendMsg('agent', `মাস্টার, গুগলের জেমিনি এপিআই এখনো উত্তর দিচ্ছে না। হয়তো নতুন কি-টা অ্যাক্টিভ হতে একটু সময় লাগছে বা লিমিট শেষ। দয়া করে কিছুক্ষণ পর আবার ট্রাই করুন।`);
            this.isLiveMode = false;
        }
    },

    setupMic: function() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if(SpeechRec) {
            const rec = new SpeechRec(); 
            rec.lang = 'bn-IN';
            if(!this.micBtn) return;
            
            this.micBtn.onclick = () => { 
                this.micBtn.style.background = "#e8eaed"; 
                this.isLiveMode = true; 
                try { rec.start(); } catch(e) {}
            };
            rec.onresult = (e) => { 
                this.micBtn.style.background = "#fff"; 
                if(this.inputField) this.inputField.value = e.results[0][0].transcript; 
                this.send(); 
            };
            rec.onerror = (e) => { 
                this.micBtn.style.background = "#fff"; 
                this.isLiveMode = false; 
            };
        }
    }
};

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => { masterAgent.init(); }, 500); });
setInterval(() => { if(!masterAgent.isInit) masterAgent.init(); }, 1000);
