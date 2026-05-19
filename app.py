"""
MediSense AI v2 — Disease Detection System
✅ Symptom-based ML prediction (Random Forest)
✅ Image-based visual disease detection (OpenCV, no API key)
✅ Multilanguage UI (English, Hindi, Odia, Bengali, Tamil, Telugu, Marathi)
✅ Voice input (Web Speech API)
✅ Holistic treatment: Food + Medicine + Ayurvedic + Yoga
"""
import os, json, base64
import warnings
import sys
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
import joblib
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template_string
from knowledge_base import get_disease_info, IMMUNITY_YOGA
from image_analyzer import analyze_image_for_disease, image_bytes_from_base64
from translations import LANGUAGES, get_lang, get_all_languages

app = Flask(__name__)

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model    = joblib.load(os.path.join(BASE_DIR, 'model.pkl'))
with open(os.path.join(BASE_DIR, 'symptoms.json')) as f: SYMPTOMS = json.load(f)

with open(os.path.join(BASE_DIR, 'diseases.json')) as f: DISEASES = json.load(f)

# ── CSP Fix for Chrome DevTools ────────────────────────────────────────────────
@app.after_request
def after_request(response):
    """Chrome DevTools CSP fix - allow devtools connections."""
    if app.debug:
        response.headers.pop('Content-Security-Policy', None)
    else:
        csp = ("default-src 'self'; " 
               "connect-src 'self' http://localhost:* https://localhost:* "
               "ws://localhost:* wss://localhost:* "
               "http://localhost:*.well-known:* https://localhost:*.well-known:*; "
               "script-src 'self' 'unsafe-inline'; "
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
               "font-src https://fonts.gstatic.com data:; "
               "img-src 'self' data: https: blob:; "
               "media-src 'self'; "
               "worker-src 'self' blob:; "
               "frame-src 'self'; "
               "child-src 'self';")
        response.headers['Content-Security-Policy'] = csp
    return response

# ── ML helpers ────────────────────────────────────────────────────────────────

def parse_symptoms_from_text(text: str):
    tl = text.lower()
    seen, matched = set(), []
    for sym in SYMPTOMS:
        sl = sym.lower()
        if sl in tl and sl not in seen:
            matched.append(sym); seen.add(sl); continue
        words = [w for w in sl.split() if len(w) > 3 and w not in ('with','from','that','this','during')]
        if len(words) >= 2 and all(w in tl for w in words) and sl not in seen:
            matched.append(sym); seen.add(sl)
    return matched

def predict_disease(symptom_list):
    if not symptom_list: return []
    vec = pd.DataFrame([[0]*len(SYMPTOMS)], columns=SYMPTOMS)
    for s in symptom_list:
        sl = s.lower().strip()
        if sl in vec.columns: vec[sl] = 1
    proba   = model.predict_proba(vec)[0]
    top_idx = np.argsort(proba)[::-1][:5]
    valid   = [(i, float(proba[i])) for i in top_idx if proba[i] > 0.001]
    if not valid: return []
    max_p = valid[0][1]
    return [{"disease": model.classes_[i], "confidence": round((p/max_p)*100, 1),
             "raw_prob": round(p*100, 2), "info": get_disease_info(model.classes_[i])}
            for i, p in valid[:3]]

# ── HTML Template ─────────────────────────────────────────────────────────────
HTML = r"""<!DOCTYPE html>
<html lang="en" id="html-root">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title id="page-title">Medi Connect AI</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Noto+Sans:wght@400;600;700&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Sans+Odia:wght@400;700&family=Noto+Sans+Bengali:wght@400;700&family=Noto+Sans+Tamil:wght@400;700&family=Noto+Sans+Telugu:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{
  --p:#06b6d4;--p2:#6366f1;--g:linear-gradient(135deg,#06b6d4,#6366f1);
  --g2:linear-gradient(135deg,#0ea5e9,#8b5cf6);
  --ok:#10b981;--warn:#f59e0b;--err:#ef4444;--purple:#a78bfa;
  --bg:#060d1a;--s1:#0d1729;--s2:#132039;--s3:#1e3052;--s4:#243a5e;
  --txt:#e8f4ff;--muted:#7ba3c8;--border:#1e3052;--r:16px;
  --font-main:'Sora','Noto Sans',sans-serif;
  --font-indic:'Noto Sans Devanagari','Noto Sans Odia','Noto Sans Bengali','Noto Sans Tamil','Noto Sans Telugu','Noto Sans',sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-main);background:var(--bg);color:var(--txt);min-height:100vh;
  background-image:radial-gradient(ellipse at 20% 20%,rgba(6,182,212,.08) 0%,transparent 60%),
                   radial-gradient(ellipse at 80% 80%,rgba(99,102,241,.07) 0%,transparent 60%)}

/* ── Language bar ── */
.lang-bar{
  background:rgba(13,23,41,.95);border-bottom:1px solid var(--border);
  padding:8px 32px;display:flex;align-items:center;gap:12px;
  font-size:.78rem;backdrop-filter:blur(10px);
}
.lang-label{color:var(--muted);font-weight:600}
.lang-btns{display:flex;flex-wrap:wrap;gap:6px}
.lang-btn{
  padding:4px 11px;border-radius:20px;border:1px solid var(--s4);
  background:transparent;color:var(--muted);cursor:pointer;
  font-size:.72rem;font-weight:600;transition:.2s;
  font-family:var(--font-indic);
}
.lang-btn:hover{border-color:var(--p);color:var(--p);background:rgba(6,182,212,.08)}
.lang-btn.on{background:var(--g);color:#fff;border-color:transparent;
  box-shadow:0 0 12px rgba(6,182,212,.35)}

/* ── Header ── */
.hdr{
  background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(99,102,241,.15));
  border-bottom:1px solid rgba(6,182,212,.2);
  padding:20px 32px;display:flex;align-items:center;gap:16px;
  position:sticky;top:37px;z-index:100;backdrop-filter:blur(20px);
}
.hdr-logo{font-size:2.4rem;filter:drop-shadow(0 0 12px rgba(6,182,212,.6))}
.hdr h1{font-size:1.7rem;font-weight:800;
  background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hdr p{font-size:.8rem;color:var(--muted);margin-top:2px;font-family:var(--font-indic)}
.hdr-pill{margin-left:auto;background:rgba(6,182,212,.15);
  border:1px solid rgba(6,182,212,.3);padding:6px 16px;border-radius:20px;
  font-size:.72rem;font-weight:700;color:var(--p);white-space:nowrap}

/* ── Layout ── */
.wrap{max-width:1280px;margin:0 auto;padding:28px 20px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:26px}
.stat{
  background:linear-gradient(135deg,var(--s1),var(--s2));
  border:1px solid var(--border);border-radius:var(--r);
  padding:18px;text-align:center;position:relative;overflow:hidden;
}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--g)}
.stat-n{font-size:1.8rem;font-weight:800;background:var(--g);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-l{font-size:.72rem;color:var(--muted);margin-top:3px;font-family:var(--font-indic)}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media(max-width:800px){.cols{grid-template-columns:1fr}}

/* ── Card ── */
.card{
  background:linear-gradient(145deg,var(--s1),var(--s2));
  border:1px solid var(--border);border-radius:var(--r);overflow:hidden;
  box-shadow:0 4px 24px rgba(0,0,0,.4);
}
.card-hdr{
  background:linear-gradient(135deg,var(--s2),var(--s3));
  padding:15px 20px;border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:10px;font-weight:700;font-size:.95rem;
  font-family:var(--font-indic);
}
.card-body{padding:20px}

/* ── Mode tabs ── */
.mtabs{display:flex;gap:5px;background:var(--s3);padding:5px;border-radius:12px;margin-bottom:18px}
.mtab{
  flex:1;padding:9px 4px;border:none;border-radius:9px;cursor:pointer;
  font-size:.78rem;font-weight:600;background:transparent;color:var(--muted);
  transition:.25s;display:flex;align-items:center;justify-content:center;gap:4px;
  font-family:var(--font-indic);
}
.mtab.on{background:var(--g);color:#fff;box-shadow:0 2px 12px rgba(6,182,212,.45)}
.mtab:hover:not(.on){background:var(--s4);color:var(--txt)}
.panel{display:none}.panel.on{display:block}

/* ── Search ── */
.srch-wrap{position:relative;margin-bottom:10px}
.srch-inp{
  width:100%;padding:12px 16px;border-radius:10px;
  background:var(--s3);border:1px solid var(--border);
  color:var(--txt);font-size:.88rem;outline:none;transition:.2s;
  font-family:var(--font-indic);
}
.srch-inp:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(6,182,212,.15)}
.srch-inp::placeholder{color:var(--muted)}
.dropdown{
  position:absolute;top:calc(100% + 5px);left:0;right:0;z-index:200;
  background:var(--s2);border:1px solid var(--p);border-radius:12px;
  max-height:230px;overflow-y:auto;box-shadow:0 16px 40px rgba(0,0,0,.7);display:none;
}
.dropdown.on{display:block}
.dd-item{
  padding:10px 16px;cursor:pointer;font-size:.83rem;
  border-bottom:1px solid var(--border);transition:.15s;text-transform:capitalize;
}
.dd-item:last-child{border-bottom:none}.dd-item:hover{background:var(--s3);color:var(--p)}
.chips-box{
  display:flex;flex-wrap:wrap;gap:7px;min-height:46px;
  padding:9px;background:var(--s3);border-radius:10px;border:1px dashed var(--s4);
}
.chip{
  background:var(--g);color:#fff;padding:4px 12px;border-radius:20px;
  font-size:.76rem;display:flex;align-items:center;gap:5px;
  animation:pop .2s ease;font-family:var(--font-indic);
}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}
.chip-x{cursor:pointer;opacity:.75;font-weight:700}.chip-x:hover{opacity:1}

/* ── Textarea ── */
textarea{
  width:100%;padding:13px 15px;border-radius:10px;background:var(--s3);
  border:1px solid var(--border);color:var(--txt);font-size:.88rem;
  resize:vertical;min-height:115px;outline:none;transition:.2s;
  font-family:var(--font-indic);line-height:1.6;
}
textarea:focus{border-color:var(--p);box-shadow:0 0 0 3px rgba(6,182,212,.12)}
textarea::placeholder{color:var(--muted)}

/* ── Voice ── */
.voice-wrap{text-align:center;padding:24px 16px}
.vbtn{
  width:90px;height:90px;border-radius:50%;border:none;background:var(--g);
  cursor:pointer;font-size:2rem;color:#fff;transition:.3s;
  box-shadow:0 4px 20px rgba(6,182,212,.5);
}
.vbtn:hover{transform:scale(1.07)}
.vbtn.rec{animation:pulse 1.2s infinite;background:linear-gradient(135deg,#ef4444,#f97316)}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}60%{box-shadow:0 0 0 20px rgba(239,68,68,0)}}
.vstatus{margin-top:12px;color:var(--muted);font-size:.85rem;font-family:var(--font-indic)}
.vtxt{margin-top:11px;padding:12px;background:var(--s3);border-radius:10px;
  font-size:.85rem;min-height:55px;text-align:left;font-family:var(--font-indic);
  color:var(--txt);border:1px solid var(--border)}

/* ── Image upload ── */
.img-zone{
  border:2px dashed var(--border);border-radius:12px;padding:28px 16px;
  text-align:center;cursor:pointer;transition:.3s;background:var(--s3);
  position:relative;
}
.img-zone:hover,.img-zone.drag{border-color:var(--p);background:rgba(6,182,212,.06)}
.img-zone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.img-icon{font-size:2.5rem;margin-bottom:8px;display:block}
.img-label{font-size:.88rem;color:var(--muted);font-family:var(--font-indic)}
.img-fmt{font-size:.72rem;color:var(--s4);margin-top:4px}
.img-preview{margin-top:14px;display:none}
.img-preview img{width:100%;max-height:180px;object-fit:cover;border-radius:10px;
  border:1px solid var(--border)}
.img-preview p{font-size:.78rem;color:var(--muted);margin-top:6px;font-family:var(--font-indic)}
.img-scanning{
  margin-top:10px;padding:10px;background:rgba(6,182,212,.1);
  border:1px solid rgba(6,182,212,.3);border-radius:8px;
  font-size:.82rem;color:var(--p);text-align:center;display:none;
  font-family:var(--font-indic);
}
.img-hint{
  margin-top:10px;padding:10px 13px;border-radius:9px;font-size:.8rem;
  background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);
  color:var(--warn);font-family:var(--font-indic);
}

/* ── Predict button ── */
.pbtn{
  width:100%;padding:14px;margin-top:16px;background:var(--g2);color:#fff;border:none;
  border-radius:12px;font-size:.97rem;font-weight:700;cursor:pointer;transition:.3s;
  box-shadow:0 4px 16px rgba(6,182,212,.4);font-family:var(--font-indic);letter-spacing:.3px;
}
.pbtn:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(6,182,212,.55)}
.pbtn:active{transform:translateY(0)}.pbtn:disabled{opacity:.4;cursor:not-allowed;transform:none}

/* ── Info / disclaimer ── */
.info-box{margin-top:10px;padding:10px 13px;border-radius:9px;font-size:.8rem;
  background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);
  color:var(--warn);display:flex;gap:7px;align-items:flex-start;
  font-family:var(--font-indic)}
.disc{margin-top:16px;padding:11px 14px;border-radius:9px;font-size:.76rem;
  background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18);color:#fca5a5;
  font-family:var(--font-indic)}

/* ── Loader ── */
.loader{display:none;text-align:center;padding:40px 20px}
.spin{width:50px;height:50px;border-radius:50%;border:4px solid var(--s3);
  border-top-color:var(--p);animation:spin .8s linear infinite;margin:0 auto 14px}
@keyframes spin{to{transform:rotate(360deg)}}
.loader p{color:var(--muted);font-family:var(--font-indic)}

/* ── Welcome ── */
.how-step{display:flex;gap:12px;align-items:flex-start;margin-bottom:15px}
.step-n{width:32px;height:32px;border-radius:50%;background:var(--g);
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;flex-shrink:0}
.step-txt strong{font-family:var(--font-indic)}
.step-txt span{font-family:var(--font-indic);color:var(--muted);font-size:.82rem}

/* ── Visual clue badge ── */
.vis-clue{
  margin:0 18px 12px;padding:9px 13px;
  background:rgba(6,182,212,.08);border:1px solid rgba(6,182,212,.25);
  border-radius:8px;font-size:.8rem;color:var(--p);
  font-family:var(--font-indic);
}
.vis-clue span{font-weight:700;margin-right:5px}

/* ── Disease result card ── */
.d-card{
  background:linear-gradient(145deg,var(--s1),var(--s2));
  border:1px solid var(--border);border-radius:14px;overflow:hidden;
  margin-bottom:18px;animation:slideUp .35s ease;
  box-shadow:0 4px 20px rgba(0,0,0,.35);
}
.d-card.top{border-color:rgba(6,182,212,.45);box-shadow:0 4px 24px rgba(6,182,212,.2)}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.d-hdr{padding:15px 18px;background:linear-gradient(135deg,var(--s2),var(--s3));
  display:flex;align-items:center;gap:11px}
.rank{width:32px;height:32px;border-radius:50%;background:var(--g);
  display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.85rem;flex-shrink:0}
.d-name{font-size:1.08rem;font-weight:800;flex:1;text-transform:capitalize;font-family:var(--font-indic)}
.conf-badge{padding:4px 13px;border-radius:20px;font-size:.74rem;
  font-weight:700;background:var(--g);color:#fff;white-space:nowrap}
.conf-bar{height:5px;background:var(--s4);margin:0 18px;overflow:hidden;border-radius:3px}
.conf-fill{height:100%;border-radius:3px;background:var(--g);width:0%;transition:width 1.1s ease}
.d-desc{padding:10px 18px 14px;color:var(--muted);font-size:.82rem;font-style:italic;
  font-family:var(--font-indic)}

/* ── Rec tabs ── */
.rtabs{display:flex;background:var(--s3);border-bottom:1px solid var(--border)}
.rtab{flex:1;padding:10px 4px;border:none;background:transparent;color:var(--muted);
  cursor:pointer;font-size:.76rem;font-weight:600;transition:.2s;
  border-bottom:2px solid transparent;
  display:flex;align-items:center;justify-content:center;gap:3px;
  font-family:var(--font-indic);}
.rtab.on{color:var(--p);border-bottom-color:var(--p);background:rgba(6,182,212,.06)}
.rtab:hover:not(.on){color:var(--txt);background:rgba(255,255,255,.04)}
.rpanel{display:none;padding:14px 18px}.rpanel.on{display:block}
.rlist{list-style:none;display:flex;flex-direction:column;gap:7px}
.ritem{padding:9px 13px;background:var(--s3);border-radius:9px;font-size:.84rem;
  display:flex;align-items:flex-start;gap:9px;border-left:3px solid transparent;
  transition:.2s;font-family:var(--font-indic)}
.ritem:hover{background:var(--s4)}
.ritem.food{border-left-color:var(--ok)}.ritem.med{border-left-color:var(--p)}
.ritem.ayur{border-left-color:var(--warn)}.ritem.yoga{border-left-color:var(--purple)}
.rico{font-size:1.1rem;flex-shrink:0;margin-top:1px}

/* ── Matched pills ── */
.matched-wrap{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;
  padding:10px 14px;background:rgba(16,185,129,.07);
  border:1px solid rgba(16,185,129,.25);border-radius:9px}
.m-pill{background:rgba(16,185,129,.15);color:var(--ok);padding:3px 10px;
  border-radius:20px;font-size:.74rem;text-transform:capitalize;font-family:var(--font-indic)}
.m-label{color:var(--ok);font-size:.74rem;font-weight:700;margin-right:4px;align-self:center}

/* ── Image result badge ── */
.img-result-badge{
  display:inline-flex;align-items:center;gap:6px;margin-bottom:10px;
  background:rgba(6,182,212,.12);border:1px solid rgba(6,182,212,.3);
  padding:5px 12px;border-radius:20px;font-size:.76rem;color:var(--p);font-weight:600;
}

/* ── Immunity ── */
.imm-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(max-width:500px){.imm-grid{grid-template-columns:1fr}}
.imm-card{padding:14px;
  background:linear-gradient(135deg,rgba(167,139,250,.09),rgba(99,102,241,.09));
  border:1px solid rgba(167,139,250,.25);border-radius:11px;transition:.2s}
.imm-card:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(167,139,250,.15)}
.imm-card h4{font-size:.87rem;color:var(--purple);margin-bottom:4px}
.imm-card p{font-size:.75rem;color:var(--muted);font-family:var(--font-indic)}

/* ── Scrollbar ── */
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:var(--s1)}
::-webkit-scrollbar-thumb{background:var(--s4);border-radius:3px}
</style>
</head>
<body>

<!-- Language bar -->
<div class="lang-bar">
  <span class="lang-label" id="ui-select-language">🌐 Language:</span>
  <div class="lang-btns" id="lang-btns">
    <!-- injected by JS -->
  </div>
</div>

<!-- Header -->
<header class="hdr">
  <span class="hdr-logo">🏥</span>
  <div>
    <h1 id="ui-app-title">MedConnectAI</h1>
    <p id="ui-app-subtitle">Intelligent Disease Detection & Holistic Treatment Guide</p>
  </div>
  <span class="hdr-pill">🤖 ML + CV · No API Key</span>
  <a href="http://localhost:3000/patient/dashboard"><button>Dashboard</button></a>
</header>

<div class="wrap">
  <!-- Stats -->
  <div class="stats">
    <div class="stat"><div class="stat-n">200+</div><div class="stat-l" id="ui-stats-diseases">Diseases Detected</div></div>
    <div class="stat"><div class="stat-n">377</div><div class="stat-l" id="ui-stats-symptoms">Symptom Features</div></div>
    <div class="stat"><div class="stat-n">246k+</div><div class="stat-l" id="ui-stats-records">Training Records</div></div>
  </div>

  <div class="cols">
    <!-- LEFT: Input -->
    <div>
      <div class="card">
        <div class="card-hdr">🔍 <span id="ui-input-title">Enter Your Symptoms</span></div>
        <div class="card-body">

          <!-- Mode tabs -->
          <div class="mtabs">
<button class="mtab on" id="t-search" onclick="mode('search')">🔎 <span id="span-tab-search">Search</span></button>
            <button class="mtab"    id="t-text"   onclick="mode('text')">✏️ <span id="span-tab-text">Write</span></button>
            <button class="mtab"    id="t-voice"  onclick="mode('voice')">🎙️ <span id="span-tab-voice">Voice</span></button>
            <button class="mtab"    id="t-image"  onclick="mode('image')">🖼️ <span id="span-tab-image">Image</span></button>
          </div>

          <!-- Search panel -->
          <div class="panel on" id="p-search">
            <div class="srch-wrap">
              <input class="srch-inp" id="sym-inp" type="text" autocomplete="off"
                oninput="srch(this.value)">
              <div class="dropdown" id="dd"></div>
            </div>
            <p style="font-size:.76rem;color:var(--muted);margin-bottom:7px;font-family:var(--font-indic)" id="ui-selected-symptoms">Selected symptoms:</p>
            <div class="chips-box" id="chips"><span id="none-selected-span" style="color:var(--muted);font-size:.76rem;padding:4px">None selected yet…</span></div>
          </div>

          <!-- Text panel -->
          <div class="panel" id="p-text">
            <textarea id="sym-txt"></textarea>
            <div class="info-box"><span>💡</span><span id="ui-text-hint">Describe all symptoms clearly — AI extracts & matches them automatically.</span></div>
          </div>

          <!-- Voice panel -->
          <div class="panel" id="p-voice">
            <div class="voice-wrap">
              <button class="vbtn" id="vbtn" onclick="toggleVoice()">🎙️</button>
              <div class="vstatus" id="vstatus">Tap to speak your symptoms</div>
              <div class="vtxt"   id="vtxt"><span id="voice-placeholder" style="color:var(--muted)">Your speech will appear here…</span></div>
            </div>
          </div>

          <!-- Image panel -->
          <div class="panel" id="p-image">
            <p style="font-size:.8rem;color:var(--muted);margin-bottom:10px;font-family:var(--font-indic)" id="ui-image-upload-label">Upload skin/eye image for visual diagnosis</p>
            <div class="img-zone" id="img-zone"
              ondragover="event.preventDefault();this.classList.add('drag')"
              ondragleave="this.classList.remove('drag')"
              ondrop="handleDrop(event)">
              <input type="file" accept="image/*" onchange="handleImageFile(this.files[0])">
              <span class="img-icon">📸</span>
              <div class="img-label" id="ui-image-drag">Drag & drop or click to upload image</div>
              <div class="img-fmt" id="ui-image-formats">JPG, PNG, WEBP supported</div>
            </div>
            <div class="img-preview" id="img-preview">
              <p id="ui-image-preview">Image preview:</p>
              <img id="img-thumb" src="" alt="preview">
            </div>
            <div class="img-scanning" id="img-scanning">🔬 <span id="ui-image-analysing">Analysing image…</span></div>
            <div class="img-hint"><span>💡</span> <span id="ui-image-hint">Upload a clear photo of affected skin, eye, or body part. AI analyses colour, texture & patterns — no API key needed.</span></div>
          </div>

          <button class="pbtn" id="pbtn" onclick="doPredict()">
            <span id="ui-analyse-btn">🔬 Analyse & Detect Disease</span>
          </button>
          <div class="disc"><span id="ui-disclaimer">⚠️ Disclaimer: For informational purposes only. Always consult a qualified doctor for proper diagnosis & treatment.</span></div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Results -->
    <div id="right-col">
      <div class="card" id="welcome">
        <div class="card-hdr">👨‍⚕️ <span id="ui-how-it-works">How It Works</span></div>
        <div class="card-body">
          <div class="how-step"><div class="step-n">1</div><div class="step-txt"><strong id="ui-step1-title">Enter Symptoms</strong><br><span id="ui-step1-desc">Search, type, speak or upload an image of your symptoms.</span></div></div>
          <div class="how-step"><div class="step-n">2</div><div class="step-txt"><strong id="ui-step2-title">AI Detection</strong><br><span id="ui-step2-desc">Random Forest model trained on 246k records analyses 377 symptom features.</span></div></div>
          <div class="how-step"><div class="step-n">3</div><div class="step-txt"><strong id="ui-step3-title">Holistic Treatment</strong><br><span id="ui-step3-desc">Get food, modern medicine, Ayurvedic remedies & yoga recommendations.</span></div></div>
          <div style="margin-top:18px;text-align:center;padding:20px;background:var(--s3);border-radius:12px">
            <div style="font-size:2.8rem;margin-bottom:8px">🌿</div>
            <div style="font-weight:700;margin-bottom:4px;font-family:var(--font-indic)" id="ui-tagline">Modern AI + Ancient Wisdom</div>
            <div style="color:var(--muted);font-size:.82rem;font-family:var(--font-indic)" id="ui-tagline-sub">Combining ML predictions with Ayurveda & Yoga therapy</div>
          </div>
        </div>
      </div>
      <div class="card loader" id="loader">
        <div class="card-body"><div class="spin"></div><p id="ui-analysing">Analysing symptoms…</p></div>
      </div>
      <div id="results"></div>
    </div>
  </div>

  <!-- Immunity yoga -->
  <div style="margin-top:22px">
    <div class="card">
      <div class="card-hdr">🧘 <span id="ui-immunity-title">Daily Immunity-Boosting Yoga — Practice Every Day</span></div>
      <div class="card-body">
        <p style="color:var(--muted);margin-bottom:14px;font-size:.85rem;font-family:var(--font-indic)" id="ui-immunity-sub">These practices strengthen your immune system, reduce stress and improve overall vitality:</p>
        <div class="imm-grid" id="imm-grid"></div>
      </div>
    </div>
  </div>
</div>

<script type="application/json" id="symptoms-data">{{ symptoms_json | tojson | safe }}</script>
<script type="application/json" id="iyoga-data">{{ immunity_yoga_json | tojson | safe }}</script>
<script type="application/json" id="langs-data">{{ langs_json | tojson | safe }}</script>
<script>
// ── Data load ──


const symData = JSON.parse(document.getElementById('symptoms-data').textContent);
const SYMS = symData;
const iyogaData = JSON.parse(document.getElementById('iyoga-data').textContent);
const IYOGA = iyogaData;
const langsData = JSON.parse(document.getElementById('langs-data').textContent);
const LANGS = langsData;

// ── Build immunity grid ──
const ig = document.getElementById('imm-grid');
IYOGA.forEach(y=>{ ig.innerHTML+=`<div class="imm-card"><h4>🧘 ${y.name}</h4><p>${y.desc}</p></div>`; });

// ── Language system ──
let currentLang = 'en';

// Build language buttons
const lbDiv = document.getElementById('lang-btns');
Object.entries(LANGS).forEach(([code, meta])=>{
  const btn = document.createElement('button');
  btn.className = 'lang-btn' + (code==='en'?' on':'');
  btn.setAttribute('data-code', code);
  btn.textContent = meta.flag + ' ' + meta.name;
  btn.onclick = () => switchLang(code);
  lbDiv.appendChild(btn);
});

async function switchLang(code){
  currentLang = code;
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on', b.dataset.code===code));
  const r = await fetch('/api/lang/'+code);
  const ui = await r.json();
  // Update all UI elements
  Object.entries(ui).forEach(([key, val])=>{
    const el = document.getElementById('ui-'+key);
    if(el) el.textContent = val;
  });
  // Update placeholders
  const inp = document.getElementById('sym-inp');
  if(inp) inp.placeholder = ui.search_placeholder || '';
  const ta = document.getElementById('sym-txt');
  if(ta) ta.placeholder = ui.text_placeholder || '';
  const vstatus = document.getElementById('vstatus');
  if(vstatus) vstatus.textContent = ui.voice_tap || '';
  const vph = document.getElementById('voice-placeholder');
  if(vph) vph.textContent = ui.voice_speech_here || '';
  const nss = document.getElementById('none-selected-span');
  if(nss) nss.textContent = ui.none_selected || '';
  // Speech lang
  speechLang = ui.speech_lang || 'en-IN';
  // Store UI for JS use
  window._ui = ui;
}
window._ui = {};

// ── Mode switch ──
function mode(m){
  ['search','text','voice','image'].forEach(x=>{
    document.getElementById('t-'+x).classList.toggle('on',x===m);
    document.getElementById('p-'+x).classList.toggle('on',x===m);
  });
}

// ── HTML Escape helper ──
function htmlEscape(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Symptom search ──
let selected=[];
function srch(q){
  const dd=document.getElementById('dd');
  if(!q||q.length<2){dd.classList.remove('on');return}
  const hits=SYMS.filter(s=>s.toLowerCase().includes(q.toLowerCase())&&!selected.includes(s)).slice(0,15);
  if(!hits.length){dd.classList.remove('on');return}
  dd.innerHTML=hits.map(s=>`<div class="dd-item" onclick="addSym('${s.replace(/'/g,"\\'")}')"> ${s}</div>`).join('');
  dd.classList.add('on');
}
document.addEventListener('click',e=>{ if(!e.target.closest('.srch-wrap')) document.getElementById('dd').classList.remove('on'); });
function addSym(s){
  if(selected.includes(s))return;
  selected.push(s); renderChips();
  document.getElementById('sym-inp').value='';
  document.getElementById('dd').classList.remove('on');
}
function removeSym(s){ selected=selected.filter(x=>x!==s); renderChips(); }
function renderChips(){
  const box=document.getElementById('chips');
  const noSym = window._ui.none_selected || 'None selected yet…';
  if(!selected.length){
    box.innerHTML=`<span id="none-selected-span" style="color:var(--muted);font-size:.76rem;padding:4px">${noSym}</span>`;
    return;
  }
  const escapedSyms = selected.map(s => htmlEscape(s));
  box.innerHTML=selected.map((s,i)=>
    `<div class="chip">${escapedSyms[i]}<span class="chip-x" onclick="removeSym('${escapedSyms[i].replace(/'/g,"&#39;")}')">&times;</span></div>`
  ).join('');
}

// ── Voice ──
let rec=null, isRec=false, speechLang='en-IN';
function toggleVoice(){
  if(!('webkitSpeechRecognition'in window||'SpeechRecognition'in window)){
    document.getElementById('vstatus').textContent = window._ui.voice_unsupported || '❌ Not supported — try Chrome/Edge'; return;
  }
  isRec?stopVoice():startVoice();
}
function startVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  rec=new SR(); rec.continuous=true; rec.interimResults=true; rec.lang=speechLang;
  rec.onstart=()=>{
    isRec=true;
    document.getElementById('vbtn').classList.add('rec');
    document.getElementById('vbtn').textContent='⏹️';
    document.getElementById('vstatus').textContent = window._ui.voice_recording || '🔴 Recording…';
  };
  rec.onresult=e=>{ let t=''; for(let i=e.resultIndex;i<e.results.length;i++) t+=e.results[i][0].transcript; document.getElementById('vtxt').textContent=t; };
  rec.onerror=rec.onend=stopVoice;
  rec.start();
}
function stopVoice(){
  isRec=false; try{if(rec)rec.stop();}catch(e){}
  document.getElementById('vbtn').classList.remove('rec');
  document.getElementById('vbtn').textContent='🎙️';
  document.getElementById('vstatus').textContent = window._ui.voice_done || '✅ Done — click Analyse';
}

// ── Image handling ──
let imageB64 = null;
function handleDrop(e){
  e.preventDefault();
  document.getElementById('img-zone').classList.remove('drag');
  const file = e.dataTransfer.files[0];
  if(file) handleImageFile(file);
}
function handleImageFile(file){
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    imageB64 = ev.target.result;
    const prev = document.getElementById('img-preview');
    prev.style.display='block';
    document.getElementById('img-thumb').src = imageB64;
  };
  reader.readAsDataURL(file);
}

// ── Predict ──
async function doPredict(){
  const active=['search','text','voice','image'].find(x=>document.getElementById('p-'+x).classList.contains('on'));
  let payload={};

  if(active==='search'){
    if(!selected.length){alert(window._ui.none_selected||'Please select at least one symptom.');return;}
    payload={mode:'symptoms',symptoms:selected};
  } else if(active==='text'){
    const t=document.getElementById('sym-txt').value.trim();
    if(!t){alert('Please describe your symptoms.');return;}
    payload={mode:'text',text:t};
  } else if(active==='voice'){
    const t=document.getElementById('vtxt').textContent;
    if(!t||t.includes('appear here')||t.includes('…')){alert('Please record your symptoms first.');return;}
    payload={mode:'text',text:t};
  } else if(active==='image'){
    if(!imageB64){alert('Please upload an image first.');return;}
    payload={mode:'image',image:imageB64};
    document.getElementById('img-scanning').style.display='block';
  }

  document.getElementById('welcome').style.display='none';
  document.getElementById('loader').style.display='block';
  document.getElementById('results').innerHTML='';
  document.getElementById('pbtn').disabled=true;

  try{
    const r=await fetch('/predict',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const d=await r.json(); showResults(d, active==='image');
  }catch(e){
    document.getElementById('results').innerHTML=`<div class="card"><div class="card-body" style="color:var(--err);padding:20px">❌ ${e.message}</div></div>`;
  }finally{
    document.getElementById('loader').style.display='none';
    document.getElementById('img-scanning').style.display='none';
    document.getElementById('pbtn').disabled=false;
  }
}

function showResults(d, isImage){
  const box=document.getElementById('results');
  const noMatch = window._ui.no_match || 'No strong match found.';
  if(d.error||!d.predictions||!d.predictions.length){
    box.innerHTML=`<div class="card"><div class="card-body" style="text-align:center;padding:30px;color:var(--muted)">${d.error||noMatch}</div></div>`;
    return;
  }
  let html = `<div style="font-weight:700;font-size:1rem;margin-bottom:3px;font-family:var(--font-indic)">${window._ui.results_title||'🔬 Detection Results'}</div>
  <div style="color:var(--muted);font-size:.76rem;margin-bottom:14px;font-family:var(--font-indic)">${window._ui.results_sub||'Top predictions ranked by confidence'}</div>`;

  if(isImage){
    html += `<div class="img-result-badge">📸 ${window._ui.image_mode_label||'Visual / Image Analysis'}</div>`;
  }
  if(d.matched_symptoms&&d.matched_symptoms.length){
    const ml = window._ui.matched_label||'✅ Matched:';
    html+=`<div class="matched-wrap"><span class="m-label">${ml}</span>${d.matched_symptoms.map(s=>`<span class="m-pill">${s}</span>`).join('')}</div>`;
  }
  d.predictions.forEach((p,i)=>{html+=buildCard(p,i,isImage);});
  box.innerHTML=html;
  setTimeout(()=>{ document.querySelectorAll('.conf-fill').forEach(b=>{b.style.width=b.dataset.w+'%';}); },80);
}

function buildCard(p,i,isImage){
  const icons=['🥇','🥈','🥉'];
  const uid='c'+Date.now()+i;
  const inf=p.info;
  const cm = window._ui.confidence_label||'match';
  const li=(arr,cls,ico)=>(arr||[]).map(x=>`<li class="ritem ${cls}"><span class="rico">${ico}</span>${x}</li>`).join('');
  const tf = window._ui.tab_foods||'🥗 Foods';
  const tm = window._ui.tab_medicine||'💊 Medicine';
  const ta = window._ui.tab_ayurvedic||'🌿 Ayurvedic';
  const ty = window._ui.tab_yoga||'🧘 Yoga';
  const vcl = p.visual_clue ? `<div class="vis-clue"><span>${window._ui.visual_clue_label||'Visual Finding:'}</span>${p.visual_clue}</div>` : '';

  return `<div class="d-card${i===0?' top':''}" style="animation-delay:${i*.12}s">
    <div class="d-hdr">
      <div class="rank">${icons[i]||i+1}</div>
      <div class="d-name">${p.disease}</div>
      <div class="conf-badge">${p.confidence}% ${cm}</div>
    </div>
    <div class="conf-bar"><div class="conf-fill" data-w="${Math.min(p.confidence,100)}"></div></div>
    ${vcl}
    <div class="d-desc">${inf.description||''}</div>
    <div class="rtabs">
      <button class="rtab on" onclick="rtab('${uid}','food',this)">${tf}</button>
      <button class="rtab"    onclick="rtab('${uid}','med',this)">${tm}</button>
      <button class="rtab"    onclick="rtab('${uid}','ayur',this)">${ta}</button>
      <button class="rtab"    onclick="rtab('${uid}','yoga',this)">${ty}</button>
    </div>
    <div class="rpanel on"  id="${uid}-food"><ul class="rlist">${li(inf.foods,'food','🥗')}</ul></div>
    <div class="rpanel"     id="${uid}-med"><ul class="rlist">${li(inf.medicines,'med','💊')}</ul></div>
    <div class="rpanel"     id="${uid}-ayur"><ul class="rlist">${li(inf.ayurvedic,'ayur','🌿')}</ul></div>
    <div class="rpanel"     id="${uid}-yoga"><ul class="rlist">${li(inf.yoga,'yoga','🧘')}</ul></div>
  </div>`;
}

function rtab(uid,tab,btn){
  const card=btn.closest('.d-card');
  card.querySelectorAll('.rtab').forEach(t=>t.classList.remove('on'));
  card.querySelectorAll('.rpanel').forEach(p=>p.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById(uid+'-'+tab).classList.add('on');
}
</script>
</body>
</html>"""


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template_string(HTML, symptoms_json=SYMPTOMS, immunity_yoga_json=IMMUNITY_YOGA, langs_json=get_all_languages())

@app.route('/api/lang/<code>')
def api_lang(code):
    lang = get_lang(code)
    ui   = lang['ui']
    ui['speech_lang'] = lang.get('speech_lang', 'en-IN')
    return jsonify(ui)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        mode = data.get('mode', 'symptoms')

        # ── Image mode ────────────────────────────────────────────
        if mode == 'image':
            b64 = data.get('image', '')
            if not b64:
                return jsonify({"error": "No image data received.", "predictions": []})
            img_bytes = image_bytes_from_base64(b64)
            vis_results = analyze_image_for_disease(img_bytes)

            # Convert visual results to prediction format
            predictions = []
            matched = []
            for vr in vis_results:
                if vr['confidence'] == 0:
                    continue
                info = get_disease_info(vr['disease'])
                predictions.append({
                    "disease":      vr['disease'],
                    "confidence":   vr['confidence'],
                    "raw_prob":     vr['confidence'],
                    "visual_clue":  vr['visual_clue'],
                    "info":         info
                })

            if not predictions:
                return jsonify({
                    "error": "No visible disease markers found. Please enter symptoms manually.",
                    "predictions": []
                })
            return jsonify({"predictions": predictions, "matched_symptoms": [], "total_matched": 0})

        # ── Text / symptom mode ────────────────────────────────────
        if mode == 'text':
            matched = parse_symptoms_from_text(data.get('text', ''))
        else:
            matched = data.get('symptoms', [])

        if not matched:
            return jsonify({"error": "No recognisable symptoms found. Try more specific names.", "predictions": []})

        predictions = predict_disease(matched)
        return jsonify({"predictions": predictions, "matched_symptoms": matched[:12], "total_matched": len(matched)})

    except Exception as e:
        return jsonify({"error": str(e), "predictions": []})

@app.route('/api/symptoms')
def api_symptoms():
    return jsonify(SYMPTOMS)

@app.route('/api/diseases')
def api_diseases():
    return jsonify(DISEASES)


if __name__ == '__main__':
    print("=" * 58)
    print("  [MediSense] AI v2 - Disease Detection System")
    print("=" * 58)
    print(f"  ✅  ML Model  : {len(model.classes_)} disease classes")
    print(f"  ✅  Symptoms  : {len(SYMPTOMS)} features")
    print(f"  ✅  Languages : {len(LANGUAGES)} ({', '.join(LANGUAGES.keys())})")
    print(f"  ✅  Image CV  : OpenCV {__import__('cv2').__version__}")
    print(f"  🌐  Open      : http://localhost:5000")
    print("=" * 58)
    app.run(debug=True, host='0.0.0.0', port=5000)
