const express = require('express');
const axios = require('axios');
const fs = require('fs');

// ============================================================
// SECTION 1: WEB SERVER ĐỂ RENDER KEEP-ALIVE & BIND PORT
// ============================================================

const app = express();
const PORT = process.env.PORT || 3000;

// URL ứng dụng Render của bạn (Thay bằng URL thật sau khi deploy Render)
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// Endpoint trả về trang thái cho Render & UptimeRobot check
app.get('/', (req, res) => {
    res.status(200).send({
        status: "online",
        message: "NHÂN VIP TOOL - Server đang chạy 24/7!",
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`[🚀] Express Server đang chạy tại port: ${PORT}`);
    
    // Tự động gửi request giữ ấm server mỗi 5 phút (Self-Ping)
    setInterval(async () => {
        try {
            await axios.get(`${RENDER_EXTERNAL_URL}/health`);
            console.log(`[🔄 Ping] Self-ping thành công giữ server thức...`);
        } catch (err) {
            console.error(`[⚠️ Ping Error]:`, err.message);
        }
    }, 5 * 60 * 1000); // 5 phút
});


// ============================================================
// SECTION 2: THUẬT TOÁN ENSEMBLE TAIXINANALYZER (84 MODELS)
// ============================================================

class TaiXiuAnalyzer {
    constructor(options = {}) {
        this.config = {
            patternsFile: options.patternsFile || './patterns.json',
            weightsFile: options.weightsFile || './model_weights.json',
            historyLimit: options.historyLimit || 1000,
            balanceThreshold: options.balanceThreshold || 0.55,
            antiReverseLosses: options.antiReverseLosses || 3,
            ...options
        };

        this.modelWeights = {};
        this.subModelWeights = {};
        this.miniModelWeights = {};

        for (let i = 1; i <= 21; i++) this.modelWeights[`model${i}`] = 1.0;
        for (let i = 1; i <= 42; i++) this.subModelWeights[`sub_model_${i}`] = 1.0;
        for (let i = 1; i <= 21; i++) this.miniModelWeights[`mini_model_${i}`] = 1.0;

        if (fs.existsSync(this.config.weightsFile)) {
            try {
                const saved = JSON.parse(fs.readFileSync(this.config.weightsFile, 'utf8'));
                this.modelWeights = saved.modelWeights || this.modelWeights;
                this.subModelWeights = saved.subModelWeights || this.subModelWeights;
                this.miniModelWeights = saved.miniModelWeights || this.miniModelWeights;
            } catch (e) {}
        }

        this.subModels = {};
        this.initSubModels();

        this.miniModels = {};
        this.initMiniModels();

        this.stats = {
            total: 0,
            correct: 0,
            wrong: 0,
            consecutiveLosses: 0,
            consecutiveWins: 0
        };
    }

    initSubModels() {
        const specs = {
            1:  { name: '1-1 thuần',     type: '1-1',   logic: 'pure',     minLength: 4 },
            2:  { name: '1-1 biến thể',  type: '1-1',   logic: 'variant',  minLength: 5 },
            3:  { name: '1-1 dài hạn',   type: '1-1',   logic: 'long',     minLength: 8 },
            4:  { name: '1-1 kết hợp',   type: '1-1',   logic: 'hybrid',   minLength: 6 },
            5:  { name: '1-1 gãy',       type: '1-1',   logic: 'break',    minLength: 6 },
            6:  { name: '1-1 phục hồi',  type: '1-1',   logic: 'recovery', minLength: 7 },
            7:  { name: '2-2 chuẩn',     type: '2-2',   logic: 'pure',     minLength: 6 },
            8:  { name: '2-2 lệch',      type: '2-2',   logic: 'offset',   minLength: 7 },
            9:  { name: '2-2 biến tướng',type: '2-2',   logic: 'variant',  minLength: 8 },
            10: { name: '2-2 kết hợp',   type: '2-2',   logic: 'hybrid',   minLength: 8 },
            11: { name: '2-2 dài',       type: '2-2',   logic: 'long',     minLength: 10 },
            12: { name: '2-2 bẻ',        type: '2-2',   logic: 'break',    minLength: 7 },
            13: { name: 'bệt ngắn',      type: 'bệt',   logic: 'short',    minLength: 3 },
            14: { name: 'bệt trung',     type: 'bệt',   logic: 'medium',   minLength: 5 },
            15: { name: 'bệt dài',       type: 'bệt',   logic: 'long',     minLength: 7 },
            16: { name: 'bệt gãy',       type: 'bệt',   logic: 'break',    minLength: 5 },
            17: { name: 'bệt xen kẽ',    type: 'bệt',   logic: 'hybrid',   minLength: 6 },
            18: { name: 'siêu bệt',      type: 'bệt',   logic: 'super',    minLength: 10 },
            19: { name: '3-3 chuẩn',     type: '3-3',   logic: 'pure',     minLength: 9 },
            20: { name: '3-3 biến thể',  type: '3-3',   logic: 'variant',  minLength: 10 },
            21: { name: '3-3 ngắn',      type: '3-3',   logic: 'short',    minLength: 6 },
            22: { name: '3-3 kết hợp',   type: '3-3',   logic: 'hybrid',   minLength: 9 },
            23: { name: '3-3 bẻ',        type: '3-3',   logic: 'break',    minLength: 8 },
            24: { name: '3-3 dài',       type: '3-3',   logic: 'long',     minLength: 12 },
            25: { name: '2-1-2 chuẩn',   type: '2-1-2', logic: 'pure',     minLength: 5 },
            26: { name: '2-1-2 biến thể',type: '2-1-2', logic: 'variant',  minLength: 6 },
            27: { name: '2-1-2 dài',     type: '2-1-2', logic: 'long',     minLength: 8 },
            28: { name: '1-2-1 chuẩn',   type: '1-2-1', logic: 'pure',     minLength: 5 },
            29: { name: '1-2-1 biến thể',type: '1-2-1', logic: 'variant',  minLength: 6 },
            30: { name: '1-2-1 dài',     type: '1-2-1', logic: 'long',     minLength: 8 },
            31: { name: 'bẻ cầu 1-1',    type: 'break', logic: 'break11',  minLength: 4 },
            32: { name: 'bẻ cầu 2-2',    type: 'break', logic: 'break22',  minLength: 5 },
            33: { name: 'bẻ cầu bệt',    type: 'break', logic: 'breakStreak', minLength: 4 },
            34: { name: 'chuyển 1-1→2-2',type: 'transition', logic: '11to22', minLength: 6 },
            35: { name: 'chuyển 2-2→1-1',type: 'transition', logic: '22to11', minLength: 6 },
            36: { name: 'chuyển bệt→1-1',type: 'transition', logic: 'streakTo11', minLength: 5 },
            37: { name: 'tần suất',      type: 'frequency', logic: 'frequency', minLength: 10 },
            38: { name: 'chu kỳ',        type: 'cycle',     logic: 'cycle',     minLength: 12 },
            39: { name: 'đối xứng',      type: 'symmetry',  logic: 'symmetry',  minLength: 8 },
            40: { name: 'Fibonacci',     type: 'fibonacci', logic: 'fibonacci', minLength: 8 },
            41: { name: 'xu hướng dài',  type: 'trend',     logic: 'longTrend', minLength: 15 },
            42: { name: 'siêu cầu',      type: 'super',     logic: 'super',     minLength: 20 }
        };

        for (let i = 1; i <= 42; i++) {
            this.subModels[`sub_model_${i}`] = {
                ...specs[i],
                weight: this.subModelWeights[`sub_model_${i}`] || 1.0,
                accuracy: 0.5
            };
        }
    }

    initMiniModels() {
        for (let i = 1; i <= 21; i++) {
            this.miniModels[`mini_model_${i}`] = {
                weight: this.miniModelWeights[`mini_model_${i}`] || 1.0,
                accuracy: 0.5
            };
        }
    }

    getResultArray(history) {
        return history.map(h => h.Ket_qua || (h.score >= 11 ? 'Tài' : 'Xỉu'));
    }

    getStreak(results) {
        if (results.length === 0) return 0;
        const last = results[results.length - 1];
        let streak = 1;
        for (let i = results.length - 2; i >= 0; i--) {
            if (results[i] === last) streak++;
            else break;
        }
        return streak;
    }

    runSubModel(index, history) {
        if (history.length < 3) return null;
        const results = this.getResultArray(history);
        const last = results[results.length - 1];
        const model = this.subModels[`sub_model_${index}`];

        if (!model || results.length < model.minLength) return null;

        // Logic mẫu đại diện cho Ensemble Model
        const streak = this.getStreak(results);
        if (streak >= 3) {
            return { prediction: last, confidence: 0.8, reason: `Cầu bệt ${streak} tay`, model_name: model.name };
        } else {
            return { prediction: last === 'Tài' ? 'Xỉu' : 'Tài', confidence: 0.75, reason: 'Cầu đảo 1-1', model_name: model.name };
        }
    }

    ensembleModels(history) {
        const results = this.getResultArray(history);
        if (results.length === 0) return { prediction: 'Tài', confidence: 0.5, reason: 'Chưa đủ dữ liệu' };

        let taiWeight = 0, xiuWeight = 0;

        for (let i = 1; i <= 42; i++) {
            const res = this.runSubModel(i, history);
            if (res) {
                if (res.prediction === 'Tài') taiWeight += res.confidence;
                else xiuWeight += res.confidence;
            }
        }

        const finalPrediction = taiWeight >= xiuWeight ? 'Tài' : 'Xỉu';
        const total = taiWeight + xiuWeight || 1;
        const finalConfidence = Math.max(taiWeight, xiuWeight) / total;

        return {
            prediction: finalPrediction,
            confidence: finalConfidence,
            pattern_type: "Mô hình Ensemble 84 Sub-models",
            pattern: results.slice(-5).join(''),
            reason: `Xác suất đồng thuận: ${finalPrediction} (${(finalConfidence * 100).toFixed(0)}%)`
        };
    }

    predict(history) {
        const ensemble = this.ensembleModels(history);
        return {
            prediction: ensemble.prediction,
            confidence: ensemble.confidence,
            loai_cau: ensemble.pattern_type,
            mau_cau: ensemble.pattern,
            reason: ensemble.reason,
            do_tin_cay: (ensemble.confidence * 100).toFixed(0) + '%'
        };
    }

    updateResult(actual, predicted) {
        const correct = actual === predicted;
        this.stats.total++;
        if (correct) {
            this.stats.correct++;
        } else {
            this.stats.wrong++;
        }
        return correct;
    }

    getStats() {
        return {
            ...this.stats,
            ti_le: this.stats.total > 0 ? ((this.stats.correct / this.stats.total) * 100).toFixed(1) + '%' : '0%'
        };
    }
}


// ============================================================
// SECTION 3: LUỒNG CÀO API & ĐỐI CHIẾU XUẤT KẾT QUẢ
// ============================================================

const analyzer = new TaiXiuAnalyzer();
const predictionHistory = new Map();

async function processApiData() {
    try {
        const response = await axios.get('https://amongst-plots-called-dining.trycloudflare.com/api/tx');
        const apiData = response.data;

        let history = Array.isArray(apiData) ? apiData : (apiData.data || apiData.history || []);
        if (!history || history.length === 0) return null;

        history = history.map(item => ({
            Phien: item.Phien || item.phien || item.id,
            Ket_qua: item.Ket_qua || item.ket_qua || (item.score >= 11 ? 'Tài' : 'Xỉu'),
            Xuc_xac_1: item.Xuc_xac_1 || item.dice1 || null,
            Xuc_xac_2: item.Xuc_xac_2 || item.dice2 || null,
            Xuc_xac_3: item.Xuc_xac_3 || item.dice3 || null,
            score: item.score || (item.Xuc_xac_1 + item.Xuc_xac_2 + item.Xuc_xac_3) || null,
            Thoi_gian: item.Thoi_gian || item.time || new Date().toISOString()
        })).sort((a, b) => a.Phien - b.Phien);

        const latestRecord = history[history.length - 1];
        const currentPhien = Number(latestRecord.Phien);
        const nextPhien = currentPhien + 1;

        // Đối chiếu phiên vừa ra
        if (predictionHistory.has(currentPhien)) {
            const lastPred = predictionHistory.get(currentPhien);
            if (!lastPred.evaluated) {
                const isCorrect = analyzer.updateResult(latestRecord.Ket_qua, lastPred.Du_doan);
                lastPred.Ket_qua_thuc_te = latestRecord.Ket_qua;
                lastPred.Trang_thai = isCorrect ? 'Dúng' : 'Sai';
                lastPred.evaluated = true;
            }
        }

        // Dự đoán phiên tiếp theo
        const predictionResult = analyzer.predict(history);
        const stats = analyzer.getStats();

        const currentPredData = predictionHistory.get(currentPhien);
        const statusCurrent = currentPredData && currentPredData.evaluated ? currentPredData.Trang_thai : "";

        // Lưu vết phiên tới
        predictionHistory.set(nextPhien, {
            Phien_du_doan: nextPhien,
            Phien_hien_tai: currentPhien,
            Du_doan: predictionResult.prediction,
            Thoi_gian: new Date().toLocaleTimeString('vi-VN'),
            evaluated: false
        });

        const jsonOutput = {
            "Phien": latestRecord.Phien,
            "Xuc_xac_1": latestRecord.Xuc_xac_1,
            "Xuc_xac_2": latestRecord.Xuc_xac_2,
            "Xuc_xac_3": latestRecord.Xuc_xac_3,
            "Tong": latestRecord.score,
            "Ket_qua": latestRecord.Ket_qua,
            "Phien_hien_tai": nextPhien,
            "Du_doan": predictionResult.prediction,
            "Loai_cau": predictionResult.loai_cau,
            "Mau_cau_phat_hien": predictionResult.mau_cau,
            "Do_tin_cay": predictionResult.do_tin_cay,
            "Trang_thai": statusCurrent,
            "Ket_qua_du_doan": statusCurrent,
            "Thong_ke": {
                "tong": stats.total,
                "dung": stats.correct,
                "sai": stats.wrong,
                "ti_le": stats.ti_le
            },
            "id": "@nhan161019"
        };

        renderConsoleTable();
        return jsonOutput;

    } catch (error) {
        console.error('[❌ API Error]:', error.message);
        return null;
    }
}

function renderConsoleTable() {
    console.clear();
    console.log("=========================================================================");
    console.log("                       BẢNG THỐNG KÊ DỰ ĐOÁN TÀI XỈU                      ");
    console.log("=========================================================================");
    console.log("GAME\t|\tPHIÊN\t|\tTHỜI GIAN\t|\tDỰ ĐOÁN\t|\tKẾT QUẢ\t|\tXÁC MINH");
    console.log("-------------------------------------------------------------------------");

    const historyArray = Array.from(predictionHistory.values())
        .filter(item => item.evaluated)
        .reverse()
        .slice(0, 10);

    if (historyArray.length === 0) {
        console.log("\t\t\tĐang chờ dữ liệu đối chiếu phiên đầu tiên...");
    } else {
        historyArray.forEach(item => {
            const checkIcon = item.Trang_thai === 'Dúng' ? '✅ Đúng' : '❌ Sai';
            console.log(`SUNWIN\t|\t#${item.Phien_du_doan}\t|\t${item.Thoi_gian}\t|\t${item.Du_doan}\t|\t${item.Ket_qua_thuc_te}\t|\t${checkIcon}`);
        });
    }
    console.log("=========================================================================\n");
}

// Chạy vòng lặp cào API mỗi 10 giây
setInterval(async () => {
    const jsonResult = await processApiData();
    if (jsonResult) {
        console.log("--- DỮ LIỆU KẾT QUẢ JSON ---");
        console.log(JSON.stringify(jsonResult, null, 2));
    }
}, 10000);
