"""
Image-based Disease Detection
Uses OpenCV + PIL computer vision - NO API key required.
Detects visible skin/eye conditions via color, texture, and pattern analysis.
"""
import cv2
import numpy as np
from PIL import Image
import io


def analyze_image_for_disease(image_bytes: bytes) -> list:
    """
    Analyse an image using computer vision to detect visible conditions.
    Returns list of dicts: {disease, confidence, visual_clue}
    """
    try:
        img_pil = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_pil = img_pil.resize((500, 500), Image.LANCZOS)
    except Exception as e:
        return [{"disease": "invalid image", "confidence": 0, "visual_clue": f"Could not open image: {e}"}]

    img_np  = np.array(img_pil)
    img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    img_hsv = cv2.cvtColor(img_np, cv2.COLOR_RGB2HSV)
    gray    = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    H, S, V  = img_hsv[:,:,0], img_hsv[:,:,1], img_hsv[:,:,2]
    total_px = H.size
    results  = []

    # ── 1. Jaundice — yellow skin/sclera ─────────────────────────────────────
    yellow_mask = cv2.inRange(img_hsv, np.array([15, 60, 100]), np.array([38, 255, 255]))
    yellow_pct  = np.sum(yellow_mask > 0) / total_px
    if yellow_pct > 0.20:
        conf = int(min(40 + yellow_pct * 250, 94))
        results.append({
            "disease": "jaundice",
            "confidence": conf,
            "visual_clue": f"Yellow skin discoloration detected ({yellow_pct*100:.1f}% of image)"
        })

    # ── 2. Skin redness / inflammation ───────────────────────────────────────
    red_mask = (
        cv2.inRange(img_hsv, np.array([0, 70, 70]),   np.array([10, 255, 255])) |
        cv2.inRange(img_hsv, np.array([160, 70, 70]), np.array([180, 255, 255]))
    )
    red_pct = np.sum(red_mask > 0) / total_px
    if red_pct > 0.40:
        results.append({
            "disease": "eczema / severe skin rash",
            "confidence": int(min(55 + red_pct * 120, 91)),
            "visual_clue": f"Widespread skin redness detected ({red_pct*100:.1f}% of image)"
        })
    elif red_pct > 0.20:
        results.append({
            "disease": "rosacea / skin inflammation",
            "confidence": int(min(45 + red_pct * 130, 82)),
            "visual_clue": f"Moderate redness / inflammation ({red_pct*100:.1f}% of image)"
        })

    # ── 3. Pale skin — anemia / pallor ───────────────────────────────────────
    pale_mask = (S < 25) & (V > 185)
    pale_pct  = np.sum(pale_mask) / total_px
    if pale_pct > 0.60:
        results.append({
            "disease": "anemia / pallor",
            "confidence": int(min(40 + pale_pct * 90, 82)),
            "visual_clue": f"Unusually pale skin tone ({pale_pct*100:.1f}% pale pixels)"
        })

    # ── 4. Dark patches — hyperpigmentation / melanoma ───────────────────────
    dark_mask = (V < 55) & (S > 20)
    dark_pct  = np.sum(dark_mask) / total_px
    if 0.04 < dark_pct < 0.45:
        results.append({
            "disease": "hyperpigmentation / skin spots",
            "confidence": int(min(50 + dark_pct * 200, 84)),
            "visual_clue": f"Dark patches / irregular spots detected ({dark_pct*100:.1f}% of image)"
        })

    # ── 5. Cyanosis — bluish tint (low oxygen) ───────────────────────────────
    blue_mask = cv2.inRange(img_hsv, np.array([90, 40, 50]), np.array([135, 255, 210]))
    blue_pct  = np.sum(blue_mask > 0) / total_px
    if blue_pct > 0.18:
        results.append({
            "disease": "cyanosis (low blood oxygen)",
            "confidence": int(min(50 + blue_pct * 200, 87)),
            "visual_clue": f"Bluish skin discoloration detected ({blue_pct*100:.1f}% of image)"
        })

    # ── 6. Acne / pimples — circular lesion detection ────────────────────────
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)
    circles = cv2.HoughCircles(
        blurred, cv2.HOUGH_GRADIENT, dp=1, minDist=18,
        param1=50, param2=28, minRadius=3, maxRadius=22
    )
    if circles is not None:
        n = len(circles[0])
        if n >= 3:
            conf = int(min(48 + n * 4, 87))
            results.append({
                "disease": "acne vulgaris / pimples",
                "confidence": conf,
                "visual_clue": f"{n} circular skin lesions / pimples detected"
            })

    # ── 7. Eye redness — conjunctivitis ──────────────────────────────────────
    white_pct = np.sum((S < 30) & (V > 200)) / total_px
    if white_pct > 0.12 and red_pct > 0.04:
        results.append({
            "disease": "conjunctivitis / red eye",
            "confidence": 79,
            "visual_clue": "Eye redness pattern detected in image"
        })

    # ── 8. Psoriasis — rough scaly texture ───────────────────────────────────
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    if laplacian_var > 1800 and red_pct > 0.15:
        results.append({
            "disease": "psoriasis / scaly skin",
            "confidence": int(min(50 + laplacian_var / 80, 83)),
            "visual_clue": f"High skin texture variance ({laplacian_var:.0f}) with redness — psoriasis pattern"
        })

    # ── 9. Swelling / edema — asymmetric brightness ──────────────────────────
    left_mean  = V[:, :V.shape[1]//2].mean()
    right_mean = V[:, V.shape[1]//2:].mean()
    asymmetry  = abs(float(left_mean) - float(right_mean))
    if asymmetry > 35:
        results.append({
            "disease": "localised swelling / edema",
            "confidence": int(min(50 + asymmetry, 80)),
            "visual_clue": f"Asymmetric brightness ({asymmetry:.1f}) suggests localised swelling"
        })

    # ── 10. Burns / wounds — high contrast regions ───────────────────────────
    _, thresh = cv2.threshold(gray, 230, 255, cv2.THRESH_BINARY)
    burn_pct  = np.sum(thresh > 0) / total_px
    if 0.05 < burn_pct < 0.35 and laplacian_var > 1200:
        results.append({
            "disease": "skin burn / wound",
            "confidence": int(min(50 + burn_pct * 150, 80)),
            "visual_clue": f"High-contrast skin regions detected — possible burn/wound"
        })

    # Sort and limit
    results = sorted(results, key=lambda x: -x["confidence"])[:3]

    if not results:
        results = [{
            "disease": "no visible condition detected",
            "confidence": 0,
            "visual_clue": "No clear visual disease markers found in this image. Please enter symptoms manually or consult a doctor."
        }]

    return results


def image_bytes_from_base64(b64_string: str) -> bytes:
    """Strip data-URL prefix and decode base64."""
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    import base64
    return base64.b64decode(b64_string)
