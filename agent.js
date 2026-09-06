<!-- 🤖 Master AI (Clean UI) -->
<div class="owner-only" id="master-ai-card" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); margin-bottom: 20px;">

    <!-- Top Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #f3f4f6; padding-bottom: 10px;">
        <span style="font-size: 18px; font-weight: bold; color: #1e3a8a; display: flex; align-items: center; gap: 8px;">
            <svg fill="#1a73e8" width="22" height="22" viewBox="0 0 24 24"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"/></svg>
            Master AI 
        </span>
        <button onclick="masterAgent.stop()" style="background: #ef4444; color: white; border: none; padding: 4px 12px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold;">🛑 চুপ</button>
    </div>

    <!-- Chat History Area -->
    <div id="master-chat-history" style="background: #ffffff; height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; margin-bottom: 15px; padding-right: 5px;">
    </div>

    <!-- File Preview Box -->
    <div id="file-preview-box" style="display: none; background: #e8eaed; padding: 5px 10px; border-radius: 8px; margin-bottom: 10px; font-size: 13px; color: #1a73e8; font-weight: bold;">
        📎 <span id="file-name-text">ফাইল সিলেক্ট করা হয়েছে</span>
        <button onclick="masterAgent.removeFile()" style="background: none; border: none; color: #ef4444; margin-left: 10px; cursor: pointer; font-weight: bold;">✖ মুছে ফেলুন</button>
    </div>

    <!-- Clean Input Box -->
    <div style="display: flex; gap: 12px; align-items: center; background: #f0f4f9; padding: 10px 15px; border-radius: 30px;">
        
        <!-- File Upload -->
        <input type="file" id="ai-file-upload" style="display: none;" accept="image/*,.pdf,.doc,.docx" onchange="masterAgent.handleFileUpload(event)">
        <label for="ai-file-upload" style="cursor: pointer; display: flex; align-items: center;" title="ফাইল আপলোড করুন">
            <svg style="color: #444746; min-width: 24px;" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </label>

        <!-- Text Input -->
        <input type="text" id="ai-command-input" placeholder="Master AI-কে প্রশ্ন করুন..." style="flex: 1; border: none; outline: none; background: transparent; font-size: 16px; color: #1f1f1f; min-width: 80px;">

        <!-- Mic Button -->
        <button id="master-mic-btn" style="background: #fff; border: 1px solid #dadce0; border-radius: 50%; min-width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.3s;" title="ভয়েস কমান্ড">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#444746"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
        </button>

        <!-- Send Button -->
        <button onclick="masterAgent.send()" style="background: #e8eaed; border: none; border-radius: 50%; min-width: 40px; height: 40px; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: 0.3s;">
             <svg width="22" height="22" viewBox="0 0 24 24" fill="#1a73e8"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
    </div>
</div>

<!-- এখানেই আপনার আলাদা করা ব্রেইন কানেক্ট করা হলো -->
<script src="agent.js"></script>
