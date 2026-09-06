const masterAgent = {
    historyDiv: document.getElementById('master-chat-history'),
    inputField: document.getElementById('ai-command-input'),
    micBtn: document.getElementById('master-mic-btn'),
    previewBox: document.getElementById('file-preview-box'),
    fileNameText: document.getElementById('file-name-text'),
    
    // আপনার অরিজিনাল জেমিনি কি (Key)
    apiKeys: [
        "AQ.Ab8RN6I52M16r9VJyh1qoGL0LS_p2y_3k8YGemxBzjoIYmAduA", 
    ],
    
    uploadedFileBase64: null,
    uploadedFileMime: null,
    isLiveMode: false,

    init: function() {
        this.appendMsg('agent', 'জি মাস্টার! আপনার অরিজিনাল জেমিনি ব্রেইন এবং অটোমেটিক ব্যাকআপ সিস্টেম ১০০% অ্যাক্টিভ। আমি রেডি!');
        this.setupMic();
        this.inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.send(); });
    },

    handleFileUpload: function(event) {
        const file = event.target.files[0];
        if(!file) return;
        this.fileNameText.innerText = file.name;
        this.previewBox.style.display = 'block';
        
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
        this.previewBox.style.display = 'none';
        let uploadInput = document.getElementById('ai-file-upload');
        if(uploadInput) uploadInput.value = "";
    },

    appendMsg: function(sender, text) {
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
        window.speechSynthesis.cancel();
        let msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'bn-IN'; 
        msg.rate = 0.95;
        
        msg.onend = () => {
            if(this.isLiveMode) {
                setTimeout(() => { this.micBtn.click(); }, 800); 
            }
        };
        window.speechSynthesis.speak(msg);
    },

    stop: function() { 
        this.isLiveMode = false;
        window.speechSynthesis.cancel(); 
    },

    send: async function() {
        let text = this.inputField.value.trim();
        let hasFile = (this.uploadedFileBase64 !== null);
        let fileName = this.fileNameText.innerText;
        
        if(!text && !hasFile) return;
        
        if(text) this.appendMsg('user', text);
        if(hasFile) this.appendMsg('user', `[ফাইল আপলোড: ${fileName}]`);
        
        this.inputField.value = '';

        if(text.toLowerCase().includes("চুপ") || text.toLowerCase().includes("স্টপ")) {
            this.stop(); 
            this.appendMsg('agent', "জি মাস্টার, আমি লাইভ মোড অফ করে চুপ হয়ে গেলাম।"); 
            this.removeFile(); 
            return;
        }

        let loadingId = "load-" + Date.now();
        let loadDiv = document.createElement('div');
        loadDiv.id = loadingId;
        loadDiv.style.paddingLeft = '30px'; loadDiv.style.color = '#1a73e8'; loadDiv.style.fontSize = '14px'; loadDiv.innerText = "মাস্টার, ভাবছি...";
        this.historyDiv.appendChild(loadDiv);
        this.historyDiv.scrollTop = this.historyDiv.scrollHeight;

        try {
            // ১. জেমিনি (Gemini) ব্রেইন দিয়ে ট্রাই
            let contentsArray = [{ parts: [] }];
            if(text) contentsArray[0].parts.push({ text: text });
            if(hasFile) contentsArray[0].parts.push({ inlineData: { mimeType: this.uploadedFileMime, data: this.uploadedFileBase64 } });

            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKeys[0]}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: contentsArray })
            });
            
            const geminiData = await geminiRes.json();
            
            if (!geminiRes.ok) throw new Error("Gemini API Failed");
            
            document.getElementById(loadingId).remove();
            let reply = geminiData.candidates[0].content.parts[0].text;
            this.appendMsg('agent', reply);
            this.speak(reply);
            this.removeFile();

        } catch (e) {
            // ২. অটোমেটিক ব্যাকআপ ব্রেইনে সুইচ (Pollinations)
            try {
                let promptText = text;
                if (hasFile) promptText += ` (Context file: ${fileName})`;

                const fallbackRes = await fetch(`https://text.pollinations.ai/openai`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: "You are 'Master AI', an intelligent assistant. Reply concisely in Bengali." },
                            { role: "user", content: promptText }
                        ],
                        model: "openai" 
                    })
                });
                
                const fallbackData = await fallbackRes.json();
                document.getElementById(loadingId).remove();

                if (fallbackData.choices && fallbackData.choices[0].message) {
                    let reply = fallbackData.choices[0].message.content;
                    this.appendMsg('agent', reply + " ⚠️ (ব্যাকআপ ব্রেইন থেকে উত্তর দেওয়া হয়েছে)");
                    this.speak(reply);
                    this.removeFile();
                } else {
                    throw new Error("No Data");
                }
            } catch (err) {
                document.getElementById(loadingId).remove();
                this.appendMsg('agent', `মাস্টার, নেটওয়ার্কে সমস্যা হচ্ছে!`);
                this.isLiveMode = false;
            }
        }
    },

    setupMic: function() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if(SpeechRec) {
            const rec = new SpeechRec(); 
            rec.lang = 'bn-IN';
            this.micBtn.onclick = () => { 
                this.micBtn.style.background = "#e8eaed"; 
                this.isLiveMode = true; 
                rec.start(); 
            };
            rec.onresult = (e) => { 
                this.micBtn.style.background = "#fff"; 
                this.inputField.value = e.results[0][0].transcript; 
                this.send(); 
            };
            rec.onerror = () => { 
                this.micBtn.style.background = "#fff"; 
                this.isLiveMode = false; 
            };
        }
    }
};
window.onload = function() { setTimeout(() => masterAgent.init(), 500); };
